/**
 * [INPUT]: @/src/css/global.css, expo-router Stack, cardStore
 * [OUTPUT]: Root layout — gates between onboarding and tabs based on card state
 * [POS]: Root — entry point, imports global CSS, conditional navigation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import "@/src/css/global.css";

import { Stack } from "expo-router/stack";
import { useCardStore } from "@/src/stores/cardStore";

export default function RootLayout() {
  const card = useCardStore((s) => s.card);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!card ? (
        <Stack.Screen name="onboarding" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
