/**
 * [INPUT]: expo-router Stack, react-native KeyboardAvoidingView/Pressable/Text/TextInput/View/Alert/Image/Keyboard,
 *          react-native-reanimated FadeIn, expo-image-picker, expo-image Image,
 *          @/src/stores/cardStore, @/src/services/linkedin, @/src/components/shared/avatar,
 *          @/src/components/shared/adaptive-glass, @/src/lib/card-presets, @/src/lib/haptics,
 *          @/src/lib/platform-color, @/src/lib/semantic-colors, @/src/lib/theme, @/src/lib/name-fonts, @/src/types
 * [OUTPUT]: OnboardingScreen — immersive single-screen identity builder with progressive card preview and focused-field reveal
 * [POS]: Onboarding entry — welcome splash → 6 steps → card creation, owns half-sheet keyboard avoidance and step-local scrolling
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn, FadeInUp, FadeOut,
  runOnJS,
  useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Stack } from "expo-router/stack";

import { Avatar } from "@/src/components/shared/avatar";
import { GlassButton, SecondaryButton } from "@/src/components/shared/glass-button";
import { useCardStore } from "@/src/stores/cardStore";
import { createCardFromOnboardingDraft } from "@/src/lib/onboarding-card";
import { fetchLinkedInProfile } from "@/src/services/linkedin";
import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { useSemanticColors } from "@/src/lib/semantic-colors";
import { useResolvedTheme } from "@/src/lib/theme";
import type { ContactActionType, LinkedInProfile, OnboardingDraft, OnboardingPersonalityAxes } from "@/src/types";

/* ── Constants ─────────────────────────────────────────────── */

type StepKey = "welcome" | "claim" | "location" | "role" | "signature" | "vibe" | "reach" | "review";
type PersonalityAxisKey = keyof OnboardingPersonalityAxes;

const BUILDER_STEPS: StepKey[] = ["claim", "role", "signature", "location", "vibe", "reach", "review"];
const STEP_KEYBOARD_OFFSET = 130;
const FOCUS_SCROLL_MARGIN = 24;
const ROLE_SCROLL_FALLBACK_Y = 220;

const PERSONALITY_QUESTIONS: Array<{
  key: PersonalityAxisKey;
  title: string;
  left: { label: string; value: OnboardingPersonalityAxes[PersonalityAxisKey] };
  right: { label: string; value: OnboardingPersonalityAxes[PersonalityAxisKey] };
}> = [
  { key: "energy", title: "Energy", left: { label: "🤝 With people", value: "people" }, right: { label: "🧘 Solo", value: "solo" } },
  { key: "focus", title: "Focus", left: { label: "📊 Facts", value: "facts" }, right: { label: "🔮 Possibilities", value: "possibilities" } },
  { key: "decision", title: "Decisions", left: { label: "🧠 Logic", value: "logic" }, right: { label: "💛 People", value: "people" } },
  { key: "rhythm", title: "Rhythm", left: { label: "📋 Plan ahead", value: "plan" }, right: { label: "🌊 Adapt", value: "adapt" } },
];

const TRAITS = ["Curious", "Warm", "Sharp", "Calm", "Bold", "Thoughtful", "Playful", "Grounded"] as const;
const INTERESTS = ["AI", "Design", "Startups", "Products", "Research", "Writing", "Investing", "Communities", "Dev Tools", "Brand"] as const;

