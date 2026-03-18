/**
 * [INPUT]: react-native Text/View/StyleSheet, react-native-reanimated,
 *          expo-symbols SymbolView, @/src/components/shared/adaptive-glass
 * [OUTPUT]: PillToast — floating pill notification with icon + message, auto-dismiss
 * [POS]: Shared primitive — top-of-screen feedback toast for copy, save, share actions
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { platformColor } from "@/src/lib/platform-color";

interface PillToastProps {
  /** SF Symbol name for the icon */
  icon: string;
  /** Toast message */
  message: string;
  /** Accent color for icon background and text */
  color?: string;
  /** Auto-dismiss after ms (0 = no auto-dismiss) */
  duration?: number;
  /** Called when toast should be dismissed */
  onDismiss: () => void;
}

export function PillToast({
  icon,
  message,
  color = platformColor("systemBlue"),
  duration = 2000,
  onDismiss,
}: PillToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  // Dynamic import to avoid crash on web
  const SymbolView = React.useMemo(() => {
    try { return require("expo-symbols").SymbolView; } catch { return null; }
  }, []);

  return (
    <Animated.View
      entering={ZoomIn.duration(250).withInitialValues({ transform: [{ scale: 0.92 }] })}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <AdaptiveGlass
        style={styles.pill}
        glassEffectStyle="clear"
        blurTint="default"
        intensity={58}
        tintColor="#FFFFFFCC"
        fallbackColor="rgba(255,255,255,0.90)"
      >
        <View style={[styles.iconWrap, { backgroundColor: `${color}14` }]}>
          {SymbolView ? (
            <SymbolView
              name={icon}
              resizeMode="scaleAspectFit"
              style={styles.icon}
              tintColor={color}
            />
          ) : (
            <Text style={{ color, fontSize: 14 }}>*</Text>
          )}
        </View>
        <Text style={[styles.label, { color }]}>{message}</Text>
      </AdaptiveGlass>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    overflow: "hidden",
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
});
