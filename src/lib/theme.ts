/**
 * [INPUT]: react useEffect/useMemo, react-native Appearance/useColorScheme, @/src/stores/cardStore, @/src/types
 * [OUTPUT]: resolveThemeMode(), useResolvedTheme(), useThemeSync(), syncNativeTheme(), syncThemeDom()
 * [POS]: Core utility — single source of truth for theme resolution and platform theme syncing.
 *        syncNativeTheme is called both from onRehydrateStorage (pre-render) and useThemeSync (reactive).
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import { useEffect, useMemo } from "react";
import { Appearance, type ColorSchemeName, Platform, useColorScheme } from "react-native";

import { useCardStore } from "@/src/stores/cardStore";
import type { ThemeMode } from "@/src/types";

export type ResolvedTheme = "light" | "dark";

let currentResolvedTheme: ResolvedTheme = "light";

function normalizeSystemScheme(scheme: ColorSchemeName): ResolvedTheme {
  return scheme === "dark" ? "dark" : "light";
}

export function resolveThemeMode(
  themeMode: ThemeMode,
  systemScheme: ColorSchemeName,
): ResolvedTheme {
  if (themeMode === "system") {
    return normalizeSystemScheme(systemScheme);
  }

  return themeMode;
}

export function getResolvedTheme(): ResolvedTheme {
  return currentResolvedTheme;
}

/**
 * Imperative native appearance setter.
 * Called from two sites:
 *   1. onRehydrateStorage — synchronous, before any React render
 *   2. useThemeSync effect — reactive, on every themeMode change
 */
export function syncNativeTheme(themeMode: ThemeMode) {
  if (Platform.OS === "web") return;
  // null resets to system default; 'unspecified' may not restore dark on some devices
  Appearance.setColorScheme((themeMode === "system" ? null : themeMode) as any);
}

export function syncThemeDom(resolvedTheme: ResolvedTheme) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
}

export function useResolvedTheme(): ResolvedTheme {
  const themeMode = useCardStore((state) => state.themeMode);
  const systemScheme = useColorScheme();

  return useMemo(
    () => resolveThemeMode(themeMode, systemScheme),
    [systemScheme, themeMode],
  );
}

export function useThemeSync() {
  const themeMode = useCardStore((state) => state.themeMode);
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    currentResolvedTheme = resolvedTheme;
    syncNativeTheme(themeMode);
    syncThemeDom(resolvedTheme);
  }, [resolvedTheme, themeMode]);

  return resolvedTheme;
}
