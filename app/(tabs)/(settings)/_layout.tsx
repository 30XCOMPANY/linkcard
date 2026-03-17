/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Settings tab stack with transparent Liquid Glass headers
 * [POS]: Settings Stack — iOS 26 glass navigation chrome
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: false,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
    </Stack>
  );
}
