/**
 * [INPUT]: @/src/css/global.css, expo-router Stack, cardStore, @/src/lib/theme, @/src/services/supabase
 * [OUTPUT]: Root layout — gates between onboarding and tabs after local hydration and cloud sync bootstrap
 * [POS]: Root — entry point, imports global CSS, syncs global theme, restores persisted state, and gates navigation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import "@/src/css/global.css";

import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GoudyBookletter1911_400Regular } from "@expo-google-fonts/goudy-bookletter-1911";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { useCardStore } from "@/src/stores/cardStore";
import { useThemeSync } from "@/src/lib/theme";
import { isSupabaseEnabled } from "@/src/services/supabase";

export default function RootLayout() {
  const card = useCardStore((s) => s.card);
  const hasHydrated = useCardStore((s) => s.hasHydrated);
  const hydrateFromCloud = useCardStore((s) => s.hydrateFromCloud);
  const router = useRouter();
  const segments = useSegments();
  useThemeSync();
  const [cloudReady, setCloudReady] = useState(!isSupabaseEnabled);

  const [fontsLoaded] = useFonts({
    GoudyBookletter1911_400Regular,
    DMSans_400Regular,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded || !hasHydrated || cloudReady) return;

    let cancelled = false;
    hydrateFromCloud()
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setCloudReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [cloudReady, fontsLoaded, hasHydrated, hydrateFromCloud]);

  useEffect(() => {
    if (!fontsLoaded || !hasHydrated || !cloudReady) return;

    const inOnboarding = segments[0] === "onboarding";
    const inPublicCard = segments[0] === "u";
    const atRootIndex = segments.length === 0;

    if (!card && !inOnboarding && !inPublicCard && !atRootIndex) {
      router.replace("/onboarding" as any);
    } else if (card && inOnboarding) {
      router.replace("/(tabs)/(home)" as any);
    }
  }, [card, cloudReady, fontsLoaded, hasHydrated, router, segments]);

  if (!fontsLoaded || !hasHydrated || !cloudReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="u" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
