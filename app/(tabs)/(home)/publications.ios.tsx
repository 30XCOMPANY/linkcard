/**
 * [INPUT]: expo-router Stack, react-native Alert/StyleSheet/View/Text,
 *          @expo/ui/swift-ui Host/List/Section/LabeledContent/Text,
 *          @expo/ui/swift-ui/modifiers environment/listStyle/onTapGesture/foregroundStyle/font/lineLimit,
 *          @/src/stores/cardStore, @/src/lib/haptics
 * [OUTPUT]: PublicationsScreen — native SwiftUI list with swipe-to-delete, tap-to-edit
 * [POS]: Push screen from editor — flat list of publications with native iOS interactions
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View, Text as RNText } from "react-native";
import { Stack } from "expo-router";
import { Host, LabeledContent, List, Section, Text } from "@expo/ui/swift-ui";
import {
  environment,
  font,
  foregroundStyle,
  lineLimit,
  listStyle,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";

export default function PublicationsScreen() {
  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);
  const [editing, setEditing] = useState(false);

  const publications = card?.profile.publications ?? [];

  const handleDelete = useCallback(
    (indices: number[]) => {
      const pubs = [...publications];
      [...indices]
        .sort((a, b) => b - a)
        .forEach((index) => pubs.splice(index, 1));
      updateProfile({ publications: pubs });
    },
    [publications, updateProfile]
  );

  const handleEdit = useCallback(
    (index: number) => {
      const pub = publications[index];
      if (!pub) return;

      const editField = (field: "title" | "url" | "publisher", label: string) => {
        Alert.prompt(
          label,
          undefined,
          (text?: string) => {
            const pubs = [...publications];
            pubs[index] = { ...pubs[index], [field]: text?.trim() || undefined };
            updateProfile({ publications: pubs });
          },
          "plain-text",
          (pub as any)[field] ?? ""
        );
      };

      Alert.alert(pub.title, undefined, [
        { text: "Title", onPress: () => editField("title", "Title") },
        { text: "URL", onPress: () => editField("url", "URL") },
        { text: "Publisher", onPress: () => editField("publisher", "Publisher") },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [publications, updateProfile]
  );

  const handleAdd = useCallback(() => {
    Alert.prompt(
      "New Publication",
      "Enter the title",
      (text?: string) => {
        if (!text?.trim()) return;
        updateProfile({ publications: [...publications, { title: text.trim() }] });
      },
      "plain-text"
    );
  }, [publications, updateProfile]);

  if (!card) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>No card available.</RNText>
      </View>
    );
  }

  return (
    <>
      <Host style={styles.host}>
        <List
          modifiers={[
            listStyle("insetGrouped"),
            environment("editMode", editing ? "active" : "inactive"),
          ]}
        >
          <Section
            footer={
              publications.length > 0 ? (
                <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                  Swipe left to delete. Tap to edit.
                </Text>
              ) : undefined
            }
          >
            {publications.length > 0 ? (
              <List.ForEach onDelete={handleDelete}>
                {publications.map((pub, i) => (
                  <LabeledContent
                    key={`pub-${i}`}
                    label={pub.title}
                    modifiers={[
                      onTapGesture(() => {
                        if (editing) return;
                        haptic.light();
                        handleEdit(i);
                      }),
                    ]}
                  >
                    <Text
                      modifiers={[
                        foregroundStyle({ type: "hierarchical", style: "secondary" }),
                        font({ size: 14 }),
                        lineLimit(1),
                      ]}
                    >
                      {[pub.publisher, pub.url].filter(Boolean).join(" · ") || "Tap to edit"}
                    </Text>
                  </LabeledContent>
                ))}
              </List.ForEach>
            ) : (
              <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                No publications yet. Tap + to add one.
              </Text>
            )}
          </Section>
        </List>
      </Host>

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          onPress={() => {
            haptic.light();
            setEditing((prev) => !prev);
          }}
        >
          {editing ? "Done" : "Edit"}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => {
            haptic.light();
            handleAdd();
          }}
        >
          Add
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
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
