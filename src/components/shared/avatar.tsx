/**
 * [INPUT]: react-native View/Image/ViewStyle/StyleSheet, AdaptiveGlass, assets/avatars/*.png
 * [OUTPUT]: Avatar component — photo or stable illustration fallback, optional Liquid Glass shell
 * [POS]: Shared avatar — reused across cards/settings, can wrap hero avatars in a soft transparent glass ring
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { useSemanticColors } from "@/src/lib/semantic-colors";

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
  glassPadding?: number;
  glassIntensity?: number;
  showBorder?: boolean;
  style?: ViewStyle;
}

// ── Component ───────────────────────────────────────────────────

export function Avatar({
  source,
  name = "",
  size = "md",
  accentColor,
  glassPadding = 0,
  glassIntensity = 52,
  showBorder = false,
  style,
}: AvatarProps) {
  const sc = useSemanticColors();
  const dim = typeof size === "number" ? size : sizeMap[size] ?? 48;
  const inset = Math.max(0, glassPadding);
  const innerDim = inset > 0 ? Math.max(0, dim - inset * 2) : dim;
  const avatarStyle: ViewStyle = {
    width: innerDim,
    height: innerDim,
    borderRadius: innerDim / 2,
    overflow: "hidden",
    backgroundColor: sc.avatarFallbackBg,
    ...(showBorder && accentColor && { borderWidth: 3, borderColor: accentColor }),
  };
  const index = stableHash(name) % ILLUSTRATIONS.length;
  const imageSource: ImageSourcePropType = source ? { uri: source } : ILLUSTRATIONS[index];
  const avatar = (
    <View style={inset > 0 ? avatarStyle : [avatarStyle, style]}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
    </View>
  );

  if (inset <= 0) {
    return avatar;
  }

  const shellStyle: ViewStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    borderCurve: "continuous" as any,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  };

  return (
    <AdaptiveGlass
      intensity={glassIntensity}
      glassEffectStyle="clear"
      blurTint="default"
      fallbackColor="rgba(255,255,255,0.08)"
      style={{ ...shellStyle, ...style }}
    >
      {avatar}
    </AdaptiveGlass>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
