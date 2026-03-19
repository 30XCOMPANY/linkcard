/**
 * [INPUT]: react-native Pressable/Text/StyleSheet, @/src/components/shared/adaptive-glass,
 *          @/src/lib/platform-color, @/src/lib/theme
 * [OUTPUT]: GlassButton — primary and secondary action buttons with Liquid Glass effect
 * [POS]: Shared primitive — consistent glass CTA across onboarding, modals, and action sheets
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { platformColor } from "@/src/lib/platform-color";
import { useResolvedTheme } from "@/src/lib/theme";

/* ── Primary Glass Button ──────────────────────────────────── */

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "dark" | "blue" | "white";
}

function getVariantPalette(variant: "dark" | "blue" | "white", isDark: boolean) {
  const disabled = {
    tintColor: isDark ? "#636366CC" : "#C7CDD8CC",
    fallbackColor: isDark ? "#3A3A3C" : "#D7DCE5",
    labelColor: isDark ? "#F3F4F6" : "#475569",
  };

  if (variant === "blue") {
    return {
      tintColor: isDark ? "#0A84FFCC" : "#007AFFCC",
      fallbackColor: isDark ? "#0A84FF" : "#007AFF",
      labelColor: "#FFFFFF",
      disabled,
    };
  }

  if (variant === "white") {
    return {
      tintColor: isDark ? "#FFFFFF1A" : "#FFFFFFCC",
      fallbackColor: isDark ? "rgba(255,255,255,0.12)" : "#FFFFFF",
      labelColor: isDark ? "#FFFFFF" : "#0F172A",
      disabled,
    };
  }

  return {
    tintColor: isDark ? "#202127CC" : "#111827CC",
    fallbackColor: isDark ? "#202127" : "#0F172A",
    labelColor: "#FFFFFF",
    disabled,
  };
}

export function GlassButton({
  label,
  onPress,
  disabled,
  style,
  variant = "dark",
}: GlassButtonProps) {
  const resolvedTheme = useResolvedTheme();
  const palette = getVariantPalette(variant, resolvedTheme === "dark");

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.88 }]}
    >
      <AdaptiveGlass
        style={StyleSheet.flatten([styles.button, style])}
        glassEffectStyle="regular"
        tintColor={disabled ? palette.disabled.tintColor : palette.tintColor}
        intensity={60}
        blurTint="default"
        fallbackColor={disabled ? palette.disabled.fallbackColor : palette.fallbackColor}
      >
        <Text style={[styles.label, { color: disabled ? palette.disabled.labelColor : palette.labelColor }]}>
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
