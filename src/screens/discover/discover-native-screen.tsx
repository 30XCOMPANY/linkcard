/**
 * [INPUT]: @expo/ui/swift-ui Host/Button, @expo/ui/swift-ui/modifiers,
 *          screens/discover discover-screen-base
 * [OUTPUT]: DiscoverNativeScreen — iOS native discover implementation with SwiftUI glass buttons
 * [POS]: screens/discover iOS-native shell layering SwiftUI controls over shared swipe/feed behavior
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { Button as SwiftButton, Host } from "@expo/ui/swift-ui";
import { foregroundStyle, frame, glassEffect } from "@expo/ui/swift-ui/modifiers";

import { DiscoverScreenBase } from "@/src/screens/discover/discover-screen-base";

export default function DiscoverNativeScreen() {
  return (
    <DiscoverScreenBase
      renderActionBar={({ actionLabel, onNext, onSayHi }) => (
        <View style={styles.floatingBar}>
          <Host style={styles.host}>
            <SwiftButton
              label="Next"
              onPress={onNext}
              modifiers={[
                frame({ maxWidth: 9999, minHeight: 40 }),
                glassEffect({ glass: { variant: "regular" } }),
                foregroundStyle({ type: "hierarchical", style: "primary" }),
              ]}
            />
          </Host>
          <View style={styles.spacer} />
          <Host style={styles.host}>
            <SwiftButton
              label={actionLabel}
              onPress={onSayHi}
              modifiers={[
                frame({ maxWidth: 9999, minHeight: 40 }),
                glassEffect({ glass: { variant: "regular", tint: "#007AFF" } }),
                foregroundStyle("#FFFFFF"),
              ]}
            />
          </Host>
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
  host: {
    flex: 1,
    height: 40,
  },
  spacer: {
    width: 12,
  },
});
