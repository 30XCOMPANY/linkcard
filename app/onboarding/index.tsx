/**
 * [INPUT]: expo-router useRouter, react-native ScrollView/Pressable/Text/TextInput/View/Alert,
 *          react-native-reanimated FadeIn, expo-image-picker, @/src/stores/cardStore,
 *          @/src/services/linkedin, @/src/components/card/profile-card, @/src/components/shared/adaptive-glass,
 *          @/src/lib/card-presets, @/src/lib/haptics, @/src/lib/platform-color, @/src/types
 * [OUTPUT]: OnboardingScreen — single-path identity builder with live card preview, personality tuning, and optional LinkedIn enrichment
 * [POS]: Onboarding entry — creates the first card through ownership, role, vibe, reachability, and review instead of intro slides
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { createCardFromOnboardingDraft, createProfileFromOnboardingDraft, useCardStore } from "@/src/stores/cardStore";
import { fetchLinkedInProfile } from "@/src/services/linkedin";
import { createDefaultCardVersions } from "@/src/lib/card-presets";
import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import type { ContactAction, ContactActionType, LinkedInProfile, OnboardingDraft, OnboardingPersonalityAxes } from "@/src/types";

type StepKey = "claim" | "role" | "signature" | "vibe" | "reach" | "review";
type PersonalityAxisKey = keyof OnboardingPersonalityAxes;

const STEPS: StepKey[] = ["claim", "role", "signature", "vibe", "reach", "review"];

const PERSONALITY_QUESTIONS: Array<{
  key: PersonalityAxisKey;
  title: string;
  left: { label: string; value: OnboardingPersonalityAxes[PersonalityAxisKey] };
  right: { label: string; value: OnboardingPersonalityAxes[PersonalityAxisKey] };
}> = [
  {
    key: "energy",
    title: "Energy",
    left: { label: "With people", value: "people" },
    right: { label: "Solo", value: "solo" },
  },
  {
    key: "focus",
    title: "Focus",
    left: { label: "Facts", value: "facts" },
    right: { label: "Possibilities", value: "possibilities" },
  },
  {
    key: "decision",
    title: "Decisions",
    left: { label: "Logic", value: "logic" },
    right: { label: "People", value: "people" },
  },
  {
    key: "rhythm",
    title: "Rhythm",
    left: { label: "Plan ahead", value: "plan" },
    right: { label: "Adapt", value: "adapt" },
  },
];

const TRAIT_OPTIONS = [
  "Curious",
  "Warm",
  "Sharp",
  "Calm",
  "Bold",
  "Thoughtful",
  "Playful",
  "Grounded",
] as const;

const INTEREST_OPTIONS = [
  "AI",
  "Design",
  "Startups",
  "Products",
  "Research",
  "Writing",
  "Investing",
  "Communities",
  "Developer Tools",
  "Brand",
] as const;

const CONTACT_METHODS: Array<{
  type: ContactActionType;
  label: string;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "url";
  autoCapitalize?: "none" | "words" | "sentences";
}> = [
  {
    type: "email",
    label: "Email",
    placeholder: "name@company.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/you",
    keyboardType: "url",
    autoCapitalize: "none",
  },
  {
    type: "url",
    label: "Website",
    placeholder: "yourwebsite.com",
    keyboardType: "url",
    autoCapitalize: "none",
  },
  {
    type: "wechat",
    label: "WeChat",
    placeholder: "your WeChat ID",
    keyboardType: "default",
    autoCapitalize: "none",
  },
];

const EMPTY_DRAFT: OnboardingDraft = {
  name: "",
  photoUrl: null,
  jobTitle: "",
  company: "",
  headline: "",
  location: "",
  personalityAxes: {},
  traits: [],
  interests: [],
  primaryContactAction: undefined,
  contactValue: "",
};

function StepDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.dotsRow}>
      {STEPS.map((step, index) => (
        <View
          key={step}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress}>
      <AdaptiveGlass
        style={StyleSheet.flatten([styles.primaryButton, disabled && styles.primaryButtonDisabled])}
        glassEffectStyle="regular"
        tintColor={disabled ? "#8E8E93" : "#111827"}
        intensity={42}
        blurTint="dark"
        fallbackColor={disabled ? "#C7C7CC" : "#111827"}
      >
        <Text selectable style={styles.primaryButtonLabel}>
          {label}
        </Text>
      </AdaptiveGlass>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable hitSlop={12} onPress={onPress} style={styles.secondaryButton}>
      <Text selectable style={styles.secondaryButtonLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function ChoiceCard({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={[styles.choiceCard, selected && styles.choiceCardSelected]}>
        <Text selectable style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text selectable style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const buildPreviewContactAction = (draft: OnboardingDraft, profile: LinkedInProfile): ContactAction | undefined => {
  switch (draft.primaryContactAction) {
    case "email":
      return profile.email
        ? { type: "email", label: "Email Me", value: profile.email }
        : undefined;
    case "linkedin":
      return profile.url
        ? { type: "linkedin", label: "Connect on LinkedIn", value: profile.url }
        : undefined;
    case "url":
      return profile.website
        ? { type: "url", label: "Visit Website", value: profile.website }
        : undefined;
    case "wechat":
      return draft.contactValue.trim()
        ? { type: "wechat", label: "Add on WeChat", value: draft.contactValue.trim() }
        : undefined;
    default:
      return undefined;
  }
};

const summarizeImportedProfile = (profile: LinkedInProfile): string => {
  const facts = [
    profile.photoUrl ? "photo" : null,
    profile.socialLinks?.length ? "social links" : null,
    profile.publications?.length ? "publications" : null,
    profile.website ? "website" : null,
  ].filter(Boolean);

  return facts.length > 0
    ? `Added ${facts.join(", ")} without overwriting your core identity.`
    : "LinkedIn is connected and ready to enrich later.";
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const setCard = useCardStore((s) => s.setCard);

  const [stepIndex, setStepIndex] = useState(0);
  const [vibeStage, setVibeStage] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [linkedInInput, setLinkedInInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedProfile, setImportedProfile] = useState<LinkedInProfile | null>(null);

  const previewVersion = useMemo(() => {
    const base = createDefaultCardVersions()[0];
    return {
      ...base,
      visibleFields: Array.from(
        new Set([...base.visibleFields, "website", "email"])
      ) as typeof base.visibleFields,
    };
  }, []);

  const previewProfile = useMemo(
    () => createProfileFromOnboardingDraft(draft, importedProfile ?? undefined),
    [draft, importedProfile]
  );

  const previewContactAction = useMemo(
    () => buildPreviewContactAction(draft, previewProfile),
    [draft, previewProfile]
  );

  const step = STEPS[stepIndex];

  const canContinue = useMemo(() => {
    switch (step) {
      case "claim":
        return draft.name.trim().length > 0;
      case "role":
        return draft.jobTitle.trim().length > 0;
      case "signature":
        return draft.headline.trim().length > 0;
      case "vibe":
        if (vibeStage === PERSONALITY_QUESTIONS.length) {
          return draft.traits.length >= 2;
        }
        if (vibeStage === PERSONALITY_QUESTIONS.length + 1) {
          return draft.interests.length >= 2;
        }
        return true;
      case "reach":
        return Boolean(draft.primaryContactAction && draft.contactValue.trim());
      case "review":
        return Boolean(draft.name.trim() && draft.jobTitle.trim() && draft.headline.trim() && draft.primaryContactAction && draft.contactValue.trim());
      default:
        return false;
    }
  }, [draft, step, vibeStage]);

  const setField = useCallback(<K extends keyof OnboardingDraft>(field: K, value: OnboardingDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  }, []);

  const advanceStep = useCallback(() => {
    if (!canContinue) {
      haptic.warning();
      return;
    }

    haptic.light();
    if (step === "vibe" && vibeStage === PERSONALITY_QUESTIONS.length) {
      setVibeStage((current) => current + 1);
      return;
    }

    if (step === "vibe" && vibeStage === PERSONALITY_QUESTIONS.length + 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
    }
  }, [canContinue, step, stepIndex, vibeStage]);

  const handleBack = useCallback(() => {
    if (step === "vibe" && vibeStage > 0) {
      haptic.selection();
      setVibeStage((current) => current - 1);
      return;
    }

    if (stepIndex > 0) {
      haptic.selection();
      setStepIndex((current) => current - 1);
    }
  }, [step, stepIndex, vibeStage]);

  const handlePhotoPick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      haptic.selection();
      setField("photoUrl", result.assets[0].uri);
    }
  }, [setField]);

  const handleAxisSelect = useCallback(
    (key: PersonalityAxisKey, value: OnboardingPersonalityAxes[PersonalityAxisKey]) => {
      haptic.selection();
      setDraft((current) => ({
        ...current,
        personalityAxes: {
          ...current.personalityAxes,
          [key]: value,
        },
      }));

      if (vibeStage < PERSONALITY_QUESTIONS.length - 1) {
        setVibeStage((current) => current + 1);
      } else {
        setVibeStage(PERSONALITY_QUESTIONS.length);
      }
    },
    [vibeStage]
  );

  const toggleSelection = useCallback(
    (field: "traits" | "interests", value: string, limit: number) => {
      setDraft((current) => {
        const active = current[field];
        const exists = active.includes(value);

        if (exists) {
          haptic.selection();
          return {
            ...current,
            [field]: active.filter((item) => item !== value),
          };
        }

        if (active.length >= limit) {
          haptic.warning();
          return current;
        }

        haptic.selection();
        return {
          ...current,
          [field]: [...active, value],
        };
      });
    },
    []
  );

  const handleImportLinkedIn = useCallback(async () => {
    if (!linkedInInput.trim()) {
      haptic.warning();
      Alert.alert("Add a LinkedIn URL", "Paste your LinkedIn URL or username first.");
      return;
    }

    setIsImporting(true);
    haptic.medium();

    try {
      const profile = await fetchLinkedInProfile(linkedInInput.trim());
      setImportedProfile(profile);
      haptic.success();
      Alert.alert("LinkedIn Added", summarizeImportedProfile(profile));
    } catch (error) {
      haptic.error();
      Alert.alert(
        "Import Failed",
        error instanceof Error
          ? error.message
          : "We couldn’t fetch your LinkedIn profile right now."
      );
    } finally {
      setIsImporting(false);
    }
  }, [linkedInInput]);

  const handleCreateCard = useCallback(() => {
    if (!canContinue) {
      haptic.warning();
      return;
    }

    const card = createCardFromOnboardingDraft(draft, {
      importedProfile: importedProfile ?? undefined,
    });

    setCard(card);
    haptic.success();
    router.replace("/(tabs)" as any);
  }, [canContinue, draft, importedProfile, router, setCard]);

  const renderClaim = () => (
    <View style={styles.stepBody}>
      <Text selectable style={styles.stepTitle}>Your name</Text>

      <View style={styles.groupCard}>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          onChangeText={(value) => setField("name", value)}
          placeholder="Full name"
          placeholderTextColor="rgba(60,60,67,0.45)"
          style={styles.textInput}
          value={draft.name}
        />
      </View>

      <Pressable onPress={handlePhotoPick} style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={styles.photoButton}>
          <Text selectable style={styles.photoButtonLabel}>
            {draft.photoUrl ? "Change photo" : "Add photo"}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  const renderRole = () => (
    <View style={styles.stepBody}>
      <Text selectable style={styles.stepTitle}>What you do</Text>

      <View style={styles.groupCard}>
        <Text selectable style={styles.fieldLabel}>Title</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          onChangeText={(value) => setField("jobTitle", value)}
          placeholder="Founder, Designer, Engineer..."
          placeholderTextColor="rgba(60,60,67,0.45)"
          style={styles.textInput}
          value={draft.jobTitle}
        />
      </View>

      <View style={styles.groupCard}>
        <Text selectable style={styles.fieldLabel}>Company</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={(value) => setField("company", value)}
          placeholder="Optional"
          placeholderTextColor="rgba(60,60,67,0.45)"
          style={styles.textInput}
          value={draft.company}
        />
      </View>
    </View>
  );

  const renderSignature = () => (
    <View style={styles.stepBody}>
      <Text selectable style={styles.stepTitle}>One-liner</Text>

      <View style={styles.groupCard}>
        <TextInput
          autoCapitalize="sentences"
          autoFocus
          multiline
          onChangeText={(value) => setField("headline", value)}
          placeholder="What should people remember you for?"
          placeholderTextColor="rgba(60,60,67,0.45)"
          style={[styles.textInput, styles.multilineInput]}
          value={draft.headline}
        />
      </View>
    </View>
  );

  const skipVibe = useCallback(() => {
    haptic.light();
    setStepIndex((current) => current + 1);
  }, []);

  const renderVibe = () => {
    if (vibeStage < PERSONALITY_QUESTIONS.length) {
      const question = PERSONALITY_QUESTIONS[vibeStage];
      const selected = draft.personalityAxes[question.key];
      return (
        <View style={styles.stepBody}>
          <Text selectable style={styles.stepEyebrow}>
            {question.title} ({vibeStage + 1}/{PERSONALITY_QUESTIONS.length + 2})
          </Text>
          <Text selectable style={styles.stepTitle}>Vibe check</Text>

          <View style={styles.choicesColumn}>
            <ChoiceCard
              label={question.left.label}
              onPress={() => handleAxisSelect(question.key, question.left.value)}
              selected={selected === question.left.value}
            />
            <ChoiceCard
              label={question.right.label}
              onPress={() => handleAxisSelect(question.key, question.right.value)}
              selected={selected === question.right.value}
            />
          </View>
        </View>
      );
    }

    if (vibeStage === PERSONALITY_QUESTIONS.length) {
      return (
        <View style={styles.stepBody}>
          <Text selectable style={styles.stepEyebrow}>
            Traits (5/{PERSONALITY_QUESTIONS.length + 2})
          </Text>
          <Text selectable style={styles.stepTitle}>Pick 2</Text>

          <View style={styles.chipsWrap}>
            {TRAIT_OPTIONS.map((trait) => (
              <SelectChip
                key={trait}
                label={trait}
                onPress={() => toggleSelection("traits", trait, 2)}
                selected={draft.traits.includes(trait)}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepBody}>
        <Text selectable style={styles.stepEyebrow}>
          Interests (6/{PERSONALITY_QUESTIONS.length + 2})
        </Text>
        <Text selectable style={styles.stepTitle}>Pick 2–3</Text>

        <View style={styles.chipsWrap}>
          {INTEREST_OPTIONS.map((interest) => (
            <SelectChip
              key={interest}
              label={interest}
              onPress={() => toggleSelection("interests", interest, 3)}
              selected={draft.interests.includes(interest)}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderReach = () => {
    const activeMethod = CONTACT_METHODS.find(
      (method) => method.type === draft.primaryContactAction
    );

    return (
      <View style={styles.stepBody}>
        <Text selectable style={styles.stepTitle}>Reach</Text>

        <View style={styles.choicesColumn}>
          {CONTACT_METHODS.map((method) => (
            <ChoiceCard
              label={method.label}
              key={method.type}
              onPress={() => {
                haptic.selection();
                setDraft((current) => ({
                  ...current,
                  primaryContactAction: method.type,
                  contactValue:
                    current.primaryContactAction === method.type
                      ? current.contactValue
                      : "",
                }));
              }}
              selected={draft.primaryContactAction === method.type}
            />
          ))}
        </View>

        {activeMethod ? (
          <View style={styles.groupCard}>
            <TextInput
              autoCapitalize={activeMethod.autoCapitalize ?? "none"}
              autoCorrect={false}
              autoFocus
              keyboardType={activeMethod.keyboardType ?? "default"}
              onChangeText={(value) => setField("contactValue", value)}
              placeholder={activeMethod.placeholder}
              placeholderTextColor="rgba(60,60,67,0.45)"
              style={styles.textInput}
              value={draft.contactValue}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderReview = () => (
    <View style={styles.stepBody}>
      <Text selectable style={styles.stepTitle}>Ready</Text>

      <View style={styles.reviewCard}>
        <Text selectable style={styles.reviewLabel}>LinkedIn (optional)</Text>

        <View style={styles.inlineInputRow}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setLinkedInInput}
            placeholder="linkedin.com/in/you"
            placeholderTextColor="rgba(60,60,67,0.45)"
            style={[styles.textInput, styles.inlineInput]}
            value={linkedInInput}
          />
          <Pressable
            disabled={isImporting}
            onPress={handleImportLinkedIn}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View style={[styles.inlineActionButton, isImporting && styles.inlineActionButtonDisabled]}>
              <Text selectable style={styles.inlineActionLabel}>
                {isImporting ? "..." : "Import"}
              </Text>
            </View>
          </Pressable>
        </View>

        {importedProfile ? (
          <Text selectable style={styles.reviewSuccess}>
            {summarizeImportedProfile(importedProfile)}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.previewWrap}>
          <View style={[styles.previewFrame, { maxWidth: Math.min(width - 32, 420) }]}>
            <ProfileCard
              contactAction={previewContactAction}
              profile={previewProfile}
              version={previewVersion}
            />
          </View>
        </View>

        <View style={styles.chromeRow}>
          <SecondaryButton label="Back" onPress={handleBack} />
          <StepDots activeIndex={stepIndex} />
          <View style={styles.chromeSpacer} />
        </View>

        <Animated.View entering={FadeIn.duration(180)} key={`${step}-${vibeStage}`}>
          {step === "claim" ? renderClaim() : null}
          {step === "role" ? renderRole() : null}
          {step === "signature" ? renderSignature() : null}
          {step === "vibe" ? renderVibe() : null}
          {step === "reach" ? renderReach() : null}
          {step === "review" ? renderReview() : null}
        </Animated.View>

        <View style={styles.ctaBlock}>
          {step === "review" ? (
            <PrimaryButton
              disabled={!canContinue}
              label="Create card"
              onPress={handleCreateCard}
            />
          ) : (
            <PrimaryButton
              disabled={!canContinue}
              label="Next"
              onPress={advanceStep}
            />
          )}

          {step === "vibe" ? (
            <SecondaryButton label="Skip" onPress={skipVibe} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: platformColor("systemGroupedBackground"),
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 48,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  previewWrap: {
    alignItems: "center",
  },
  previewFrame: {
    width: "100%",
  },
  chromeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 28,
  },
  chromeSpacer: {
    width: 52,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: platformColor("label"),
  },
  dotInactive: {
    backgroundColor: platformColor("quaternaryLabel"),
  },
  stepBody: {
    gap: 18,
  },
  stepEyebrow: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  stepTitle: {
    color: platformColor("label"),
    fontFamily: "GoudyBookletter1911_400Regular",
    fontSize: 36,
    letterSpacing: -0.4,
    lineHeight: 42,
  },
  groupCard: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any,
    borderRadius: 18,
    gap: 10,
    padding: 18,
  },
  fieldLabel: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  textInput: {
    color: platformColor("label"),
    fontSize: 18,
    lineHeight: 24,
    minHeight: 24,
    padding: 0,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 2,
    textAlignVertical: "top",
  },
  photoButton: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any,
    borderRadius: 999,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  photoButtonLabel: {
    color: platformColor("label"),
    fontSize: 15,
    fontWeight: "600",
  },
  choicesColumn: {
    gap: 12,
  },
  choiceCard: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderColor: "transparent",
    borderCurve: "continuous" as any,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 6,
    padding: 18,
  },
  choiceCardSelected: {
    backgroundColor: "#EEF4FF",
    borderColor: "#0066CC",
  },
  choiceTitle: {
    color: platformColor("label"),
    fontSize: 18,
    fontWeight: "600",
  },
  choiceTitleSelected: {
    color: "#0A4FB3",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderColor: "transparent",
    borderCurve: "continuous" as any,
    borderRadius: 999,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  chipSelected: {
    backgroundColor: "#EEF4FF",
    borderColor: "#0066CC",
  },
  chipLabel: {
    color: platformColor("label"),
    fontSize: 15,
    fontWeight: "600",
  },
  chipLabelSelected: {
    color: "#0A4FB3",
  },
  reviewCard: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any,
    borderRadius: 18,
    gap: 12,
    padding: 18,
  },
  reviewLabel: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  inlineInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  inlineInput: {
    flex: 1,
  },
  inlineActionButton: {
    alignItems: "center",
    backgroundColor: platformColor("systemFill"),
    borderCurve: "continuous" as any,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
  },
  inlineActionButtonDisabled: {
    opacity: 0.6,
  },
  inlineActionLabel: {
    color: platformColor("label"),
    fontSize: 15,
    fontWeight: "600",
  },
  reviewSuccess: {
    color: platformColor("secondaryLabel"),
    fontSize: 14,
    lineHeight: 20,
  },
  ctaBlock: {
    gap: 14,
    marginTop: 4,
  },
  primaryButton: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 54,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  secondaryButtonLabel: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.88,
  },
});
