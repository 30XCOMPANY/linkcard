/**
 * [INPUT]: @/src/tw View/Text/ScrollView, react-native Switch/Alert/StyleSheet,
 *          @/src/stores/cardStore, @/src/design-system/settings primitives, @/src/lib/icons Icon
 * [OUTPUT]: SettingsScreen — Apple grouped list built from shared settings primitives
 * [POS]: Settings tab — preferences and destructive actions on top of the settings design system
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { Switch, Alert, StyleSheet } from "react-native";
import { View, Text, ScrollView } from "@/src/tw";

import { useCardStore } from "@/src/stores/cardStore";
import { Icon } from "@/src/lib/icons";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
} from "@/src/design-system/settings";

export default function SettingsScreen() {
  const clearCard = useCardStore((s) => s.clearCard);
  const [autoSync, setAutoSync] = useState(true);

  const handleSyncNow = () => {
    Alert.alert("Syncing...", "Refreshing your LinkedIn data.");
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
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-12"
    >
      <SettingsSectionHeader title="SYNC" />
      <SettingsGroup>
        <SettingsRow
          title="Auto-sync LinkedIn"
          subtitle="Check for profile changes"
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
          trailing={<Icon web="chevron-right" size={14} color="rgba(0,0,0,0.2)" />}
        />
      </SettingsGroup>

      <SettingsSectionHeader title="DATA" />
      <SettingsGroup>
        <SettingsRow
          title="Reset Card"
          destructive
          onPress={handleResetCard}
          trailing={<Icon web="trash" size={18} color="#FF383C" />}
        />
      </SettingsGroup>

      <View style={styles.footer}>
        <Text className="text-sf-text-3" style={styles.footerText}>LinkCard v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    marginTop: 48,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 13,
  },
});
