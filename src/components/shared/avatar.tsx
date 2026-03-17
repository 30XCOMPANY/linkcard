/**
 * [INPUT]: react-native View/Image/ViewStyle, assets/avatars/*.png
 * [OUTPUT]: Avatar component — photo, or stable illustration fallback from 11 avatars
 * [POS]: Shared avatar — shows LinkedIn photo or deterministic illustrated avatar
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View, Image, ViewStyle } from "react-native";

// ── Illustration fallbacks ──────────────────────────────────────

const ILLUSTRATIONS = [
  require("@/assets/avatars/Oval.png"),
  require("@/assets/avatars/Oval-1.png"),
  require("@/assets/avatars/Oval-2.png"),
  require("@/assets/avatars/Oval-3.png"),
  require("@/assets/avatars/Oval-4.png"),
  require("@/assets/avatars/Oval-5.png"),
  require("@/assets/avatars/Oval-6.png"),
  require("@/assets/avatars/Oval-7.png"),
  require("@/assets/avatars/Oval-8.png"),
  require("@/assets/avatars/Oval-9.png"),
  require("@/assets/avatars/Oval-10.png"),
];

function stableHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Size presets ────────────────────────────────────────────────

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl" | number;

const sizeMap: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  "2xl": 128,
};

// ── Props ───────────────────────────────────────────────────────

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  accentColor?: string;
  showBorder?: boolean;
  style?: ViewStyle;
}

// ── Component ───────────────────────────────────────────────────

export function Avatar({
  source,
  name = "",
  size = "md",
  accentColor,
  showBorder = false,
  style,
}: AvatarProps) {
  const dim = typeof size === "number" ? size : sizeMap[size] ?? 48;

  const container: ViewStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    overflow: "hidden",
    backgroundColor: "#F2F2F7",
    ...(showBorder && accentColor && { borderWidth: 3, borderColor: accentColor }),
  };

  // LinkedIn photo
  if (source) {
    return (
      <View style={[container, style]}>
        <Image
          source={{ uri: source }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Illustrated fallback — same name always picks same avatar
  const index = stableHash(name) % ILLUSTRATIONS.length;

  return (
    <View style={[container, style]}>
      <Image
        source={ILLUSTRATIONS[index]}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}
