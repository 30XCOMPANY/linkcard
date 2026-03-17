/**
 * [INPUT]: expo-glass-effect, expo-blur, react-native AccessibilityInfo
 * [OUTPUT]: AdaptiveGlass component with runtime-guarded glass rendering and configurable fallback tint
 * [POS]: Shared wrapper — Liquid Glass on iOS 26+, BlurView fallback, configurable transparency on web/Android
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useEffect, useState } from "react";
import { AccessibilityInfo, ViewStyle } from "react-native";
import { View } from "@/src/tw";
import { BlurView } from "expo-blur";

// Conditional import — expo-glass-effect may not be available in all builds
let GlassView: any = null;
let isGlassEffectAPIAvailable: (() => boolean) | null = null;

try {
  const glassModule = require("expo-glass-effect");
  GlassView = glassModule.GlassView;
  isGlassEffectAPIAvailable = glassModule.isGlassEffectAPIAvailable;
} catch {}

const isIOS = process.env.EXPO_OS === "ios";
const isWeb = process.env.EXPO_OS === "web";

interface AdaptiveGlassProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  intensity?: number;
  blurTint?: "default" | "light" | "dark";
  fallbackColor?: string;
  glassEffectStyle?: "regular" | "clear" | "identity";
}

export function AdaptiveGlass({
  children,
  className,
  style,
  intensity = 40,
  blurTint = "light",
  fallbackColor = "rgba(255, 255, 255, 0.72)",
  glassEffectStyle = "regular",
}: AdaptiveGlassProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (!isIOS) return;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency
    );
    return () => sub?.remove();
  }, []);

  // Opaque fallback for reduced transparency
  if (reduceTransparency) {
    return (
      <View
        className={className}
        style={[{ backgroundColor: fallbackColor }, style]}
      >
        {children}
      </View>
    );
  }

  // iOS 26+ with Glass API
  if (isIOS && isGlassEffectAPIAvailable?.()) {
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        style={[{ borderCurve: "continuous" as any }, style]}
        className={className}
      >
        {children}
      </GlassView>
    );
  }

  // iOS fallback — BlurView
  if (isIOS) {
    return (
      <BlurView intensity={intensity} tint={blurTint} style={style} className={className}>
        {children}
      </BlurView>
    );
  }

  // Web — CSS backdrop-filter
  if (isWeb) {
    return (
      <View
        className={className}
        style={[
          {
            backgroundColor: fallbackColor,
            // @ts-expect-error web-only CSS properties
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android fallback — semi-transparent
  return (
    <View className={className} style={[{ backgroundColor: fallbackColor }, style]}>
      {children}
    </View>
  );
}
