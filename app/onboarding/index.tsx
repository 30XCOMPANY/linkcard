/**
 * [INPUT]: react-native, react-native-reanimated, @expo/vector-icons Ionicons,
 *          @/src/stores/cardStore, @/src/services/linkedin, @/src/types,
 *          @/src/lib/haptics, @/src/components/shared/adaptive-glass
 * [OUTPUT]: Four-page onboarding — welcome + intro pages + social connect
 * [POS]: Onboarding entry — brand welcome, feature intro, LinkedIn/Twitter connect
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { haptic } from "@/src/lib/haptics";
import { createNewCard, useCardStore } from "@/src/stores/cardStore";
import { fetchLinkedInProfile } from "@/src/services/linkedin";
import type { LinkedInProfile } from "@/src/types";

/* ── Page Data ─────────────────────────────────────────────── */

interface OnboardingPage {
  id: string;
  emoji?: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: "welcome",
    title: "Welcome to\nLinkCard",
    subtitle: "Your identity, amplified.",
    gradientFrom: "#1C1C1E",
  },
  {
    id: "identity",
    emoji: "🪪",
    title: "Your Digital\nBusiness Card",
    subtitle:
      "Import your professional identity and share it instantly — no paper, no friction.",
    gradientFrom: "#0055FF",
  },
  {
    id: "versions",
    emoji: "🎭",
    title: "One Profile,\nMany Faces",
    subtitle:
      "Create multiple card versions for networking, interviews, or casual meetups.",
    gradientFrom: "#FF5722",
  },
  {
    id: "connect",
    emoji: "🔗",
    title: "Connect Your\nProfiles",
    subtitle:
      "Link your social accounts to auto-import your professional details.",
    gradientFrom: "#00C853",
  },
];

const DEFAULT_PROFILE: LinkedInProfile = {
  url: "https://linkedin.com/in/demo",
  username: "demo",
  name: "Demo User",
  headline: "Professional Networking",
  company: "LinkCard",
  location: "San Francisco, CA",
  photoUrl: null,
  lastSynced: new Date(),
  checksum: "demo",
};

/* ── Intro Page (pages 1–3) ────────────────────────────────── */

function IntroPage({ page, width }: { page: OnboardingPage; width: number }) {
  const isWelcome = page.id === "welcome";

  return (
    <View style={[styles.page, { width }]}>
      <View
        style={[
          styles.gradientTop,
          {
            experimental_backgroundImage:
              `linear-gradient(to bottom, ${page.gradientFrom} 0%, ${page.gradientFrom}88 40%, rgba(255,255,255,0) 100%)`,
          } as any,
        ]}
      />
      <View style={isWelcome ? styles.welcomeContent : styles.introContent}>
        {isWelcome ? (
          <Image
            source={require("@/assets/lc-logo.svg")}
            style={styles.logo}
            contentFit="contain"
          />
        ) : page.emoji ? (
          <Text style={styles.emoji}>{page.emoji}</Text>
        ) : null}
        <Text
          selectable
          style={[styles.title, isWelcome && styles.titleCenter]}
        >
          {page.title}
        </Text>
        <Text
          selectable
          style={[styles.subtitle, isWelcome && styles.subtitleCenter]}
        >
          {page.subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ── Connect Page (page 4) ─────────────────────────────────── */

function ConnectPage({
  page,
  width,
  onConnectLinkedIn,
  onConnectTwitter,
  onSkip,
  isLoading,
}: {
  page: OnboardingPage;
  width: number;
  onConnectLinkedIn: (url: string) => void;
  onConnectTwitter: () => void;
  onSkip: () => void;
  isLoading: boolean;
}) {
  const [linkedInUrl, setLinkedInUrl] = useState("");

  return (
    <View style={[styles.page, { width }]}>
      <View
        style={[
          styles.gradientTop,
          {
            experimental_backgroundImage:
              `linear-gradient(to bottom, ${page.gradientFrom} 0%, ${page.gradientFrom}88 40%, rgba(255,255,255,0) 100%)`,
          } as any,
        ]}
      />

      <View style={styles.connectContent}>
        {page.emoji ? <Text style={styles.emoji}>{page.emoji}</Text> : null}
        <Text selectable style={styles.title}>
          {page.title}
        </Text>
        <Text selectable style={styles.subtitle}>
          {page.subtitle}
        </Text>

        <Animated.View
          entering={FadeInDown.delay(150).duration(350)}
          style={styles.connectCards}
        >
          {/* LinkedIn card */}
          <View style={styles.connectCard}>
            <View style={styles.connectCardHeader}>
              <View style={[styles.connectIconCircle, { backgroundColor: "#0A66C2" }]}>
                <Ionicons name="logo-linkedin" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.connectCardText}>
                <Text style={styles.connectCardTitle}>LinkedIn</Text>
                <Text style={styles.connectCardSub}>
                  Import your professional profile
                </Text>
              </View>
            </View>

            <View style={styles.urlInputWrap}>
              <TextInput
                style={styles.urlInput}
                placeholder="URL or username"
                placeholderTextColor="rgba(60,60,67,0.3)"
                value={linkedInUrl}
                onChangeText={setLinkedInUrl}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (linkedInUrl.trim()) onConnectLinkedIn(linkedInUrl.trim());
                }}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.connectBtn,
                { backgroundColor: "#0A66C2" },
                pressed && styles.btnPressed,
              ]}
              onPress={() => {
                if (linkedInUrl.trim()) {
                  onConnectLinkedIn(linkedInUrl.trim());
                } else {
                  haptic.error();
                }
              }}
              disabled={isLoading}
            >
              <Text style={styles.connectBtnText}>
                {isLoading ? "Importing…" : "Connect"}
              </Text>
            </Pressable>
          </View>

          {/* Twitter card */}
          <Pressable
            style={({ pressed }) => [
              styles.connectCard,
              styles.connectCardRow,
              pressed && styles.btnPressed,
            ]}
            onPress={onConnectTwitter}
          >
            <View style={styles.connectCardHeader}>
              <View style={[styles.connectIconCircle, { backgroundColor: "#000000" }]}>
                <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.connectCardText}>
                <Text style={styles.connectCardTitle}>Twitter / X</Text>
                <Text style={styles.connectCardSub}>Coming soon</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={PlatformColor("tertiaryLabel") as unknown as string}
            />
          </Pressable>
        </Animated.View>

        <Pressable onPress={onSkip} style={styles.skipBtn} hitSlop={12}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Dot Indicator ─────────────────────────────────────────── */

