/**
 * [INPUT]: expo-router Stack
 * [OUTPUT]: Shared stack for Card and Share tabs with large title headers
 * [POS]: Shared Stack — enables push navigation (e.g. editor) from both tabs
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";

export default function SharedStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: "regular",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "LinkCard" }} />
      <Stack.Screen name="share" options={{ title: "Smart Share" }} />
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
