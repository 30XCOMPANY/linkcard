/**
 * [INPUT]: react-native useColorScheme
 * [OUTPUT]: useSemanticColors() — reactive custom semantic color hook
 * [POS]: Core utility — custom semantic colors that auto-adapt on theme change
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from "react";
import { useColorScheme } from "react-native";

/* ── Custom Semantic Color Maps ──────────────────────────── */

const LIGHT: Record<string, string> = {
  // Settings chrome
  chevronTint: "rgba(60,60,67,0.3)",
  segmentedSelectedBg: "#FFFFFF",
  segmentedSelectedShadow: "rgba(0,0,0,0.08)",
  segmentedTrackBg: "rgba(120,120,128,0.12)",
  colorChipSelectedBorder: "#000000",

  // Surfaces
  avatarFallbackBg: "#F2F2F7",
  overlayBg: "rgba(255,255,255,0.97)",
  overlayText: "#6B7280",

  // Buttons
  buttonPrimaryBg: "#007AFF",
  buttonPrimaryLabel: "#FFFFFF",
  buttonSecondaryBg: "rgba(0,122,255,0.12)",
  buttonSecondaryLabel: "#007AFF",

  // Page
  pageBg: "#F2F2F7",

  // Onboarding
  chipBg: "#FFFFFF",
  permSheetBg: "#FFFFFF",
  permBarBg: "rgba(60,60,67,0.12)",
  permBtnBg: "rgba(120,120,128,0.16)",
  permBtnHighlightBg: "rgba(0,122,255,0.15)",
  permShadow: "0 8px 32px rgba(0,0,0,0.12)",
  bannerFadeStart: "rgba(242,242,247,0.3)",
  bannerFadeMid: "rgba(242,242,247,0.8)",
  bannerFadeEnd: "#F2F2F7",
};

const DARK: Record<string, string> = {
  // Settings chrome
  chevronTint: "rgba(235,235,245,0.3)",
  segmentedSelectedBg: "#636366",
  segmentedSelectedShadow: "rgba(0,0,0,0.25)",
  segmentedTrackBg: "rgba(120,120,128,0.24)",
  colorChipSelectedBorder: "#FFFFFF",

  // Surfaces
  avatarFallbackBg: "#2C2C2E",
  overlayBg: "rgba(28,28,30,0.97)",
  overlayText: "#9CA3AF",

  // Buttons
  buttonPrimaryBg: "#0A84FF",
  buttonPrimaryLabel: "#FFFFFF",
  buttonSecondaryBg: "rgba(10,132,255,0.18)",
  buttonSecondaryLabel: "#0A84FF",

  // Page
  pageBg: "#000000",

  // Onboarding
  chipBg: "rgba(255,255,255,0.12)",
  permSheetBg: "rgba(44,44,46,1)",
  permBarBg: "rgba(255,255,255,0.10)",
  permBtnBg: "rgba(255,255,255,0.12)",
  permBtnHighlightBg: "rgba(10,132,255,0.25)",
  permShadow: "0 8px 32px rgba(0,0,0,0.40)",
  bannerFadeStart: "rgba(0,0,0,0.3)",
  bannerFadeMid: "rgba(0,0,0,0.8)",
  bannerFadeEnd: "#000000",
};

/* ── Hook ────────────────────────────────────────────────── */

export type SemanticColors = typeof LIGHT;

/**
 * Reactive semantic colors — re-renders on theme change.
 * Use in inline styles or useMemo-based style objects, NOT in StyleSheet.create().
 */
export function useSemanticColors() {
  const scheme = useColorScheme();
  return useMemo(() => (scheme === "dark" ? DARK : LIGHT), [scheme]);
}
