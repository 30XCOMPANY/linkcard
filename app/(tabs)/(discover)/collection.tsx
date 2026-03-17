/**
 * [INPUT]: react-native View/Text/PlatformColor/StyleSheet
 * [OUTPUT]: CollectionScreen — saved contacts card holder list
 * [POS]: Card holder — push from discover header, list of saved contacts
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";

export default function CollectionScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Card Holder — Coming Soon</Text>
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
