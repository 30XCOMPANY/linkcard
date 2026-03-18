/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Onboarding stack — transparent header for native back button
 * [POS]: Onboarding navigator — headerless on welcome, native header on builder steps
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitle: "",
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
