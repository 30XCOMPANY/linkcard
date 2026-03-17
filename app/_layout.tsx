/**
 * [INPUT]: expo-router Stack, design-system ThemeProvider + useTheme
 * [OUTPUT]: Root layout with theme context
 * [POS]: App shell — wraps all screens with ThemeProvider
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from '@/src/design-system/theme';

function RootLayoutInner() {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background as string }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background as string },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="glass-home" />
        <Stack.Screen name="preview" />
        <Stack.Screen name="editor" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="versions" />
        <Stack.Screen
          name="share"
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
