/**
 * [INPUT]: react-native PlatformColor
 * [OUTPUT]: platformColor() — cross-platform semantic color resolver
 * [POS]: Core utility — wraps PlatformColor with web fallback colors
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PlatformColor } from "react-native";

const isWeb = process.env.EXPO_OS === "web";

/* ── Web Fallback Map ──────────────────────────────────────── */

const WEB_COLORS: Record<string, string> = {
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

/**
 * Cross-platform semantic color.
 * iOS/Android: native PlatformColor
 * Web: fallback from map
 */
export function platformColor(name: string): any {
  if (isWeb) {
    return WEB_COLORS[name] ?? "#000000";
  }
  return PlatformColor(name) as unknown as string;
}
