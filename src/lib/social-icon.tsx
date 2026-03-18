/**
 * [INPUT]: @expo/vector-icons Ionicons/FontAwesome6, @/src/types SocialPlatform
 * [OUTPUT]: SocialIcon component — native brand logos via Ionicons + FontAwesome6
 * [POS]: Renders platform-specific brand icons with correct logos, globe fallback for website
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

import type { SocialPlatform } from "@/src/types";

/* ── Platform → icon mapping ───────────────────────────────── */

type IconDef =
  | { lib: "ion"; name: keyof typeof Ionicons.glyphMap }
  | { lib: "fa6"; name: string };

const BRAND_ICONS: Record<SocialPlatform, IconDef> = {
  linkedin:         { lib: "ion", name: "logo-linkedin" },
  x:                { lib: "ion", name: "logo-x" },
  github:           { lib: "ion", name: "logo-github" },
  instagram:        { lib: "ion", name: "logo-instagram" },
  youtube:          { lib: "ion", name: "logo-youtube" },
  threads:          { lib: "ion", name: "logo-threads" },
  bluesky:          { lib: "fa6", name: "bluesky" },
  mastodon:         { lib: "ion", name: "logo-mastodon" },
  reddit:           { lib: "ion", name: "logo-reddit" },
  discord:          { lib: "ion", name: "logo-discord" },
  telegram:         { lib: "fa6", name: "telegram" },
  tiktok:           { lib: "ion", name: "logo-tiktok" },
  facebook:         { lib: "ion", name: "logo-facebook" },
  medium:           { lib: "ion", name: "logo-medium" },
  substack:         { lib: "ion", name: "mail-outline" },
  "google-scholar": { lib: "fa6", name: "google-scholar" },
  "hugging-face":   { lib: "ion", name: "happy-outline" },
  kaggle:           { lib: "fa6", name: "kaggle" },
  "stack-overflow": { lib: "ion", name: "logo-stackoverflow" },
  dribbble:         { lib: "ion", name: "logo-dribbble" },
  behance:          { lib: "ion", name: "logo-behance" },
  figma:            { lib: "ion", name: "logo-figma" },
  "product-hunt":   { lib: "fa6", name: "product-hunt" },
  website:          { lib: "ion", name: "globe-outline" },
};

/* ── Component ─────────────────────────────────────────────── */

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  color?: string;
}

export function SocialIcon({ platform, size = 18, color = "#000" }: SocialIconProps) {
  const icon = BRAND_ICONS[platform] ?? BRAND_ICONS.website;

  if (icon.lib === "fa6") {
    return <FontAwesome6 name={icon.name} size={size} color={color} />;
  }

  return <Ionicons name={icon.name} size={size} color={color} />;
}
