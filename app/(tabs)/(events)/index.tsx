/**
 * [INPUT]: react-native View/Text/PlatformColor/StyleSheet
 * [OUTPUT]: EventsScreen — events listing and management
 * [POS]: Events tab main screen — placeholder for upcoming events feature
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";

export default function EventsScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: PlatformColor("label") as unknown as string,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
