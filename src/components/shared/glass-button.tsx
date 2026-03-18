/**
 * [INPUT]: react-native Pressable/Text/StyleSheet, @/src/components/shared/adaptive-glass,
 *          @/src/lib/platform-color
 * [OUTPUT]: GlassButton — primary and secondary action buttons with Liquid Glass effect
 * [POS]: Shared primitive — consistent glass CTA across onboarding, modals, and action sheets
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { platformColor } from "@/src/lib/platform-color";

/* ── Primary Glass Button ──────────────────────────────────── */

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "dark" | "blue" | "white";
}

const VARIANTS = {
  dark: {
    tintColor: "#1C1C1ECC",
    fallbackColor: "#1C1C1E",
    disabledTint: "#8E8E93CC",
    disabledFallback: "#C7C7CC",
    labelColor: "#FFFFFF",
    disabledLabelColor: "#FFFFFF",
  },
  blue: {
    tintColor: "#007AFFCC",
    fallbackColor: "#007AFF",
    disabledTint: "#8E8E93CC",
    disabledFallback: "#C7C7CC",
    labelColor: "#FFFFFF",
    disabledLabelColor: "#FFFFFF",
  },
  white: {
    tintColor: "#FFFFFFCC",
    fallbackColor: "#FFFFFF",
    disabledTint: "#F2F2F7CC",
    disabledFallback: "#F2F2F7",
    labelColor: "#0A0A0A",
    disabledLabelColor: "#8E8E93",
  },
};

export function GlassButton({
  label,
  onPress,
  disabled,
  style,
  variant = "dark",
}: GlassButtonProps) {
  const v = VARIANTS[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.88 }]}
    >
      <AdaptiveGlass
        style={StyleSheet.flatten([styles.button, style])}
        glassEffectStyle="regular"
        tintColor={disabled ? v.disabledTint : v.tintColor}
        intensity={60}
        blurTint="default"
        fallbackColor={disabled ? v.disabledFallback : v.fallbackColor}
      >
        <Text style={[styles.label, { color: disabled ? v.disabledLabelColor : v.labelColor }]}>
          {label}
        </Text>
      </AdaptiveGlass>
    </Pressable>
  );
}

/* ── Secondary Text Button ─────────────────────────────────── */

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
}

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable hitSlop={12} onPress={onPress} style={styles.secondary}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 50,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
  },
  secondary: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  secondaryLabel: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
    fontWeight: "500",
  },
});
