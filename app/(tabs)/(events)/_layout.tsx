/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Events tab stack with native large title
 * [POS]: Events Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function EventsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Events" }} />
    </Stack>
  );
}
