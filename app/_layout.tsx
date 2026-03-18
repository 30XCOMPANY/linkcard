/**
 * [INPUT]: @/src/css/global.css, expo-router Stack, cardStore
 * [OUTPUT]: Root layout — gates between onboarding and tabs based on card state
 * [POS]: Root — entry point, imports global CSS, conditional navigation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import "@/src/css/global.css";

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GoudyBookletter1911_400Regular } from "@expo-google-fonts/goudy-bookletter-1911";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { useCardStore } from "@/src/stores/cardStore";

export default function RootLayout() {
  const card = useCardStore((s) => s.card);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    GoudyBookletter1911_400Regular,
    DMSans_400Regular,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!card && !inOnboarding) {
      router.replace("/onboarding" as any);
    } else if (card && inOnboarding) {
      router.replace("/(tabs)" as any);
    }
  }, [card, fontsLoaded, segments]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