function PageDots({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

/* ── Main Screen ───────────────────────────────────────────── */

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const setCard = useCardStore((s) => s.setCard);
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLastPage = activeIndex === PAGES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goNext = useCallback(() => {
    if (activeIndex < PAGES.length - 1) {
      haptic.light();
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    }
  }, [activeIndex]);

  const enterApp = useCallback(
    (profile: LinkedInProfile) => {
      const card = createNewCard(profile);
      setCard(card);
    },
    [setCard]
  );

  const handleConnectLinkedIn = useCallback(
    async (url: string) => {
      setIsLoading(true);
      haptic.medium();
      try {
        const profile = await fetchLinkedInProfile(url);
        haptic.success();
        enterApp(profile);
      } catch (err) {
        setIsLoading(false);
        haptic.error();
        Alert.alert(
          "Import Failed",
          err instanceof Error
            ? err.message
            : "Could not fetch LinkedIn profile. Try again or skip."
        );
      }
    },
    [enterApp]
  );

  const handleConnectTwitter = useCallback(() => {
    haptic.light();
    Alert.alert(
      "Coming Soon",
      "Twitter import will be available in a future update."
    );
  }, []);

  const handleSkip = useCallback(() => {
    haptic.light();
    enterApp(DEFAULT_PROFILE);
  }, [enterApp]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) =>
          item.id === "connect" ? (
            <ConnectPage
              page={item}
              width={width}
              onConnectLinkedIn={handleConnectLinkedIn}
              onConnectTwitter={handleConnectTwitter}
              onSkip={handleSkip}
              isLoading={isLoading}
            />
          ) : (
            <IntroPage page={item} width={width} />
          )
        }
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <PageDots count={PAGES.length} activeIndex={activeIndex} />

        {!isLastPage ? (
          <Animated.View
            key="next"
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable onPress={goNext}>
              <AdaptiveGlass
                style={styles.nextBtn}
                glassEffectStyle="regular"
                tintColor={PAGES[activeIndex].gradientFrom + "A0"}
                intensity={50}
                blurTint="dark"
                fallbackColor={PAGES[activeIndex].gradientFrom}
              >
                <Text style={styles.nextBtnText}>Next</Text>
              </AdaptiveGlass>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.nextBtnPlaceholder} />
        )}
      </View>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* ── Page shell ─────────────────────── */
  page: {
    flex: 1,
  },
  gradientTop: {
    height: 360,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  /* ── Welcome page ────────────────────── */
  welcomeContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    height: 80,
    marginBottom: 28,
    width: 90,
  },
  titleCenter: {
    textAlign: "center",
  },
  subtitleCenter: {
    maxWidth: undefined,
    textAlign: "center",
  },

  /* ── Intro pages ────────────────────── */
  introContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    color: PlatformColor("label") as unknown as string,
    fontFamily: "GoudyBookletter1911_400Regular",
    fontSize: 38,
    letterSpacing: -0.3,
    lineHeight: 46,
    marginBottom: 14,
  },
  subtitle: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 320,
  },

  /* ── Connect page ───────────────────── */
  connectContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  connectCards: {
    gap: 16,
    marginTop: 28,
  },
  connectCard: {
    backgroundColor: PlatformColor(
      "secondarySystemGroupedBackground"
    ) as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 16,
    gap: 14,
    padding: 18,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  connectCardRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  connectCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  connectIconCircle: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  connectCardText: {
    flex: 1,
    gap: 2,
  },
  connectCardTitle: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 17,
    fontWeight: "600",
  },
  connectCardSub: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 14,
  },
  urlInputWrap: {
    backgroundColor: PlatformColor(
      "tertiarySystemFill"
    ) as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  urlInput: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 16,
  },
  connectBtn: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  connectBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.85,
  },
  skipBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    minHeight: 44,
  },
  skipText: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 15,
  },

  /* ── Bottom bar ─────────────────────── */
  bottomBar: {
    alignItems: "center",
    gap: 20,
    paddingBottom: 50,
    paddingTop: 16,
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
    backgroundColor: PlatformColor("label") as unknown as string,
  },
  dotInactive: {
    backgroundColor: PlatformColor("quaternaryLabel") as unknown as string,
  },
  nextBtn: {
    alignItems: "center" as const,
    borderCurve: "continuous" as any,
    borderRadius: 25,
    justifyContent: "center" as const,
    minHeight: 50,
    minWidth: 200,
    overflow: "hidden" as const,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  nextBtnPlaceholder: {
    height: 50,
  },
});
