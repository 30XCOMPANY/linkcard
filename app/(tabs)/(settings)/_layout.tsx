/**
 * [INPUT]: expo-router Stack, @/src/lib/theme useResolvedTheme
 * [OUTPUT]: Settings tab stack — index + account, appearance, notifications, privacy, about sub-pages
 * [POS]: Settings Stack — native iOS large title on index, material blur on pushed sub-pages
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { useResolvedTheme } from "@/src/lib/theme";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

const pushed = {
  headerLargeTitle: false,
};

export default function SettingsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="account" options={{ title: "Account", ...pushed }} />
      <Stack.Screen name="appearance" options={{ title: "Appearance", ...pushed }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications", ...pushed }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy & Sharing", ...pushed }} />
      <Stack.Screen name="about" options={{ title: "About", ...pushed }} />
    </Stack>
  );
}
