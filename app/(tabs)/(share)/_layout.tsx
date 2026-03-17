/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Share tab stack with native large title
 * [POS]: Share Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function ShareLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: PlatformColor("label") as unknown as string },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Smart Share" }} />
    </Stack>
  );
}
