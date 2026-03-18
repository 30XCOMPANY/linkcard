/**
 * [INPUT]: expo-router Stack, react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          @/src/design-system/settings SettingsGroup/SettingsRow/SettingsSectionHeader/SettingsSeparator/SettingsChevron,
 *          @/src/stores/cardStore, @/src/lib/icons
 * [OUTPUT]: VersionsScreen — shared version-management screen for route shells
 * [POS]: screens/home shared implementation consumed by iOS and non-iOS version routes
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Stack } from "expo-router";

import { Icon } from "@/src/lib/icons";
import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";
import {
  SettingsChevron,
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
} from "@/src/design-system/settings";

export default function VersionsScreen() {
  const card = useCardStore((state) => state.card);
  const deleteVersion = useCardStore((state) => state.deleteVersion);
  const moveVersions = useCardStore((state) => state.moveVersions);
  const setDefaultVersion = useCardStore((state) => state.setDefaultVersion);

  if (!card) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No versions available.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Card Versions" }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <SettingsSectionHeader title="CARD VERSION" />
        <SettingsGroup>
          {card.versions.map((version, index) => (
            <React.Fragment key={version.id}>
              {index > 0 ? <SettingsSeparator /> : null}
              <SettingsRow
                title={version.name}
                onPress={() => setDefaultVersion(version.id)}
                trailing={
                  <View style={styles.trailing}>
                    {version.isDefault ? (
                      <Text style={styles.defaultLabel}>Default</Text>
                    ) : null}
                    <Icon
                      web={index === 0 ? "minus" : "chevron.up"}
                      size={16}
                      color={index === 0 ? "rgba(60,60,67,0.18)" : "#007AFF"}
                    />
                    <Icon
                      web={index === card.versions.length - 1 ? "minus" : "chevron.down"}
                      size={16}
                      color={
                        index === card.versions.length - 1
                          ? "rgba(60,60,67,0.18)"
                          : "#007AFF"
                      }
                    />
                    <SettingsChevron />
                  </View>
                }
              />
              <View style={styles.actions}>
                <SettingsRow
                  title="Move Up"
                  onPress={() => {
                    if (index === 0) return;
                    moveVersions([index], index - 1);
                  }}
                  trailing={<Icon web="chevron.up" size={16} color="#007AFF" />}
                />
                <SettingsSeparator />
                <SettingsRow
                  title="Move Down"
                  onPress={() => {
                    if (index === card.versions.length - 1) return;
                    moveVersions([index], index + 2);
                  }}
                  trailing={<Icon web="chevron.down" size={16} color="#007AFF" />}
                />
                <SettingsSeparator />
                <SettingsRow
                  destructive
                  title="Delete Version"
                  onPress={() => {
                    if (card.versions.length <= 1) return;
                    Alert.alert(
                      "Delete Version",
                      `Delete ${version.name}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteVersion(version.id),
                        },
                      ]
                    );
                  }}
                />
              </View>
            </React.Fragment>
          ))}
        </SettingsGroup>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 48,
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
  trailing: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  defaultLabel: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    marginHorizontal: 16,
  },
});
