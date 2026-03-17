/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Onboarding stack with auth (no header) + linkedin/preview (with headers)
 * [POS]: Onboarding navigator — 3-step flow: auth → linkedin → preview
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="linkedin" options={{ headerShown: true, title: "LinkedIn" }} />
      <Stack.Screen name="preview" options={{ headerShown: true, title: "Preview" }} />
    </Stack>
  );
}
