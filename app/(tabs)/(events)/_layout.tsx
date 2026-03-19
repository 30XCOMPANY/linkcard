/**
 * [INPUT]: expo-router Stack, @/src/lib/platform-color
 * [OUTPUT]: Events tab stack with native large title
 * [POS]: Events Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { platformColor } from "@/src/lib/platform-color";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: platformColor("systemGroupedBackground") },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: platformColor("label") },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT, color: platformColor("label") },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Events" }} />
    </Stack>
  );
}
