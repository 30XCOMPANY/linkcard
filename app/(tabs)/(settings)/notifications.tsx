/**
 * [INPUT]: react-native ScrollView/Switch/StyleSheet,
 *          @/src/design-system/settings primitives, @/src/lib/haptics,
 *          @/src/stores/cardStore (notif toggles + setters)
 * [OUTPUT]: NotificationsScreen — persisted alert preference toggles
 * [POS]: Settings sub-page — notification preferences backed by a single persistent state model
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { ScrollView, StyleSheet, Switch } from "react-native";

import { haptic } from "@/src/lib/haptics";
import {
  SettingsGroup,
  SettingsGroupFooter,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsIconTile,
} from "@/src/design-system/settings";
import { useCardStore } from "@/src/stores/cardStore";

export default function NotificationsScreen() {
  const profileUpdates = useCardStore((s) => s.notifProfileUpdates);
  const shareActivity = useCardStore((s) => s.notifShareActivity);
  const syncReminders = useCardStore((s) => s.notifSyncReminders);
  const setProfileUpdates = useCardStore((s) => s.setNotifProfileUpdates);
  const setShareActivity = useCardStore((s) => s.setNotifShareActivity);
  const setSyncReminders = useCardStore((s) => s.setNotifSyncReminders);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SettingsSectionHeader title="ALERT TYPES" />
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
      <SettingsGroupFooter text="These preferences are stored locally. System notification permission will be wired up when expo-notifications is integrated." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
