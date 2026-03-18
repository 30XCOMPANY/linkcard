/**
 * [INPUT]: @expo/vector-icons Ionicons, @/src/types SocialPlatform
 * [OUTPUT]: SocialIcon component — native brand logos via Ionicons
 * [POS]: Renders platform-specific brand icons (Instagram, LinkedIn, etc.) with globe fallback for website
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Ionicons } from "@expo/vector-icons";

import type { SocialPlatform } from "@/src/types";

/* ── Platform → Ionicons logo name mapping ─────────────────── */

const BRAND_ICONS: Record<SocialPlatform, keyof typeof Ionicons.glyphMap> = {
  linkedin: "logo-linkedin",
  x: "logo-x",
  github: "logo-github",
  instagram: "logo-instagram",
  youtube: "logo-youtube",
  threads: "logo-threads",
  bluesky: "globe-outline",  // no Ionicon yet
  mastodon: "logo-mastodon",
  reddit: "logo-reddit",
  discord: "logo-discord",
  telegram: "paper-plane",   // Ionicons uses paper-plane for telegram
  tiktok: "logo-tiktok",
  facebook: "logo-facebook",
  medium: "logo-medium",
  substack: "mail-outline",  // no brand icon, mail is closest
  "google-scholar": "school-outline",
  "hugging-face": "happy-outline",
  kaggle: "code-slash-outline",
  "stack-overflow": "logo-stackoverflow",
  dribbble: "logo-dribbble",
  behance: "logo-behance",
  figma: "logo-figma",
  "product-hunt": "rocket-outline",
  website: "globe-outline",
};

/* ── Component ─────────────────────────────────────────────── */

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  color?: string;
}

export function SocialIcon({ platform, size = 18, color = "#000" }: SocialIconProps) {
  const name = BRAND_ICONS[platform] ?? "globe-outline";
  return <Ionicons name={name} size={size} color={color} />;
}
