/**
 * [INPUT]: @/src/tw (View, Text, Pressable, TextInput), @/src/lib/haptics haptic,
 *          @/src/lib/springs springs, @/src/services/linkedin fetchLinkedInProfile,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass
 * [OUTPUT]: LinkedIn URL input screen — fetches profile, navigates to preview
 * [POS]: Onboarding step 2 — single input, bottom bar CTA, bridges auth → preview
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { View, Text, ScrollView, Pressable, TextInput } from "@/src/tw";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { fetchLinkedInProfile } from "@/src/services/linkedin";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { setOnboardingProfile } from "@/app/onboarding/_shared";

// ── Component ────────────────────────────────────────────────

export default function LinkedInScreen() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Spring scale for CTA button
  const buttonScale = useSharedValue(1);

  // Shake animation
  const shakeX = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX]);

  // ── Handler ──────────────────────────────────────────────

  const handleImport = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a LinkedIn URL or username");
      haptic.error();
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);
    haptic.medium();

    try {
      const profile = await fetchLinkedInProfile(url);

      // Store profile data in shared module for preview screen
      setOnboardingProfile(profile);

      setIsLoading(false);
      haptic.success();
      router.push("./preview" as any);
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof Error ? err.message : "Failed to fetch LinkedIn profile"
      );
      haptic.error();
      triggerShake();
    }
  }, [url, router, triggerShake]);

  // ── Render ───────────────────────────────────────────────

  return (
    <View className="flex-1 bg-sf-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow pt-8 pb-32"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[480px] self-center px-6">
          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              selectable
              className="text-3xl font-semibold tracking-tight text-sf-text text-center mb-2"
            >
              Add your LinkedIn.
            </Text>
            <Text
              selectable
              className="text-sm text-sf-text-2 text-center"
            >
              Link your LinkedIn, we'll do the rest.
            </Text>
          </Animated.View>

          {/* Spacer */}
          <View className="h-10" />

          {/* LinkedIn URL Input */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={shakeStyle}
          >
            <Text className="text-xs font-medium uppercase tracking-widest text-sf-text-2 mb-2">
              LINKEDIN URL
            </Text>
            <View
              className={`bg-sf-card rounded-xl border px-4 py-3.5 ${
                error
                  ? "border-sf-red"
                  : inputFocused
                    ? "border-sf-text"
                    : "border-sf-card-border"
              }`}
            >
              <TextInput
                className="text-base text-sf-text"
                placeholder="https://linkedin.com/in/username"
                placeholderTextColor="rgba(60,60,67,0.3)"
                value={url}
                onChangeText={(t: string) => {
                  setUrl(t);
                  setError(null);
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                textContentType="URL"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Error Message */}
            {error && (
              <Text className="text-xs text-sf-red mt-2">{error}</Text>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <AdaptiveGlass>
          <View className="px-6 pt-4 pb-8 max-w-[480px] self-center w-full">
            <Animated.View style={buttonStyle}>
              <Pressable
                className={`w-full h-[52px] rounded-full bg-sf-text items-center justify-center min-h-[44px] min-w-[44px] ${
                  isLoading ? "opacity-80" : ""
                }`}
                onPress={handleImport}
                onPressIn={() => {
                  buttonScale.value = withSpring(0.97, springs.snappy);
                }}
                onPressOut={() => {
                  buttonScale.value = withSpring(1, springs.snappy);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-xs font-medium tracking-wide text-sf-bg uppercase">
                    Import Profile
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </View>
        </AdaptiveGlass>
      </Animated.View>
    </View>
  );
}
