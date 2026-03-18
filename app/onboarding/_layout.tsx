/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Onboarding stack — single welcome screen
 * [POS]: Onboarding navigator — temporary placeholder layout
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
