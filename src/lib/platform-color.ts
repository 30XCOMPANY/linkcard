/**
 * [INPUT]: react-native Platform/PlatformColor, @/src/lib/theme
 * [OUTPUT]: platformColor() — cross-platform semantic color resolver
 * [POS]: Core utility — wraps PlatformColor and CSS variables behind one semantic-color API
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Platform, PlatformColor } from "react-native";

const isWeb = Platform.OS === "web";

/* ── Web CSS Variables ───────────────────────────────────── */

const WEB_VARIABLES: Record<string, string> = {
  label: "var(--platform-label)",
  secondaryLabel: "var(--platform-secondary-label)",
  tertiaryLabel: "var(--platform-tertiary-label)",
  quaternaryLabel: "var(--platform-quaternary-label)",

  systemBackground: "var(--platform-system-background)",
  secondarySystemBackground: "var(--platform-secondary-system-background)",
  tertiarySystemBackground: "var(--platform-tertiary-system-background)",
  secondarySystemGroupedBackground: "var(--platform-secondary-system-grouped-background)",
  systemGroupedBackground: "var(--platform-system-grouped-background)",

  systemFill: "var(--platform-system-fill)",
  secondarySystemFill: "var(--platform-secondary-system-fill)",
  tertiarySystemFill: "var(--platform-tertiary-system-fill)",
  quaternarySystemFill: "var(--platform-quaternary-system-fill)",

  placeholderText: "var(--platform-placeholder-text)",

  separator: "var(--platform-separator)",
  opaqueSeparator: "var(--platform-opaque-separator)",

  systemBlue: "var(--platform-system-blue)",
  systemGreen: "var(--platform-system-green)",
  systemIndigo: "var(--platform-system-indigo)",
  systemOrange: "var(--platform-system-orange)",
  systemPink: "var(--platform-system-pink)",
  systemPurple: "var(--platform-system-purple)",
  systemRed: "var(--platform-system-red)",
  systemTeal: "var(--platform-system-teal)",
  systemYellow: "var(--platform-system-yellow)",
  systemGray: "var(--platform-system-gray)",
  systemGray2: "var(--platform-system-gray-2)",
  systemGray3: "var(--platform-system-gray-3)",
  systemGray4: "var(--platform-system-gray-4)",
  systemGray5: "var(--platform-system-gray-5)",
  systemGray6: "var(--platform-system-gray-6)",
};

/**
 * Cross-platform semantic color.
 * iOS/Android: native PlatformColor (reactive to Appearance override)
 * Web: CSS variable bridge (reactive to root data-theme changes)
 */
export function platformColor(name: string): any {
  if (isWeb) {
    return WEB_VARIABLES[name] ?? "var(--platform-label)";
  }

  return PlatformColor(name) as unknown as string;
}
