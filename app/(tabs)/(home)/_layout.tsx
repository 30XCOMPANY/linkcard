/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Home tab stack with large title and editor push
 * [POS]: Home Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function HomeStackLayout() {
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
      <Stack.Screen name="index" options={{ title: "LinkCard" }} />
      <Stack.Screen
        name="editor"
        options={{
          title: "Edit Card",
          headerLargeTitle: false,
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack>
  );
}
