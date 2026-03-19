/**
 * [INPUT]: expo-router Stack, @/src/lib/platform-color
 * [OUTPUT]: Settings tab stack — index + account, appearance, notifications, privacy, about sub-pages
 * [POS]: Settings Stack — native iOS large title on index, pushed sub-pages
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { platformColor } from "@/src/lib/platform-color";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

const pushed = {
  headerLargeTitle: false,
};

export default function SettingsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="account" options={{ title: "Account", ...pushed }} />
      <Stack.Screen name="appearance" options={{ title: "Appearance", ...pushed }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications", ...pushed }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy & Sharing", ...pushed }} />
      <Stack.Screen name="about" options={{ title: "About", ...pushed }} />
    </Stack>
  );
}
