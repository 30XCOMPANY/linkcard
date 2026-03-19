/**
 * [INPUT]: expo-router Stack, @/src/lib/theme useResolvedTheme
 * [OUTPUT]: Home tab stack with large title, editor push, version management, and social links routes
 * [POS]: Home Stack — native iOS large title with collapse behavior and detail pushes
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import { Stack } from "expo-router/stack";
import { useResolvedTheme } from "@/src/lib/theme";

const CLASSIC_FONT = "GoudyBookletter1911_400Regular";

export default function HomeStackLayout() {
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
        }}
      />
      <Stack.Screen
        name="publications"
        options={{
          title: "Publications",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="publication-detail"
        options={{
          title: "Edit Publication",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="social-links"
        options={{
          title: "Social Links",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="social-link-detail"
        options={{
          title: "Edit Link",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="social-link-picker"
        options={{
          title: "Add Link",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
