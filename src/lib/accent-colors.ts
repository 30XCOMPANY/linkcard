/**
 * [INPUT]: none (pure constants)
 * [OUTPUT]: accentColors palette object, AccentColorKey type
 * [POS]: Core utility — accent color palette for card themes and version picker
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const accentColors = {
  white: "#FFFFFF",
  black: "#1A1A1A",
  indigo: "#5856D6",
  violet: "#AF52DE",
  fuchsia: "#FF2D55",
  pink: "#FF2D55",
  rose: "#FF2D55",
  orange: "#FF9500",
  amber: "#FFCC00",
  emerald: "#34C759",
  teal: "#5AC8FA",
  cyan: "#5AC8FA",
  blue: "#007AFF",
  slate: "#8E8E93",
} as const;

export type AccentColorKey = keyof typeof accentColors;

/* ── Candy variants — saturated, vibrant glass tint ────────── */

export const candyColors: Record<string, string> = {
  "#FFFFFF": "#E8E8ED",
  "#1A1A1A": "#3A3A3C",
  "#5856D6": "#7B6FF0",
  "#AF52DE": "#C97AFF",
  "#FF2D55": "#FF5C8A",
  "#FF9500": "#FFB340",
  "#FFCC00": "#FFD426",
  "#34C759": "#5EE17A",
  "#5AC8FA": "#7DD8FF",
  "#007AFF": "#409CFF",
  "#8E8E93": "#A8A8AE",
};

export function candyColor(accent: string): string {
  return candyColors[accent] ?? accent;
}
