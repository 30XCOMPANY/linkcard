/**
 * [INPUT]: @/src/tw View/Text/ScrollView, react-native Switch/Alert/StyleSheet,
 *          @/src/stores/cardStore, @/src/design-system/settings primitives, @/src/lib/icons Icon
 * [OUTPUT]: SettingsScreen — Apple grouped list built from shared settings primitives
 * [POS]: Settings tab — preferences and destructive actions on top of the settings design system
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useState } from "react";
import { Switch, Alert, StyleSheet, ScrollView as RNScrollView } from "react-native";
import { View, Text } from "@/src/tw";

import { useCardStore } from "@/src/stores/cardStore";
import { Icon } from "@/src/lib/icons";
import {
  SettingsAccountCard,
  SettingsChevron,
  SettingsGroup,
  SettingsIconTile,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  settingsPageStyle,
} from "@/src/design-system/settings";

export default function SettingsScreen() {
  const card = useCardStore((s) => s.card);
  const clearCard = useCardStore((s) => s.clearCard);
  const [autoSync, setAutoSync] = useState(true);
  const profile = card?.profile;
  const versionCount = card?.versions.length ?? 0;

  const handleSyncNow = () => {
    Alert.alert("Syncing...", "Refreshing your LinkedIn data.");
  };

  const handleManageAccount = () => {
    Alert.alert("Account", "Apple-style account hub placeholder.");
  };

  const handleManageVersions = () => {
    Alert.alert("Versions", `You have ${versionCount} saved card version${versionCount === 1 ? "" : "s"}.`);
  };

  const handleResetCard = () => {
    Alert.alert(
      "Reset Card",
      "This will delete your card and all versions. You'll need to re-import your LinkedIn profile.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => clearCard(),
        },
      ]
    );
  };

  return (
    <RNScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {profile ? (
        <SettingsAccountCard
          name={profile.name}
          subtitle={[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
          detail={profile.email ?? profile.location}
          avatarSource={profile.photoUrl}
          accentColor="#0A84FF"
          footerLabel={`${versionCount} Card Version${versionCount === 1 ? "" : "s"}`}
          footerLeading={<View style={styles.versionStack}>{card?.versions.slice(0, 3).map((version, index) => (
            <View
              key={version.id}
              style={[
                styles.versionDot,
                { backgroundColor: version.accentColor, marginLeft: index === 0 ? 0 : -8 },
              ]}
            >
              <Text style={styles.versionDotLabel}>{version.name.slice(0, 1)}</Text>
            </View>
          ))}</View>}
          onPress={handleManageAccount}
          onFooterPress={handleManageVersions}
        />
      ) : null}

      <SettingsSectionHeader title="SYNC" />
      <SettingsGroup>
        <SettingsRow
          title="Auto-sync LinkedIn"
          subtitle="Check for profile changes"
          leading={<SettingsIconTile web="reload" color="#34C759" />}
          trailing={
            <Switch
              value={autoSync}
              onValueChange={(val) => setAutoSync(val)}
            />
          }
        />
        <SettingsSeparator />
        <SettingsRow
          title="Sync Now"
          subtitle="Refresh data manually"
          onPress={handleSyncNow}
          leading={<SettingsIconTile web="refresh" color="#0A84FF" />}
          trailing={<SettingsChevron />}
        />
      </SettingsGroup>

      <SettingsSectionHeader title="DATA" />
      <SettingsGroup>
        <SettingsRow
          title="Reset Card"
          destructive
          onPress={handleResetCard}
          leading={<SettingsIconTile web="trash" color="#8E8E93" />}
          trailing={<Icon web="trash" size={18} color="#FF3B30" />}
        />
      </SettingsGroup>

      <View style={styles.footer}>
        <Text className="text-sf-text-3" style={styles.footerText}>LinkCard v1.0.0</Text>
      </View>
    </RNScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  footer: {
    alignItems: "center",
    marginTop: 48,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 13,
  },
  versionStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  versionDotLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
});
