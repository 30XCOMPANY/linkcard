/**
 * [INPUT]: @/src/tw View/Text, @/src/tw/image Image, expo-linear-gradient
 * [OUTPUT]: Avatar component with image source or initials-gradient fallback
 * [POS]: Shared avatar — Tailwind-styled port of ui/Avatar with boxShadow + tw Image
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { ViewStyle } from "react-native";
import { View, Text } from "@/src/tw";
import { Image } from "@/src/tw/image";
import { LinearGradient } from "expo-linear-gradient";

// ── Size presets ──────────────────────────────────────────────

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl" | number;

const sizeMap: Record<string, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  "2xl": 128,
};

const fontSizeMap: Record<string, number> = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 36,
  "2xl": 48,
};

// ── Props ─────────────────────────────────────────────────────

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  accentColor?: string;
  showBorder?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────

export function Avatar({
  source,
  name = "",
  size = "md",
  accentColor = "#6366F1",
  showBorder = false,
  className,
}: AvatarProps) {
  const dim = typeof size === "number" ? size : sizeMap[size] ?? 48;
  const fs = typeof size === "number" ? Math.round(size * 0.375) : fontSizeMap[size as string] ?? 16;

  const container: ViewStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    overflow: "hidden",
    boxShadow: "0px 1px 3px rgba(0,0,0,0.12)",
    ...(showBorder && { borderWidth: 3, borderColor: accentColor }),
  };

  if (source) {
    return (
      <View className={className} style={container}>
        <Image
          source={source}
          className="w-full h-full"
          style={{ objectFit: "cover" } as any}
          transition={300}
        />
      </View>
    );
  }

  return (
    <View className={className} style={container}>
      <LinearGradient
        colors={[accentColor, adjustColor(accentColor, -30)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: fs }}>
          {getInitials(name)}
        </Text>
      </LinearGradient>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
