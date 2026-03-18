/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Home tab stack with large title, editor push, and native version-management route
 * [POS]: Home Stack — native iOS large title with collapse behavior and detail pushes
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
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
        }}
      />
      <Stack.Screen
        name="versions"
        options={{
          title: "Card Versions",
          headerLargeTitle: false,
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack>
  );
}
