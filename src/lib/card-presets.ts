/**
 * [INPUT]: @/src/types CardBackground/CardVersion
 * [OUTPUT]: CARD_BACKGROUND_OPTIONS, DEFAULT_CARD_BACKGROUND, resolveCardBackground,
 *           normalizeCardVersion, createDefaultCardVersions
 * [POS]: Core utility — single source of truth for version backgrounds, defaults, and migration-safe normalization
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import type { CardBackground, CardVersion } from "@/src/types";

export interface CardBackgroundOption {
  id: CardBackground;
  label: string;
  description: string;
  gradient: [string, string];
  surface: string;
  border: string;
  isDark: boolean;
}

export const CARD_BACKGROUND_OPTIONS: readonly CardBackgroundOption[] = [
  {
    id: "lightGlass",
    label: "Glass",
    description: "Clean default with a soft white lift",
    gradient: ["#FFFFFF", "#EEF3FF"],
    surface: "#FFFFFF",
    border: "rgba(15,23,42,0.08)",
    isDark: false,
  },
  {
    id: "freshBlue",
    label: "Blue",
    description: "Cool sky gradient for builder and tech profiles",
    gradient: ["#DFF3FF", "#A9D8FF"],
    surface: "#F6FBFF",
    border: "rgba(20,84,140,0.18)",
    isDark: false,
  },
  {
    id: "midnightInk",
    label: "Ink",
    description: "Dark editorial slab with restrained contrast",
    gradient: ["#1F2937", "#111827"],
    surface: "#111827",
    border: "rgba(255,255,255,0.10)",
    isDark: true,
  },
  {
    id: "sunsetGlow",
    label: "Glow",
    description: "Warm social backdrop with pink-orange energy",
    gradient: ["#FFE4D6", "#FFC7DC"],
    surface: "#FFF8F5",
    border: "rgba(190,24,93,0.14)",
    isDark: false,
  },
  {
    id: "paper",
    label: "Paper",
    description: "Neutral editorial stock without tint drama",
    gradient: ["#F8F5EE", "#F2EEE6"],
    surface: "#FDFAF3",
    border: "rgba(120,113,108,0.14)",
    isDark: false,
  },
] as const;

export const DEFAULT_CARD_BACKGROUND: CardBackground = "lightGlass";

const DEFAULT_CARD_VERSIONS: readonly CardVersion[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Executive left-aligned layout with a clean aesthetic",
    visibleFields: ["photoUrl", "name", "jobTitle", "headline", "company", "location", "qrCode", "character"],
    template: "modern",
    accentColor: "#0066CC",
    background: "lightGlass",
    isDefault: true,
    fieldStyles: {
      photoUrl: { x: 10, y: 8, width: 20, borderRadius: 100 },
      name: { x: 10, y: 30, width: 80, fontWeight: "bold", fontSize: 28, color: "#000000" },
      jobTitle: { x: 10, y: 38, width: 80, fontWeight: "medium", fontSize: 13, color: "#666666" },
      headline: { x: 10, y: 46, width: 80, fontSize: 15, lineHeight: 22, color: "#1a1a1a" },
      character: { x: 10, y: 58, width: 80, fontSize: 12, color: "#999999" },
      company: { x: 10, y: 76, width: 50, fontWeight: "bold", fontSize: 14, color: "#000000" },
      location: { x: 10, y: 84, width: 50, fontSize: 12, color: "#666666" },
      qrCode: { x: 74, y: 76, width: 16 },
    },
  },
  {
    id: "networking",
    name: "Networking",
    description: "Quick connect with a bento layout",
    visibleFields: ["photoUrl", "name", "headline", "company", "qrCode"],
    template: "bento",
    accentColor: "#8B5CF6",
    background: "freshBlue",
    isDefault: false,
  },
  {
    id: "personal",
    name: "Personal",
    description: "Elegant sunset theme for social contexts",
    visibleFields: ["photoUrl", "name", "headline", "location", "website", "qrCode"],
    template: "minimal",
    accentColor: "#EC4899",
    background: "sunsetGlow",
    isDefault: false,
  },
] as const;

const backgroundFromTemplate = (template: CardVersion["template"]): CardBackground => {
  switch (template) {
    case "bento":
    case "ocean":
      return "freshBlue";
    case "midnight":
      return "midnightInk";
    case "sunset":
      return "sunsetGlow";
    case "classic":
      return "paper";
    default:
      return DEFAULT_CARD_BACKGROUND;
  }
};

export const resolveCardBackground = (background: CardBackground): CardBackgroundOption =>
  CARD_BACKGROUND_OPTIONS.find((option) => option.id === background) ??
  CARD_BACKGROUND_OPTIONS[0];

export const normalizeCardVersion = (version: CardVersion): CardVersion => ({
  ...version,
  background: version.background ?? backgroundFromTemplate(version.template),
  fieldStyles: version.fieldStyles
    ? Object.fromEntries(
        Object.entries(version.fieldStyles).map(([key, value]) => [key, { ...value }])
      )
    : undefined,
});

export const createDefaultCardVersions = (
  primaryBackground: CardBackground = DEFAULT_CARD_BACKGROUND
): CardVersion[] =>
  DEFAULT_CARD_VERSIONS.map((version, index) =>
    normalizeCardVersion({
      ...version,
      background: index === 0 ? primaryBackground : version.background,
    })
  );
