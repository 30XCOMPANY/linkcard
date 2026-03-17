/**
 * [INPUT]: @/src/css/global.css, expo-router Stack, cardStore
 * [OUTPUT]: Root layout — gates between onboarding and tabs based on card state
 * [POS]: Root — entry point, imports global CSS, conditional navigation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import "@/src/css/global.css";

import { Stack } from "expo-router/stack";
import { useFonts } from "expo-font";
import { GoudyBookletter1911_400Regular } from "@expo-google-fonts/goudy-bookletter-1911";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { useCardStore } from "@/src/stores/cardStore";

export default function RootLayout() {
  const card = useCardStore((s) => s.card);

  const [fontsLoaded] = useFonts({
    GoudyBookletter1911_400Regular,
    DMSans_700Bold,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) return null;

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
