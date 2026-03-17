/**
 * [INPUT]: @/src/tw (View, Text, ScrollView, Pressable, TextInput), @/src/tw/image Image,
 *          @/src/lib/haptics haptic, @/src/lib/springs springs, expo-router
 * [OUTPUT]: Auth screen — email/password login + Google OAuth entry point
 * [POS]: Onboarding step 1 — signs user in, then pushes to linkedin screen
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { View, Text, ScrollView, Pressable, TextInput } from "@/src/tw";
import { Image } from "@/src/tw/image";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";

// ── Constants ────────────────────────────────────────────────

const isWeb = process.env.EXPO_OS === "web";

// ── Component ────────────────────────────────────────────────

export default function AuthScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width > 768;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Spring scale for buttons
  const continueScale = useSharedValue(1);
  const googleScale = useSharedValue(1);

  // Shake animation for error
  const shakeX = useSharedValue(0);

  const continueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueScale.value }],
  }));

  const googleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // ── Handlers ─────────────────────────────────────────────

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX]);

  const handleAuth = useCallback(() => {
    if (!email.trim()) {
      setError("Please enter your email");
      haptic.error();
      triggerShake();
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      haptic.error();
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate auth (replace with real auth later)
    setTimeout(() => {
      setIsLoading(false);
      router.push("./linkedin" as any);
    }, 800);
  }, [email, password, router, triggerShake]);

  const handleGoogle = useCallback(() => {
    haptic.light();
    router.push("./linkedin" as any);
  }, [router]);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  // ── Form Content ─────────────────────────────────────────

  const formContent = (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View className="w-full max-w-[480px] self-center px-5">
        {/* Logo */}
        <View className="items-center mb-6">
          <Image
            source={require("@/assets/Untitled design (15).svg")}
            style={{ width: 200, height: 100 }}
            accessibilityLabel="LinkCard logo"
          />
        </View>

        {/* Title + Subtitle */}
        <Text
          selectable
          className="text-title-1 font-semibold tracking-tight text-sf-text text-center mb-2"
        >
          The Professional{"\n"}Networking OS.
        </Text>
        <Text
          selectable
          className="text-subheadline text-sf-text-2 text-center mb-2"
        >
          Your identity, amplified.
        </Text>

        {/* Spacer */}
        <View className="h-10" />

        {/* Google Button */}
        <Animated.View style={googleStyle}>
          <Pressable
            className="w-full h-[52px] rounded-full border border-sf-separator flex-row items-center justify-center gap-2 min-h-[44px] min-w-[44px]"
            onPress={handleGoogle}
            onPressIn={() => {
              googleScale.value = withSpring(0.97, springs.snappy);
            }}
            onPressOut={() => {
              googleScale.value = withSpring(1, springs.snappy);
            }}
          >
            <Ionicons
              name="logo-google"
              size={18}
              color={isWeb ? undefined : undefined}
            />
            <Text className="text-caption-1 font-medium tracking-wide text-sf-text">
              Continue with Google
            </Text>
          </Pressable>
        </Animated.View>

        {/* Divider */}
        <View className="flex-row items-center gap-4 my-6">
          <View className="flex-1 h-px bg-sf-separator" />
          <Text className="text-caption-1 font-medium tracking-widest text-sf-text-2 uppercase">
            OR
          </Text>
          <View className="flex-1 h-px bg-sf-separator" />
        </View>

        {/* Email Input */}
        <Animated.View style={shakeStyle}>
          <View className="mb-4">
            <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-1.5">
              EMAIL ADDRESS
            </Text>
            <View
              className={`bg-sf-card rounded-xl border px-4 py-3.5 ${
                error && !email.trim()
                  ? "border-sf-red"
                  : emailFocused
                    ? "border-sf-text"
                    : "border-sf-card-border"
              }`}
            >
              <TextInput
                className="text-body text-sf-text"
                placeholder="name@work-email.com"
                placeholderTextColor="rgba(60,60,67,0.3)"
                value={email}
                onChangeText={(t: string) => {
                  setEmail(t);
                  setError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                textContentType="emailAddress"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-caption-1 font-medium uppercase tracking-widest text-sf-text-2 mb-1.5">
              PASSWORD
            </Text>
            <View
              className={`bg-sf-card rounded-xl border px-4 py-3.5 ${
                error && email.trim() && !password.trim()
                  ? "border-sf-red"
                  : passwordFocused
                    ? "border-sf-text"
                    : "border-sf-card-border"
              }`}
            >
              <TextInput
                className="text-body text-sf-text"
                placeholder="Enter your password"
                placeholderTextColor="rgba(60,60,67,0.3)"
                value={password}
                onChangeText={(t: string) => {
                  setPassword(t);
                  setError(null);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                textContentType="password"
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <Text className="text-caption-1 text-sf-red mb-3">{error}</Text>
          )}
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={continueStyle}>
          <Pressable
            className={`w-full h-[52px] rounded-full bg-sf-text items-center justify-center min-h-[44px] min-w-[44px] ${
              !canSubmit && !isLoading ? "opacity-50" : ""
            }`}
            onPress={handleAuth}
            onPressIn={() => {
              haptic.light();
              continueScale.value = withSpring(0.97, springs.snappy);
            }}
            onPressOut={() => {
              continueScale.value = withSpring(1, springs.snappy);
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-caption-1 font-medium tracking-wide text-sf-bg">
                Continue
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <View className="flex-row justify-center items-center gap-1 mt-[35px]">
          <Text className="text-subheadline text-sf-text-2">New to LinkCard?</Text>
          <Pressable
            className="min-h-[44px] min-w-[44px] justify-center"
            onPress={() => {}}
          >
            <Text className="text-subheadline font-medium text-sf-text underline">
              Create Account
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  // ── Layout ───────────────────────────────────────────────

  const behavior = process.env.EXPO_OS === "ios" ? "padding" : "height";

  if (isDesktop) {
    // Web >768px: 50/50 split
    return (
      <View className="flex-1 flex-row bg-sf-bg">
        {/* Left: Form */}
        <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-center py-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {formContent}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Right: Visual panel */}
        <View className="flex-1 bg-sf-bg-2" />
      </View>
    );
  }

  // Mobile / narrow web: single column
  return (
    <View className="flex-1 bg-sf-bg">
      <KeyboardAvoidingView behavior={behavior} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {formContent}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
