/**
 * [INPUT]: react useMemo, @/src/lib/theme
 * [OUTPUT]: useSemanticColors() — reactive custom semantic color hook
 * [POS]: Core utility — custom semantic colors that auto-adapt on theme change
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from "react";
import { useResolvedTheme } from "@/src/lib/theme";

/* ── Custom Semantic Color Maps ──────────────────────────── */

const LIGHT: Record<string, string> = {
  // Settings chrome
  chevronTint: "rgba(60,60,67,0.3)",
  segmentedSelectedBg: "#FFFFFF",
  segmentedSelectedShadow: "rgba(15,23,42,0.08)",
  segmentedTrackBg: "rgba(120,120,128,0.14)",
  colorChipSelectedBorder: "#000000",

  // Surfaces
  avatarFallbackBg: "#F2F2F7",
  overlayBg: "rgba(255,255,255,0.97)",
  overlayText: "#64748B",

  // Buttons
  buttonPrimaryBg: "#007AFF",
  buttonPrimaryLabel: "#FFFFFF",
  buttonSecondaryBg: "rgba(0,122,255,0.10)",
  buttonSecondaryLabel: "#007AFF",

  // Page
  pageBg: "#F2F2F7",

  // Onboarding
  chipBg: "#FFFFFF",
  permSheetBg: "rgba(255,255,255,0.92)",
  permBarBg: "rgba(60,60,67,0.12)",
  permBtnBg: "rgba(120,120,128,0.16)",
  permBtnHighlightBg: "rgba(0,122,255,0.15)",
  permShadow: "0 18px 48px rgba(15,23,42,0.14)",
  bannerFadeStart: "rgba(242,242,247,0.18)",
  bannerFadeMid: "rgba(242,242,247,0.76)",
  bannerFadeEnd: "#F2F2F7",
  welcomeBg: "#F5F7FB",
  welcomeFadeEnd: "rgba(245,247,251,1)",
  welcomeTitle: "#0F172A",
  welcomeSubtitle: "rgba(15,23,42,0.68)",
  welcomeButtonBg: "rgba(255,255,255,0.82)",
  welcomeButtonLabel: "#0F172A",
  welcomeButtonBorder: "rgba(15,23,42,0.08)",
  welcomeButtonShadow: "0 18px 48px rgba(15,23,42,0.14)",
  welcomeLogoTint: "#0F172A",
};

const DARK: Record<string, string> = {
  // Settings chrome
  chevronTint: "rgba(235,235,245,0.3)",
  segmentedSelectedBg: "#636366",
  segmentedSelectedShadow: "rgba(0,0,0,0.34)",
  segmentedTrackBg: "rgba(120,120,128,0.24)",
  colorChipSelectedBorder: "#FFFFFF",

  // Surfaces
  avatarFallbackBg: "#2C2C2E",
  overlayBg: "rgba(28,28,30,0.97)",
  overlayText: "#A8B0BE",

  // Buttons
  buttonPrimaryBg: "#0A84FF",
  buttonPrimaryLabel: "#FFFFFF",
  buttonSecondaryBg: "rgba(10,132,255,0.18)",
  buttonSecondaryLabel: "#0A84FF",

  // Page
  pageBg: "#000000",

  // Onboarding
  chipBg: "rgba(255,255,255,0.12)",
  permSheetBg: "rgba(28,28,30,0.92)",
  permBarBg: "rgba(255,255,255,0.10)",
  permBtnBg: "rgba(255,255,255,0.12)",
  permBtnHighlightBg: "rgba(10,132,255,0.25)",
  permShadow: "0 18px 56px rgba(0,0,0,0.52)",
  bannerFadeStart: "rgba(0,0,0,0.18)",
  bannerFadeMid: "rgba(0,0,0,0.78)",
  bannerFadeEnd: "#000000",
  welcomeBg: "#05070B",
  welcomeFadeEnd: "rgba(5,7,11,1)",
  welcomeTitle: "#FFFFFF",
  welcomeSubtitle: "rgba(255,255,255,0.68)",
  welcomeButtonBg: "rgba(255,255,255,0.9)",
  welcomeButtonLabel: "#0A0A0A",
  welcomeButtonBorder: "rgba(255,255,255,0.18)",
  welcomeButtonShadow: "0 18px 56px rgba(0,0,0,0.40)",
  welcomeLogoTint: "#FFFFFF",
};

/* ── Hook ────────────────────────────────────────────────── */

export type SemanticColors = typeof LIGHT;

/**
 * Reactive semantic colors — re-renders on theme change.
 * Use in inline styles or useMemo-based style objects, NOT in StyleSheet.create().
 */
export function useSemanticColors() {
  const resolvedTheme = useResolvedTheme();
  return useMemo(() => (resolvedTheme === "dark" ? DARK : LIGHT), [resolvedTheme]);
}
