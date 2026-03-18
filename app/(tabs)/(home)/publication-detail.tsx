/**
 * [INPUT]: expo-router useLocalSearchParams, react-native StyleSheet/View/Text,
 *          @expo/ui/swift-ui Host/List/Section/TextField/Text,
 *          @expo/ui/swift-ui/modifiers listStyle/foregroundStyle,
 *          @/src/stores/cardStore, @/src/lib/platform-color
 * [OUTPUT]: PublicationDetailScreen — SwiftUI form to edit a single publication's fields
 * [POS]: Push screen from publications — inline TextField editing for title, URL, publisher
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, View, Text as RNText } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Host, List, Section, TextField, Text } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";

export default function PublicationDetailScreen() {
  const { index: indexParam } = useLocalSearchParams<{ index: string }>();
  const pubIndex = parseInt(indexParam ?? "0", 10);

  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const publications = card?.profile.publications ?? [];
  const pub = publications[pubIndex];

  const handleFieldChange = useCallback(
    (field: "title" | "url" | "publisher", value: string) => {
      const pubs = [...publications];
      pubs[pubIndex] = { ...pubs[pubIndex], [field]: value.trim() || undefined };
      updateProfile({ publications: pubs });
    },
    [publications, pubIndex, updateProfile]
  );

  if (!card || !pub) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>Publication not found.</RNText>
      </View>
    );
  }

  return (
    <Host style={styles.host}>
      <List modifiers={[listStyle("insetGrouped")]}>
        <Section
          footer={
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
              Changes are saved automatically.
            </Text>
          }
        >
          <TextField
            defaultValue={pub.title}
            placeholder="Title"
            onSubmit={(value) => handleFieldChange("title", value)}
          />
          <TextField
            defaultValue={pub.url ?? ""}
            placeholder="URL"
            keyboardType="url"
            autocorrection={false}
            onSubmit={(value) => handleFieldChange("url", value)}
          />
          <TextField
            defaultValue={pub.publisher ?? ""}
            placeholder="Publisher"
            onSubmit={(value) => handleFieldChange("publisher", value)}
          />
        </Section>
      </List>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
  },
});
