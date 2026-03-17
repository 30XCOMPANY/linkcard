/**
 * [INPUT]: @/src/tw (View, Text, ScrollView, Pressable), @/src/lib/haptics haptic,
 *          @/src/lib/springs springs, @/src/stores/cardStore (useCardStore, createNewCard),
 *          @/src/components/shared/avatar Avatar, @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/types/cardComponents extractComponentsFromProfile
 * [OUTPUT]: Profile preview screen — displays extracted data, confirms and enters app
 * [POS]: Onboarding step 3 — final confirmation before card creation + smart theme
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { useCardStore, createNewCard } from "@/src/stores/cardStore";
import { Avatar } from "@/src/components/shared/avatar";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { extractComponentsFromProfile } from "@/src/types/cardComponents";
import { LinkedInProfile } from "@/src/types";
import { getOnboardingProfile } from "@/app/onboarding/_shared";

// ── Component ────────────────────────────────────────────────

export default function PreviewScreen() {
  const router = useRouter();
  const { setCard } = useCardStore();

  // Retrieve profile from shared module
  const profile = getOnboardingProfile();

  // Extract components for display
  const components = useMemo(() => {
    if (!profile) return [];
    return extractComponentsFromProfile(profile);
  }, [profile]);

  // Derived data
  const photoComponent = useMemo(
    () => components.find((c) => c.id === "photo"),
    [components]
  );
  const nameComponent = useMemo(
    () => components.find((c) => c.id === "name"),
    [components]
  );
  const jobTitleComponent = useMemo(
    () => components.find((c) => c.id === "jobTitle"),
    [components]
  );
  const companyComponent = useMemo(
    () => components.find((c) => c.id === "company"),
    [components]
  );
  const characterComponent = useMemo(
    () => components.find((c) => c.id === "character"),
    [components]
  );
  const headlineComponent = useMemo(
    () => components.find((c) => c.id === "headline"),
    [components]
  );
  const emailComponent = useMemo(
    () => components.find((c) => c.id === "email"),
    [components]
  );

  // CTA button spring
  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // ── Smart Theme Selection ────────────────────────────────

  const selectTheme = useCallback((data: LinkedInProfile): string => {
    const headline = (data.headline || "").toLowerCase();
    const character = (data.character || "").toLowerCase();
    const jobTitle = (data.jobTitle || "").toLowerCase();
    const combined = `${headline} ${character} ${jobTitle}`;

    if (
      combined.match(
        /tech|innovation|digital|ai|software|engineer|developer|data/
      )
    ) {
      return "freshBlue";
    }
    if (combined.match(/design|creative|art|visual|brand|ux|ui/)) {
      return "v7Classic";
    }
    return "lightGlass";
  }, []);

  // ── Handler ──────────────────────────────────────────────

  const handleGoHome = useCallback(() => {
    if (!profile) return;

    haptic.success();

    const linkedInData: LinkedInProfile = {
      url: profile.url ?? `https://linkedin.com/in/${profile.username ?? ""}`,
      username: profile.username ?? "",
      name: profile.name ?? "",
      headline: profile.headline ?? "",
      jobTitle: profile.jobTitle,
      company: profile.company ?? "",
      location: profile.location ?? "",
      city: profile.city,
      photoUrl: profile.photoUrl ?? null,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      character: profile.character,
      publications: profile.publications,
      lastSynced: new Date(),
      checksum: profile.checksum ?? Date.now().toString(),
    };

    const newCard = createNewCard(linkedInData);
    setCard(newCard);

    // Smart theme
    const theme = selectTheme(linkedInData);
    useCardStore.getState().setCurrentGradient(theme);

    router.replace("/(tabs)" as any);
  }, [profile, setCard, selectTheme, router]);

  // ── Empty guard ──────────────────────────────────────────

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-body text-sf-text-2">
          No profile data found. Go back and try again.
        </Text>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────

  const stagger = (idx: number) =>
    FadeInDown.delay(idx * 60)
      .springify()
      .stiffness(springs.gentle.stiffness)
      .damping(springs.gentle.damping);

  return (
    <View className="flex-1 bg-sf-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-8 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[680px] self-center px-5">
          {/* Title */}
          <Animated.View entering={stagger(1)}>
            <Text
              selectable
              className="text-title-2 font-semibold text-sf-text text-center mb-1"
            >
              Here's what we found
            </Text>
            <Text
              selectable
              className="text-subheadline text-sf-text-2 text-center mb-8"
            >
              Your professional information has been captured
            </Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={stagger(3)}>
            <View
              className="bg-sf-card rounded-[10px] p-5"
              style={{
                borderCurve: "continuous" as any,
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Header: Avatar + Name + Role */}
              <Animated.View entering={stagger(4)}>
                <View className="flex-row mb-6 gap-4">
                  <Avatar
                    source={photoComponent?.content.imageUrl}
                    name={nameComponent?.content.text ?? ""}
                    size={72}
                  />
                  <View className="flex-1 justify-center">
                    {nameComponent?.content.text && (
                      <Text
                        selectable
                        className="text-title-3 font-semibold text-sf-text tracking-tight mb-1"
                      >
                        {nameComponent.content.text}
                      </Text>
                    )}
                    {(jobTitleComponent || companyComponent) && (
                      <View className="flex-row items-center flex-wrap gap-1">
                        {jobTitleComponent?.content.text && (
                          <View>
                            <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-0.5">
                              Job Title
                            </Text>
                            <Text
                              selectable
                              className="text-subheadline font-medium text-sf-text"
                            >
                              {jobTitleComponent.content.text}
                            </Text>
                          </View>
                        )}
                        {jobTitleComponent && companyComponent && (
                          <Text className="text-sf-text-2 mx-1">·</Text>
                        )}
                        {companyComponent?.content.text && (
                          <View>
                            <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-0.5">
                              Company
                            </Text>
                            <Text
                              selectable
                              className="text-subheadline text-sf-text"
                            >
                              {companyComponent.content.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>

              {/* Character Tags */}
              {characterComponent?.content.text && (
                <Animated.View entering={stagger(6)}>
                  <View className="border-t border-sf-separator pt-5 mb-5">
                    <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-3">
                      Character
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {characterComponent.content.text
                        .split(",")
                        .map((tag: string, idx: number) => {
                          const trimmed = tag.trim();
                          if (!trimmed) return null;
                          return (
                            <View
                              key={idx}
                              className="bg-sf-bg-2 rounded-full px-3 py-1"
                            >
                              <Text
                                selectable
                                className="text-subheadline text-sf-text"
                              >
                                {trimmed}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* About (headline) */}
              {headlineComponent?.content.text && (
                <Animated.View entering={stagger(7)}>
                  <View className="border-t border-sf-separator pt-5 mb-5">
                    <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-3">
                      About
                    </Text>
                    <Text
                      selectable
                      className="text-subheadline text-sf-text leading-relaxed"
                    >
                      {headlineComponent.content.text}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Email */}
              {emailComponent?.content.value && (
                <Animated.View entering={stagger(8)}>
                  <View className="border-t border-sf-separator pt-5">
                    <Text selectable className="text-footnote text-sf-text-2">
                      {emailComponent.content.value}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <Animated.View
        entering={FadeInUp.delay(500)
          .springify()
          .stiffness(springs.gentle.stiffness)
          .damping(springs.gentle.damping)}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <AdaptiveGlass>
          <View className="px-5 pt-4 pb-8 max-w-[480px] self-center w-full">
            <Animated.View style={buttonStyle}>
              <Pressable
                className="w-full h-[50px] rounded-full bg-sf-text items-center justify-center min-h-[44px] min-w-[44px]"
                onPress={handleGoHome}
                onPressIn={() => {
                  buttonScale.value = withSpring(0.97, springs.snappy);
                }}
                onPressOut={() => {
                  buttonScale.value = withSpring(1, springs.snappy);
                }}
              >
                <Text className="text-caption-1 font-medium tracking-wide text-sf-bg">
                  Go home
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </AdaptiveGlass>
      </Animated.View>
    </View>
  );
}
