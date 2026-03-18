/**
 * [INPUT]: react-native View/Pressable/StyleSheet/Text, @/src/components/shared/adaptive-glass,
 *          @/src/lib/haptics, screens/discover discover-screen-base
 * [OUTPUT]: DiscoverScreen — shared discover implementation for non-iOS platforms
 * [POS]: screens/discover fallback shell using app-local glass buttons while reusing shared feed behavior
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { haptic } from "@/src/lib/haptics";

import { DiscoverScreenBase } from "@/src/screens/discover/discover-screen-base";

export default function DiscoverScreen() {
  return (
    <DiscoverScreenBase
      renderActionBar={({ actionLabel, onNext, onSayHi }) => (
        <View style={styles.floatingBar}>
          <Pressable
            onPress={() => {
              haptic.light();
              onNext();
            }}
            style={styles.actionWrap}
          >
            <AdaptiveGlass
              blurTint="default"
              fallbackColor="rgba(0,0,0,0.08)"
              glassEffectStyle="regular"
              intensity={40}
              style={styles.actionGlass}
              tintColor="#00000015"
            >
              <Text style={styles.secondaryLabel}>Next</Text>
            </AdaptiveGlass>
          </Pressable>
          <View style={styles.spacer} />
          <Pressable
            onPress={() => {
              haptic.medium();
              onSayHi();
            }}
            style={styles.actionWrap}
          >
            <AdaptiveGlass
              blurTint="default"
              fallbackColor="#007AFF"
              glassEffectStyle="regular"
              intensity={60}
              style={styles.actionGlass}
              tintColor="#007AFFCC"
            >
              <Text style={styles.primaryLabel}>{actionLabel}</Text>
            </AdaptiveGlass>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  floatingBar: {
    bottom: 0,
    flexDirection: "row",
    left: 0,
    paddingBottom: 100,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
  },
  actionWrap: {
    flex: 1,
  },
  actionGlass: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
  },
  spacer: {
    width: 12,
  },
  secondaryLabel: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
