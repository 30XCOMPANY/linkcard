/**
 * [INPUT]: react-native PlatformColor
 * [OUTPUT]: platformColor() — cross-platform semantic color resolver
 * [POS]: Core utility — wraps PlatformColor with web light/dark fallback colors
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PlatformColor } from "react-native";

const isWeb = process.env.EXPO_OS === "web";

/* ── Web Fallback Maps ───────────────────────────────────── */

const WEB_LIGHT: Record<string, string> = {
  // Labels
  label: "#000000",
  secondaryLabel: "rgba(60,60,67,0.6)",
  tertiaryLabel: "rgba(60,60,67,0.3)",
  quaternaryLabel: "rgba(60,60,67,0.18)",

  // Backgrounds
  systemBackground: "#FFFFFF",
  secondarySystemBackground: "#F2F2F7",
  tertiarySystemBackground: "#FFFFFF",
  secondarySystemGroupedBackground: "#FFFFFF",
  systemGroupedBackground: "#F2F2F7",

  // Fills
  systemFill: "rgba(120,120,128,0.2)",
  secondarySystemFill: "rgba(120,120,128,0.16)",
  tertiarySystemFill: "rgba(118,118,128,0.12)",
  quaternarySystemFill: "rgba(116,116,128,0.08)",

  // Placeholder
  placeholderText: "rgba(60,60,67,0.3)",

  // Separators
  separator: "rgba(60,60,67,0.29)",
  opaqueSeparator: "#C6C6C8",

  // System colors
  systemBlue: "#007AFF",
  systemGreen: "#34C759",
  systemIndigo: "#5856D6",
  systemOrange: "#FF9500",
  systemPink: "#FF2D55",
  systemPurple: "#AF52DE",
  systemRed: "#FF3B30",
  systemTeal: "#5AC8FA",
  systemYellow: "#FFCC00",
  systemGray: "#8E8E93",
  systemGray2: "#AEAEB2",
  systemGray3: "#C7C7CC",
  systemGray4: "#D1D1D6",
  systemGray5: "#E5E5EA",
  systemGray6: "#F2F2F7",
};

const WEB_DARK: Record<string, string> = {
  // Labels
  label: "#FFFFFF",
  secondaryLabel: "rgba(235,235,245,0.6)",
  tertiaryLabel: "rgba(235,235,245,0.3)",
  quaternaryLabel: "rgba(235,235,245,0.18)",

  // Backgrounds
  systemBackground: "#000000",
  secondarySystemBackground: "#1C1C1E",
  tertiarySystemBackground: "#2C2C2E",
  secondarySystemGroupedBackground: "#1C1C1E",
  systemGroupedBackground: "#000000",

  // Fills
  systemFill: "rgba(120,120,128,0.36)",
  secondarySystemFill: "rgba(120,120,128,0.32)",
  tertiarySystemFill: "rgba(118,118,128,0.24)",
  quaternarySystemFill: "rgba(116,116,128,0.18)",

  // Placeholder
  placeholderText: "rgba(235,235,245,0.3)",

  // Separators
  separator: "rgba(84,84,88,0.6)",
  opaqueSeparator: "#38383A",

  // System colors
  systemBlue: "#0A84FF",
  systemGreen: "#30D158",
  systemIndigo: "#5E5CE6",
  systemOrange: "#FF9F0A",
  systemPink: "#FF375F",
  systemPurple: "#BF5AF2",
  systemRed: "#FF453A",
  systemTeal: "#64D2FF",
  systemYellow: "#FFD60A",
  systemGray: "#8E8E93",
  systemGray2: "#636366",
  systemGray3: "#48484A",
  systemGray4: "#3A3A3C",
  systemGray5: "#2C2C2E",
  systemGray6: "#1C1C1E",
};

/* ── Public API ──────────────────────────────────────────── */

function webIsDark(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

/**
 * Cross-platform semantic color.
 * iOS/Android: native PlatformColor (auto dark/light, reactive)
 * Web: fallback from light/dark maps (static — resolved at call time)
 */
export function platformColor(name: string): any {
  if (isWeb) {
    const map = webIsDark() ? WEB_DARK : WEB_LIGHT;
    return map[name] ?? "#000000";
  }
  return PlatformColor(name) as unknown as string;
}
