/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Home tab stack with Card display and Editor push screen
 * [POS]: Home Stack — enables push navigation to editor from card tab
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function HomeStackLayout() {
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
      <Stack.Screen name="index" options={{ title: "LinkCard" }} />
      <Stack.Screen
        name="editor"
        options={{
          title: "Edit Card",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
