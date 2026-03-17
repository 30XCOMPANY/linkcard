/**
 * [INPUT]: @/src/tw/image Image, @expo/vector-icons Ionicons, process.env.EXPO_OS
 * [OUTPUT]: Icon component (SF Symbols on iOS, Ionicons on web/Android)
 * [POS]: Core utility — platform-adaptive icon rendering
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Ionicons } from "@expo/vector-icons";

const isIOS = process.env.EXPO_OS === "ios";

interface IconProps {
  ios: string;
  web: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ ios, web, size = 24, color, className }: IconProps) {
  if (isIOS) {
    // Use expo-image with SF Symbol source
    const { Image } = require("@/src/tw/image");
    return (
      <Image
        source={`sf:${ios}`}
        className={className}
        style={{ width: size, height: size, tintColor: color }}
      />
    );
  }
  return <Ionicons name={web as any} size={size} color={color} />;
}
