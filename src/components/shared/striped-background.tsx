/**
 * [INPUT]: react-native View, react-native-svg, expo-linear-gradient
 * [OUTPUT]: StripedBackground component with Mindo-style vertical stripes + radial fade
 * [POS]: Shared component — full-screen background with user-selectable color
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Line } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

/* ------------------------------------------------------------------ */
/*  Color palette — extracted from Figma Mindo design system           */
/* ------------------------------------------------------------------ */

export const BG_COLORS = {
  cyan:    "#00C0E8",
  blue:    "#0088FF",
  red:     "#FF383C",
  green:   "#34C759",
  purple:  "#CB30E0",
  orange:  "#FF9500",
  yellow:  "#FFCC00",
  mint:    "#00C7BE",
  teal:    "#30B0C7",
  indigo:  "#5856D6",
  pink:    "#FF2D55",
  brown:   "#A2845E",
  grey:    "#8E8E93",
} as const;

export type BgColorKey = keyof typeof BG_COLORS;

/* ------------------------------------------------------------------ */
/*  Stripe pattern layer (SVG)                                         */
/* ------------------------------------------------------------------ */

const STRIPE_GAP = 8.47;
const STRIPE_WIDTH = 2.12;

function StripePattern({ width, height }: { width: number; height: number }) {
  const stripeCount = Math.ceil(width / STRIPE_GAP) + 1;
  const stripeColor = "rgba(255, 255, 255, 0.08)";

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {Array.from({ length: stripeCount }, (_, i) => (
        <Line
          key={i}
          x1={i * STRIPE_GAP}
          y1={0}
          x2={i * STRIPE_GAP}
          y2={height}
          stroke={stripeColor}
          strokeWidth={STRIPE_WIDTH}
        />
      ))}
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  StripedBackground                                                  */
/* ------------------------------------------------------------------ */

interface StripedBackgroundProps {
  color: BgColorKey | string;
  children?: React.ReactNode;
}

const SYS_BG = "#F2F2F7";

export function StripedBackground({ color, children }: StripedBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const baseColor = (BG_COLORS as Record<string, string>)[color] ?? color;
  const colorHeight = height * 0.35;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: SYS_BG }]}>
      {/* Color + stripes layer — full height, clipped to top 35% */}
      <View style={{ height: colorHeight, backgroundColor: baseColor, overflow: "hidden" }}>
        <StripePattern width={width} height={colorHeight} />
      </View>

      {/* White gradient covers from bottom up — sits on top of color */}
      <LinearGradient
        colors={["transparent", SYS_BG]}
        locations={[0.15, 0.35]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}
