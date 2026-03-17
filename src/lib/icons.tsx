/**
 * [INPUT]: expo-image, @expo/vector-icons Ionicons, process.env.EXPO_OS
 * [OUTPUT]: Icon component (SF Symbols on iOS, Ionicons on web/Android)
 * [POS]: Core utility — platform-adaptive icon rendering
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const isIOS = process.env.EXPO_OS === "ios";

interface IconProps {
  ios: string;
  web: string;
  size?: number;
  color?: string;
}

export function Icon({ ios, web, size = 24, color = "#000000" }: IconProps) {
  if (isIOS) {
    return (
      <Image
        source={`sf:${ios}`}
        style={{ width: size, height: size, tintColor: color }}
      />
    );
  }
  return <Ionicons name={web as any} size={size} color={color} />;
}
