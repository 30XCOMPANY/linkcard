/**
 * [INPUT]: expo-router Stack, @/src/lib/platform-color
 * [OUTPUT]: Discover tab stack with native large title
 * [POS]: Discover Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { platformColor } from "@/src/lib/platform-color";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: platformColor("systemGroupedBackground") },
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT, color: platformColor("label") },
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
