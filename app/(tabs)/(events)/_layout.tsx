/**
 * [INPUT]: expo-router Stack, @/src/lib/theme useResolvedTheme
 * [OUTPUT]: Events tab stack with native large title
 * [POS]: Events Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { useResolvedTheme } from "@/src/lib/theme";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function EventsLayout() {
  const theme = useResolvedTheme();
  const labelColor = theme === "dark" ? "#FFFFFF" : "#000000";

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: labelColor },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT, color: labelColor },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Events" }} />
    </Stack>
  );
}