const CONTACT_METHODS: Array<{
  type: ContactActionType;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "url";
}> = [
  { type: "email", label: "Email", placeholder: "name@company.com", keyboardType: "email-address" },
  { type: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you", keyboardType: "url" },
  { type: "url", label: "Website", placeholder: "yourwebsite.com", keyboardType: "url" },
  { type: "wechat", label: "WeChat", placeholder: "your WeChat ID" },
];

const EMPTY_DRAFT: OnboardingDraft = {
  name: "", photoUrl: null, jobTitle: "", company: "", headline: "",
  location: "", personalityAxes: {}, traits: [], interests: [],
  primaryContactAction: undefined, contactValue: "",
};

/* ── Shared Primitives ─────────────────────────────────────── */

function ChoiceCard({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
      <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
        <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text>
        {selected && <Image source={"sf:checkmark" as any} style={styles.choiceCheck} tintColor="#FFFFFF" />}
      </View>
    </Pressable>
  );
}

function Chip({ label, selected, chipBg, onPress }: { label: string; selected: boolean; chipBg: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
      <View style={[styles.chip, { backgroundColor: selected ? platformColor("systemBlue") : chipBg }]}>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
      </View>
    </Pressable>
  );
}

/* ── Blur Title Animation ──────────────────────────────────── */

function BlurWord({ word, delay }: { word: string; delay: number }) {
  const blur = useSharedValue(8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    blur.value = withDelay(delay, withTiming(0, { duration: 350 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 250 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    filter: `blur(${blur.value}px)`,
  }));

  return (
    <Animated.Text style={[styles.stepTitle, style as any]}>
      {word}{" "}
    </Animated.Text>
  );
}

function BlurTitle({ text, key: k }: { text: string; key?: string }) {
  const words = text.split(" ");
  return (
    <View style={styles.blurTitleRow} key={k}>
      {words.map((word, i) => (
        <BlurWord key={`${k}-${word}-${i}`} word={word} delay={i * 80} />
      ))}
    </View>
  );
}

/* ── Progressive Preview ───────────────────────────────────── */

function CardPreview({ draft }: { draft: OnboardingDraft }) {
  const hasName = draft.name.trim().length > 0;
  const hasPhoto = Boolean(draft.photoUrl);
  const hasTitle = draft.jobTitle.trim().length > 0;
  const hasHeadline = draft.headline.trim().length > 0;
  const hasLocation = draft.location.trim().length > 0;

  if (!hasName && !hasPhoto) {
    return (
      <View style={styles.previewEmpty}>
        <Image source={require("@/assets/lc-logo.svg")} style={styles.previewLogo} contentFit="contain" />
      </View>
    );
  }

  return (
    <View style={styles.previewCard}>
      {hasPhoto && (
        <Avatar source={draft.photoUrl} name={draft.name || "?"} size={120} glassPadding={8} glassIntensity={18} />
      )}
      {hasName && (
        <Text style={styles.previewName} numberOfLines={1}>{draft.name}</Text>
      )}
      {hasTitle && (
        <Text style={styles.previewRole} numberOfLines={1}>
          {draft.company ? `${draft.jobTitle} · ${draft.company}` : draft.jobTitle}
        </Text>
      )}
      {hasLocation && (
        <Text style={styles.previewLocation} numberOfLines={1}>📍 {draft.location}</Text>
      )}
      {hasHeadline && (
        <Text style={styles.previewHeadline} numberOfLines={2}>{draft.headline}</Text>
      )}
    </View>
  );
}

/* ── Main Screen ───────────────────────────────────────────── */

export default function OnboardingScreen() {
  const setCard = useCardStore((s) => s.setCard);
  const sc = useSemanticColors();
  const resolvedTheme = useResolvedTheme();
  const dark = resolvedTheme === "dark";

  const [step, setStep] = useState<StepKey>("welcome");
  const [vibeStage, setVibeStage] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [linkedInInput, setLinkedInInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedProfile, setImportedProfile] = useState<LinkedInProfile | null>(null);

  const stepIndex = BUILDER_STEPS.indexOf(step);
  const jobTitleRef = useRef<TextInput>(null);
  const companyRef = useRef<TextInput>(null);
  const roleScrollRef = useRef<ScrollView>(null);
  const reachInputRef = useRef<TextInput>(null);
  const reachScrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const canContinue = useMemo(() => {
    switch (step) {
      case "claim": return draft.name.trim().length > 0;
      case "location": return true;
      case "role": return draft.jobTitle.trim().length > 0;
      case "signature": return draft.headline.trim().length > 0;
      case "vibe":
        if (vibeStage === PERSONALITY_QUESTIONS.length) return draft.traits.length >= 2;
        if (vibeStage === PERSONALITY_QUESTIONS.length + 1) return draft.interests.length >= 1;
        return true;
      case "reach": return Boolean(draft.primaryContactAction && draft.contactValue.trim());
      case "review": return Boolean(draft.name.trim() && draft.jobTitle.trim() && draft.headline.trim());
      default: return false;
    }
  }, [draft, step, vibeStage]);

  const setField = useCallback(<K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) => {
    setDraft((c) => ({ ...c, [field]: value }));
  }, []);

  React.useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollRoleInputIntoView = useCallback((input: TextInput | null, fallbackY?: number) => {
    const scrollResponder = roleScrollRef.current?.getScrollResponder?.();
    const inputHandle = input ? findNodeHandle(input) : null;
    const runFallback = () => {
      if (typeof fallbackY !== "number") return;
      roleScrollRef.current?.scrollTo({ y: fallbackY, animated: true });
    };

    if (!scrollResponder || !inputHandle) {
      runFallback();
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
          inputHandle,
          FOCUS_SCROLL_MARGIN,
          true
        );
        runFallback();
      }, 80);
    });
  }, []);

  const scrollReachInputIntoView = useCallback((input: TextInput | null, fallbackY?: number) => {
    const scrollResponder = reachScrollRef.current?.getScrollResponder?.();
    const inputHandle = input ? findNodeHandle(input) : null;
    const runFallback = () => {
      if (typeof fallbackY !== "number") return;
      reachScrollRef.current?.scrollTo({ y: fallbackY, animated: true });
    };

    if (!scrollResponder || !inputHandle) {
      runFallback();
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
          inputHandle,
          FOCUS_SCROLL_MARGIN,
          true
        );
        runFallback();
      }, 80);
    });
  }, []);

  const roleKeyboardPadding = keyboardHeight > 0
    ? Math.max(16, keyboardHeight - STEP_KEYBOARD_OFFSET + FOCUS_SCROLL_MARGIN * 2)
    : 16;

  const goNext = useCallback(() => {
    if (!canContinue) { haptic.warning(); return; }
    haptic.light();    if (step === "vibe" && vibeStage < PERSONALITY_QUESTIONS.length + 1) {
      setVibeStage((c) => c + 1);
      return;
    }
    const i = BUILDER_STEPS.indexOf(step);
    if (i < BUILDER_STEPS.length - 1) setStep(BUILDER_STEPS[i + 1]);
  }, [canContinue, step, vibeStage]);

  const goBack = useCallback(() => {
    if (step === "vibe" && vibeStage > 0) { haptic.selection(); setVibeStage((c) => c - 1); return; }
    const i = BUILDER_STEPS.indexOf(step);
    if (i > 0) { haptic.selection(); setStep(BUILDER_STEPS[i - 1]); }
    else { haptic.selection(); setStep("welcome"); }
  }, [step, vibeStage]);

  const skipVibe = useCallback(() => {
    haptic.light();
    setStep("reach");
  }, []);

  const handleLocationRequest = useCallback(async () => {
    haptic.light();
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { goNext(); return; }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [geo] = await Location.reverseGeocodeAsync(pos.coords);
      if (!geo) { goNext(); return; }

      const city = geo.city || geo.district || "";
      const region = geo.region || "";
      const location = [city, region].filter(Boolean).join(", ");
      if (location) {
        setDraft((c) => ({ ...c, location }));
        haptic.success();
      }
      goNext();
    } catch {
      goNext();
    }
  }, [goNext]);

  const handlePhotoPick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [1, 1], mediaTypes: ["images"], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) { haptic.selection(); setField("photoUrl", result.assets[0].uri); }
  }, [setField]);

  const handleAxisSelect = useCallback(
    (key: PersonalityAxisKey, value: OnboardingPersonalityAxes[PersonalityAxisKey]) => {
      haptic.selection();
      setDraft((c) => ({ ...c, personalityAxes: { ...c.personalityAxes, [key]: value } }));
      setTimeout(() => {
               if (vibeStage < PERSONALITY_QUESTIONS.length - 1) setVibeStage((c) => c + 1);
        else setVibeStage(PERSONALITY_QUESTIONS.length);
      }, 400);
    },
    [vibeStage]
  );

  const toggleSelection = useCallback((field: "traits" | "interests", value: string, limit: number) => {
    setDraft((c) => {
      const arr = c[field];
      if (arr.includes(value)) { haptic.selection(); return { ...c, [field]: arr.filter((v) => v !== value) }; }
      if (arr.length >= limit) { haptic.warning(); return c; }
      haptic.selection();
      return { ...c, [field]: [...arr, value] };
    });
  }, []);

  const handleImportLinkedIn = useCallback(async () => {
    if (!linkedInInput.trim()) { haptic.warning(); Alert.alert("LinkedIn URL", "Paste your URL first."); return; }
    setIsImporting(true); haptic.medium();
    try {
      const profile = await fetchLinkedInProfile(linkedInInput.trim());
      setImportedProfile(profile); haptic.success();
      const facts = [profile.photoUrl && "photo", profile.socialLinks?.length && "links", profile.website && "website"].filter(Boolean);
      Alert.alert("Imported", facts.length ? `Added ${facts.join(", ")}.` : "Connected.");
    } catch (e) {
      haptic.error(); Alert.alert("Failed", e instanceof Error ? e.message : "Try again later.");
    } finally { setIsImporting(false); }
  }, [linkedInInput]);

  const handleCreate = useCallback(() => {
    if (!canContinue) { haptic.warning(); return; }
    const card = createCardFromOnboardingDraft(draft, { importedProfile: importedProfile ?? undefined });
    setCard(card); haptic.success();
    // Root layout gate handles navigation when card is set
  }, [canContinue, draft, importedProfile, setCard]);

  /* ── Welcome ────────────────────────────────────────────── */

  /* Welcome is ALWAYS dark — brand identity, not theme-dependent */
  if (step === "welcome") {
    return (
      <View style={[styles.welcomeContainer, { backgroundColor: "#05070B" }]}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Hero image — always dark variant */}
        <Image
          source={require("@/assets/onboarding-hero.jpg")}
          style={styles.welcomeHero}
          contentFit="cover"
        />
        <View style={[styles.welcomeHeroFade, {
          experimental_backgroundImage: "linear-gradient(to bottom, transparent 0%, rgba(5,7,11,1) 100%)",
        } as any]} />

        {/* Content overlay */}
        <View style={styles.welcomeContent}>
          <View style={{ flex: 1 }} />

          <Animated.View entering={FadeIn.duration(600)} style={styles.welcomeLogoWrap}>
            <Image
              source={require("@/assets/lc-logo.svg")}
              style={styles.welcomeLogo}
              contentFit="contain"
              tintColor="#FFFFFF"
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.welcomeTextBlock}>
            <Text style={[styles.welcomeTitle, { color: "#FFFFFF" }]}>LinkCard</Text>
            <Text style={[styles.welcomeSubtitle, { color: "rgba(255,255,255,0.68)" }]}>Your identity, amplified.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.welcomeCta}>
            <Pressable
              onPress={() => { haptic.medium(); setStep("claim"); }}
              style={({ pressed }) => [pressed && { opacity: 0.88 }]}
            >
              <View
                style={[
                  styles.welcomeButton,
                  {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderColor: "rgba(255,255,255,0.18)",
                    boxShadow: "0 18px 56px rgba(0,0,0,0.40)",
                  },
                ]}
              >
                <Text style={[styles.welcomeButtonLabel, { color: "#0A0A0A" }]}>Get Started</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  /* ── Builder Steps ──────────────────────────────────────── */

  const renderStepContent = () => {
    switch (step) {
      case "claim":
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <BlurTitle text="Your name" />
            <Animated.View entering={FadeIn.delay(250).duration(200)} style={styles.stepContent}>
              <View style={styles.inputCard}>
                <TextInput autoCapitalize="words" autoCorrect={false} autoFocus
                  onChangeText={(v) => setField("name", v)} placeholder="Full name"
                  placeholderTextColor={platformColor("placeholderText")} style={styles.textInput} value={draft.name}
                  returnKeyType="done"
                />
              </View>
            </Animated.View>
          </ScrollView>
        );

      case "location":
        return (
          <>
            <BlurTitle text="Where are you" />
            <Text style={styles.permExplain}>
              Your city shows on your card. Just city-level, nothing more.
            </Text>
            <Animated.View entering={FadeIn.delay(300).duration(200)} style={styles.stepContent}>
              {/* Simulated iOS 26 permission sheet (display only) */}
              <View style={[styles.permSheet, { backgroundColor: sc.permSheetBg, boxShadow: sc.permShadow } as any]}>
                {/* Placeholder title bars */}
                <View style={styles.permPlaceholders}>
                  <View style={[styles.permBar, { width: "80%", height: 14, backgroundColor: sc.permBarBg }]} />
                  <View style={[styles.permBar, { width: "55%", height: 14, backgroundColor: sc.permBarBg }]} />
                </View>
                {/* Placeholder description bars */}
                <View style={styles.permPlaceholders}>
                  <View style={[styles.permBar, { width: "90%", height: 10, backgroundColor: sc.permBarBg }]} />
                  <View style={[styles.permBar, { width: "65%", height: 10, backgroundColor: sc.permBarBg }]} />
                </View>

                <View style={styles.permBtns}>
                  <View style={[styles.permBtn, { backgroundColor: sc.permBtnBg }]}>
                    <Text style={styles.permBtnLabel}>Allow Once</Text>
                  </View>
                  <View style={[styles.permBtn, { backgroundColor: sc.permBtnHighlightBg }]}>
                    <Text style={[styles.permBtnLabel, { color: platformColor("systemBlue") }]}>Allow While Using App</Text>
                  </View>
                  <View style={[styles.permBtn, { backgroundColor: sc.permBtnBg }]}>
                    <Text style={[styles.permBtnLabel, { fontWeight: "400" }]}>Don't Allow</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </>
        );

      case "role":
        return (
          <ScrollView
            ref={roleScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 16, paddingBottom: roleKeyboardPadding }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <BlurTitle text="What you do" />
            <Animated.View entering={FadeIn.delay(320).duration(200)} style={styles.stepContent}>
              <View style={styles.inputCard}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput ref={jobTitleRef} autoCapitalize="words" autoCorrect={false} autoFocus
                  onChangeText={(v) => setField("jobTitle", v)} placeholder="Founder, Designer..."
                  placeholderTextColor={platformColor("placeholderText")} style={styles.textInput} value={draft.jobTitle}
                  onFocus={() => scrollRoleInputIntoView(jobTitleRef.current, 0)}
                  returnKeyType="next" onSubmitEditing={() => companyRef.current?.focus()}
                />
              </View>
              <View style={styles.inputCard}>
                <Text style={styles.fieldLabel}>Company</Text>
                <TextInput ref={companyRef} autoCapitalize="words" autoCorrect={false}
                  onChangeText={(v) => setField("company", v)} placeholder="Optional"
                  placeholderTextColor={platformColor("placeholderText")} style={styles.textInput} value={draft.company}
                  onFocus={() => scrollRoleInputIntoView(companyRef.current, ROLE_SCROLL_FALLBACK_Y)}
                  returnKeyType="next" onSubmitEditing={() => { if (draft.jobTitle.trim()) goNext(); }}
                />
              </View>
            </Animated.View>
          </ScrollView>
        );

      case "signature":
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <BlurTitle text="One-liner" />
            <Animated.View entering={FadeIn.delay(200).duration(200)} style={styles.stepContent}>
              <View style={styles.inputCard}>
                <TextInput autoCapitalize="sentences" autoFocus multiline blurOnSubmit
                  onChangeText={(v) => setField("headline", v)}
                  placeholder="What should people remember you for?"
                  placeholderTextColor={platformColor("placeholderText")}
                  style={[styles.textInput, { minHeight: 72, textAlignVertical: "top" as any }]}
                  value={draft.headline}
                  returnKeyType="next" onSubmitEditing={() => { if (draft.headline.trim()) goNext(); }}
                />
              </View>
            </Animated.View>
          </ScrollView>
        );

      case "vibe": {
        if (vibeStage < PERSONALITY_QUESTIONS.length) {
          const q = PERSONALITY_QUESTIONS[vibeStage];
          const sel = draft.personalityAxes[q.key];
          return (
            <>
              <Text style={styles.stepEyebrow}>{vibeStage + 1} / {PERSONALITY_QUESTIONS.length + 2}</Text>
              <BlurTitle text={q.title} />
              <Animated.View entering={FadeIn.delay(200).duration(200)} style={styles.vibeChoices}>
                <Pressable onPress={() => handleAxisSelect(q.key, q.left.value)} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
                  <View style={styles.vibeCard}>
                    <Text style={styles.vibeCardLabel}>{q.left.label}</Text>
                    {sel === q.left.value && (
                      <Image
                        source={"sf:checkmark" as any}
                        style={styles.vibeCheck}
                        tintColor={platformColor("systemBlue")}
                      />
                    )}
                  </View>
                </Pressable>
                <Pressable onPress={() => handleAxisSelect(q.key, q.right.value)} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
                  <View style={styles.vibeCard}>
                    <Text style={styles.vibeCardLabel}>{q.right.label}</Text>
                    {sel === q.right.value && (
                      <Image
                        source={"sf:checkmark" as any}
                        style={styles.vibeCheck}
                        tintColor={platformColor("systemBlue")}
                      />
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            </>
          );
        }
        if (vibeStage === PERSONALITY_QUESTIONS.length) {
          return (
            <>
              <Text style={styles.stepEyebrow}>5 / {PERSONALITY_QUESTIONS.length + 2}</Text>
              <BlurTitle text="Pick 2 traits" />
              <Animated.View entering={FadeIn.delay(320).duration(200)} style={styles.chipsWrap}>
                {TRAITS.map((t) => <Chip key={t} label={t} chipBg={sc.chipBg} selected={draft.traits.includes(t)} onPress={() => toggleSelection("traits", t, 2)} />)}
              </Animated.View>
            </>
          );
        }
        return (
          <>
            <Text style={styles.stepEyebrow}>6 / {PERSONALITY_QUESTIONS.length + 2}</Text>
            <BlurTitle text="Interests" />
            <Animated.View entering={FadeIn.delay(200).duration(200)} style={styles.chipsWrap}>
              {INTERESTS.map((t) => <Chip key={t} label={t} chipBg={sc.chipBg} selected={draft.interests.includes(t)} onPress={() => toggleSelection("interests", t, 99)} />)}
            </Animated.View>
          </>
        );
      }

      case "reach": {
        const active = CONTACT_METHODS.find((m) => m.type === draft.primaryContactAction);
        return (
          <ScrollView
            ref={reachScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 16, paddingBottom: roleKeyboardPadding }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <BlurTitle text="How to find you" />
            <View style={styles.choicesCol}>
              {CONTACT_METHODS.map((m) => (
                <ChoiceCard key={m.type} label={m.label}
                  selected={draft.primaryContactAction === m.type}
                  onPress={() => { haptic.selection(); setDraft((c) => ({ ...c, primaryContactAction: m.type, contactValue: c.primaryContactAction === m.type ? c.contactValue : "" })); }}
                />
              ))}
            </View>
            {active && (
              <View style={styles.inputCard}>
                <TextInput ref={reachInputRef} autoCapitalize="none" autoCorrect={false} autoFocus
                  keyboardType={active.keyboardType ?? "default"}
                  onChangeText={(v) => setField("contactValue", v)}
                  placeholder={active.placeholder} placeholderTextColor={platformColor("placeholderText")}
                  style={styles.textInput} value={draft.contactValue}
                  onFocus={() => scrollReachInputIntoView(reachInputRef.current, ROLE_SCROLL_FALLBACK_Y)}
                  returnKeyType="next" onSubmitEditing={() => { if (draft.contactValue.trim()) goNext(); }}
                />
              </View>
            )}
          </ScrollView>
        );
      }

      case "review":
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <BlurTitle text="Ready" />
            <View style={styles.inputCard}>
              <Text style={styles.fieldLabel}>LinkedIn (optional)</Text>
              <View style={styles.inlineRow}>
                <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="url"
                  onChangeText={setLinkedInInput} placeholder="linkedin.com/in/you"
                  placeholderTextColor={platformColor("placeholderText")} style={[styles.textInput, { flex: 1 }]}
                  value={linkedInInput}
                  returnKeyType="go" onSubmitEditing={() => { if (linkedInInput.trim()) handleImportLinkedIn(); }}
                />
                <Pressable disabled={isImporting} onPress={handleImportLinkedIn}>
                  <View style={[styles.inlineAction, isImporting && { opacity: 0.6 }]}>
                    <Text style={styles.inlineActionLabel}>{isImporting ? "..." : "Import"}</Text>
                  </View>
                </Pressable>
              </View>
              {importedProfile && (
                <Text style={styles.importSuccess}>Imported successfully.</Text>
              )}
            </View>
          </ScrollView>
        );

      default: return null;
    }
  };

  const swipeBack = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => { runOnJS(goBack)(); });
  const swipeForward = Gesture.Fling().direction(Directions.LEFT).onEnd(() => { if (canContinue) runOnJS(goNext)(); });
  const swipe = Gesture.Race(swipeBack, swipeForward);

  return (
    <GestureDetector gesture={swipe}>
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Brand banner with progressive blur ────────────── */}
      <View style={styles.bannerWrap}>
        <Image
          source={dark ? require("@/assets/onboarding-hero.jpg") : require("@/assets/onboarding-banner.png")}
          style={styles.bannerImage}
          contentFit="cover"
        />
        <BlurView intensity={15}  tint="default" style={[styles.bannerBlur, { top: "30%", opacity: 0.15 }]} />
        <BlurView intensity={30}  tint="default" style={[styles.bannerBlur, { top: "38%", opacity: 0.25 }]} />
        <BlurView intensity={50}  tint="default" style={[styles.bannerBlur, { top: "46%", opacity: 0.35 }]} />
        <BlurView intensity={70}  tint="default" style={[styles.bannerBlur, { top: "54%", opacity: 0.50 }]} />
        <BlurView intensity={85}  tint="default" style={[styles.bannerBlur, { top: "62%", opacity: 0.65 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "70%", opacity: 0.80 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "78%", opacity: 0.90 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "86%", opacity: 1.0  }]} />
        <LinearGradient
          colors={["transparent", sc.bannerFadeStart, sc.bannerFadeMid, sc.bannerFadeEnd]}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.bannerFade}
        />
      </View>

      {/* ── Preview overlay on banner (hidden during vibe) ── */}
      {step !== "vibe" && step !== "location" && (
        <View style={styles.previewZone}>
          <CardPreview draft={draft} />
        </View>
      )}

      {/* ── Bottom: Step Content + CTA ────────────────────── */}
      <Animated.View
        exiting={FadeOut.duration(150)}
        key={`${step}-${vibeStage}`}
        style={[styles.stepZone, (step === "vibe" || step === "location") && styles.stepZoneExpanded]}
      >
        <KeyboardAvoidingView
          style={[{ flex: 1 }, (step === "vibe" || step === "location") && { justifyContent: "center" }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={STEP_KEYBOARD_OFFSET}
        >
          {renderStepContent()}
        </KeyboardAvoidingView>

        <View style={styles.ctaBlock}>
          <View style={styles.dotsCenter}>
            {BUILDER_STEPS.map((s, i) => (
              <View key={s} style={[styles.dot, i === stepIndex ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
          {step === "claim" ? (
            draft.photoUrl ? (
              <>
                <GlassButton label="Next" onPress={goNext} disabled={!canContinue} />
                <SecondaryButton label="Change picture" onPress={handlePhotoPick} />
              </>
            ) : (
              <>
                <GlassButton label="Add profile picture" onPress={handlePhotoPick} disabled={!canContinue} />
                {canContinue && <SecondaryButton label="Skip for now" onPress={goNext} />}
              </>
            )
          ) : step === "location" ? (
            <>
              <GlassButton label="Enable location" onPress={handleLocationRequest} />
              <SecondaryButton label="Skip" onPress={goNext} />
            </>
          ) : (
            <>
              <GlassButton
                label={step === "review" ? "Create card" : "Next"}
                onPress={step === "review" ? handleCreate : goNext}
                disabled={!canContinue}
              />
              {step === "vibe" && <SecondaryButton label="Skip" onPress={skipVibe} />}
            </>
          )}
        </View>
      </Animated.View>
    </View>
    </GestureDetector>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Welcome */
  welcomeContainer: { flex: 1 },
  welcomeHero: {
    position: "absolute", top: 0, left: 0, right: 0, height: "70%",
  },
  welcomeHeroFade: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  },
  welcomeContent: {
    flex: 1, alignItems: "center", justifyContent: "flex-end",
    paddingBottom: 56, paddingHorizontal: 24,
  },
  welcomeLogoWrap: { width: 80, height: 72, marginBottom: 16 },
  welcomeLogo: { width: 80, height: 72 },
  welcomeTextBlock: { alignItems: "center", marginBottom: 40 },
  welcomeTitle: {
    fontFamily: "GoudyBookletter1911_400Regular",
    fontSize: 42, textAlign: "center",
  },
  welcomeSubtitle: { fontSize: 17, textAlign: "center", marginTop: 8 },
  welcomeCta: { width: "100%" },
  welcomeButton: {
    alignItems: "center",
    borderCurve: "continuous" as any, borderRadius: 16,
    justifyContent: "center", minHeight: 52,
    borderWidth: 1,
  },
  welcomeButtonLabel: { fontSize: 17, fontWeight: "600" },

  /* Builder layout */
  container: { flex: 1, backgroundColor: platformColor("systemGroupedBackground") },

  bannerWrap: {
    position: "absolute", top: 0, left: 0, right: 0, height: "55%", zIndex: 0,
  },
  bannerImage: { width: "100%", height: "100%" },
  bannerBlur: {
    position: "absolute", left: 0, right: 0, bottom: 0,
  },
  bannerFade: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: "100%",
  },

  previewZone: {
    flex: 382, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, paddingTop: 60, zIndex: 1,
  },
  previewEmpty: { alignItems: "center", justifyContent: "center" },
  previewLogo: { width: 56, height: 50, opacity: 0.15 },
  previewCard: { alignItems: "center", gap: 8 },
  previewName: {
    color: platformColor("label"),
    fontFamily: "GoudyBookletter1911_400Regular",
    fontSize: 28,
  },
  previewRole: { color: platformColor("secondaryLabel"), fontSize: 15 },
  previewLocation: { color: platformColor("secondaryLabel"), fontSize: 14 },

  permSheet: {
    borderRadius: 24, borderCurve: "continuous" as any,
    padding: 16, gap: 12, marginTop: 32,
  },
  permPlaceholders: { gap: 6 },
  permBar: { borderRadius: 99 },
  permBtns: { gap: 8, paddingTop: 4 },
  permBtn: {
    alignItems: "center", justifyContent: "center",
    borderRadius: 999, borderCurve: "continuous" as any, minHeight: 46,
  },
  permBtnLabel: { color: platformColor("label"), fontSize: 17, fontWeight: "600" },
  permExplain: {
    color: platformColor("secondaryLabel"), fontSize: 14, lineHeight: 20,
  },
  previewHeadline: {
    color: platformColor("secondaryLabel"), fontSize: 14,
    textAlign: "center", lineHeight: 20, maxWidth: 280,
  },

  dotsCenter: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: platformColor("label") },
  dotInactive: { backgroundColor: platformColor("quaternaryLabel") },

  stepZone: { paddingHorizontal: 24, paddingBottom: 40, gap: 16, flex: 618 },
  stepZoneExpanded: { flex: 1 },
  stepContent: { gap: 16 },
  blurTitleRow: { flexDirection: "row", flexWrap: "wrap" },

  stepEyebrow: {
    color: platformColor("secondaryLabel"), fontSize: 13,
    fontWeight: "600", textTransform: "uppercase",
  },
  stepTitle: {
    color: platformColor("label"), fontFamily: "GoudyBookletter1911_400Regular",
    fontSize: 32, letterSpacing: -0.4,
  },
  inputCard: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any, borderRadius: 16, gap: 8, padding: 16,
  },
  fieldLabel: {
    color: platformColor("secondaryLabel"), fontSize: 13,
    fontWeight: "600", textTransform: "uppercase",
  },
  textInput: {
    color: platformColor("label"), fontSize: 17, lineHeight: 22, minHeight: 22, padding: 0,
  },

  vibeChoices: { gap: 12, marginTop: 16 },
  vibeCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any,
    borderRadius: 16, minHeight: 56, paddingHorizontal: 20,
  },
  vibeCardLabel: {
    color: platformColor("label"), fontSize: 18, fontWeight: "600",
  },
  vibeCheck: { width: 22, height: 22 },

  choicesCol: { gap: 10 },
  choiceCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderColor: "transparent", borderCurve: "continuous" as any,
    borderRadius: 16, borderWidth: 1.5, padding: 16,
  },
  choiceCardSelected: {
    backgroundColor: platformColor("systemBlue"),
    borderColor: platformColor("systemBlue"),
  },
  choiceLabel: { color: platformColor("label"), fontSize: 17, fontWeight: "600" },
  choiceLabelSelected: { color: "#FFFFFF" },
  choiceCheck: { width: 18, height: 18 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  chip: {
    borderCurve: "continuous" as any, borderRadius: 999,
    justifyContent: "center", minHeight: 36, paddingHorizontal: 14,
    overflow: "hidden" as any,
  },
  chipSelected: {},
  chipLabel: { color: platformColor("label"), fontSize: 14, fontWeight: "600" },
  chipLabelSelected: { color: "#FFFFFF" },

  inlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  inlineAction: {
    alignItems: "center", backgroundColor: platformColor("systemFill"),
    borderCurve: "continuous" as any, borderRadius: 10,
    justifyContent: "center", minHeight: 40, paddingHorizontal: 14,
  },
  inlineActionLabel: { color: platformColor("label"), fontSize: 15, fontWeight: "600" },
  importSuccess: { color: platformColor("secondaryLabel"), fontSize: 13 },

  ctaBlock: { gap: 12, marginTop: "auto" },
});
