/**
 * [INPUT]: react-native ScrollView/Switch/PlatformColor/StyleSheet,
 *          @/src/design-system/settings primitives, @/src/lib/haptics
 * [OUTPUT]: NotificationsScreen — push notification toggles
 * [POS]: Settings sub-page — notification type preferences
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { PlatformColor, ScrollView, StyleSheet, Switch } from "react-native";

import { haptic } from "@/src/lib/haptics";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsIconTile,
} from "@/src/design-system/settings";

export default function NotificationsScreen() {
  const [profileUpdates, setProfileUpdates] = useState(true);
  const [shareActivity, setShareActivity] = useState(true);
  const [syncReminders, setSyncReminders] = useState(false);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SettingsSectionHeader title="NOTIFICATION TYPES" />
      <SettingsGroup>
        <SettingsRow
          title="Profile Updates"
          subtitle="When LinkedIn data changes"
          leading={<SettingsIconTile web="person" color="#34C759" />}
          trailing={
            <Switch
              value={profileUpdates}
              onValueChange={(val) => {
                haptic.selection();
                setProfileUpdates(val);
              }}
            />
          }
        />
        <SettingsSeparator />
        <SettingsRow
          title="Share Activity"
          subtitle="When someone views your card"
          leading={<SettingsIconTile web="share" color="#007AFF" />}
          trailing={
            <Switch
              value={shareActivity}
              onValueChange={(val) => {
                haptic.selection();
                setShareActivity(val);
              }}
            />
          }
        />
        <SettingsSeparator />
        <SettingsRow
          title="Sync Reminders"
          subtitle="Periodic sync notifications"
          leading={<SettingsIconTile web="reload" color="#FF9500" />}
          trailing={
            <Switch
              value={syncReminders}
              onValueChange={(val) => {
                haptic.selection();
                setSyncReminders(val);
              }}
            />
          }
        />
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
