/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Discover tab stack with native large title
 * [POS]: Discover Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

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
          color: PlatformColor("label") as unknown as string,
        },
        headerLargeTitleStyle: { fontFamily: CLASSIC_FONT },
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
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack>
  );
}
