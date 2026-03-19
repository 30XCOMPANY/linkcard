/**
 * [INPUT]: expo-router Stack, @/src/lib/theme useResolvedTheme
 * [OUTPUT]: Discover tab stack with native large title
 * [POS]: Discover Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { useResolvedTheme } from "@/src/lib/theme";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function DiscoverLayout() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === "dark";
  const titleColor = isDark ? "#F8FAFC" : "#0F172A";
  const pageBg = isDark ? "#000000" : "#F7F7F5";

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: pageBg },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: titleColor },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT, color: titleColor },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Discover" }} />
      <Stack.Screen
        name="collection"
        options={{
          title: "Saved Cards",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
