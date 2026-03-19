/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
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
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: {
          color: platformColor("label") as unknown as string,
        },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT, color: platformColor("label") as unknown as string },
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
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack>
  );
}
