/**
 * [INPUT]: expo-router Stack, react-native PlatformColor/StyleSheet/View/Text,
 *          @expo/ui/swift-ui Host/List/Section/LabeledContent/Text/Label,
 *          @expo/ui/swift-ui/modifiers environment/listStyle/onTapGesture/deleteDisabled/moveDisabled/foregroundStyle/font/listRowSeparator/lineLimit,
 *          @/src/stores/cardStore, @/src/lib/haptics
 * [OUTPUT]: VersionsNativeScreen — iOS native card version manager with swipe delete and reorder
 * [POS]: screens/home native iOS implementation used when ExpoUI host is available
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text as RNText } from "react-native";
import { Stack } from "expo-router";
import { Host, LabeledContent, List, Section, Text } from "@expo/ui/swift-ui";
import {
  deleteDisabled,
  environment,
  font,
  foregroundStyle,
  lineLimit,
  listStyle,
  moveDisabled,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";

export default function VersionsNativeScreen() {
  const card = useCardStore((state) => state.card);
  const deleteVersion = useCardStore((state) => state.deleteVersion);
  const moveVersions = useCardStore((state) => state.moveVersions);
  const setDefaultVersion = useCardStore((state) => state.setDefaultVersion);
  const [editing, setEditing] = useState(false);

  const handleDelete = useCallback(
    (indices: number[]) => {
      const versions = card?.versions ?? [];
      [...indices]
        .sort((a, b) => b - a)
        .forEach((index) => {
          const version = versions[index];
          if (!version) return;
          deleteVersion(version.id);
        });
    },
    [card?.versions, deleteVersion]
  );

  const handleMove = useCallback(
    (sourceIndices: number[], destination: number) => {
      moveVersions(sourceIndices, destination);
    },
    [moveVersions]
  );

  if (!card) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>No versions available.</RNText>
      </View>
    );
  }

  const versionCount = card.versions.length;

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
            title="CARD VERSION"
            footer={
              <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                Swipe left to delete. Tap Edit to reorder.
              </Text>
            }
          >
            <List.ForEach onDelete={handleDelete} onMove={handleMove}>
              {card.versions.map((version) => (
                <LabeledContent
                  key={version.id}
                  label={version.name}
                  modifiers={[
                    onTapGesture(() => {
                      if (editing) return;
                      haptic.selection();
                      setDefaultVersion(version.id);
                    }),
                    deleteDisabled(versionCount <= 1),
                    moveDisabled(versionCount <= 1),
                  ]}
                >
                  <Text
                    modifiers={[
                      foregroundStyle(version.isDefault ? "#007AFF" : "clear"),
                      font({ size: 17 }),
                      lineLimit(1),
                    ]}
                  >
                    {version.isDefault ? "✓ Default" : ""}
                  </Text>
                </LabeledContent>
              ))}
            </List.ForEach>
          </Section>
        </List>
      </Host>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => {
            haptic.light();
            setEditing((prev) => !prev);
          }}
        >
          {editing ? "Done" : "Edit"}
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
