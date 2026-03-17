/**
 * [INPUT]: react-native View/Text/PlatformColor/StyleSheet
 * [OUTPUT]: DiscoverScreen — discover feed with card browsing and actions
 * [POS]: Discover tab main screen — one card at a time with Next/Say Hi buttons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";

export default function DiscoverScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Discover — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: {
    fontSize: 17,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
