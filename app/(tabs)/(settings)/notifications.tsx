/**
 * [INPUT]: react-native ScrollView/Switch/StyleSheet,
 *          @/src/design-system/settings primitives, @/src/lib/haptics,
 *          @/src/stores/cardStore (notif toggles + setters)
 * [OUTPUT]: NotificationsScreen — master permission toggle + persisted notification type toggles
 * [POS]: Settings sub-page — notification preferences backed by cardStore
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
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
  // System permission state — defaults true until real expo-notifications integration
  const [allowNotifications, setAllowNotifications] = useState(true);

  // Persisted notification type prefs from store
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
      {/* ------------------------------------------------------------------ */}
      {/* PERMISSIONS                                                          */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSectionHeader title="PERMISSIONS" />
      <SettingsGroup>
        <SettingsRow
          title="Allow Notifications"
          leading={<SettingsIconTile web="notifications" color="#FF3B30" />}
          trailing={
            <Switch
              value={allowNotifications}
              onValueChange={(val) => {
                haptic.selection();
                setAllowNotifications(val);
              }}
            />
          }
        />
      </SettingsGroup>
      <SettingsGroupFooter text="LinkCard needs notification permission to alert you about profile changes and sharing activity." />

      {/* ------------------------------------------------------------------ */}
      {/* NOTIFICATION TYPES                                                   */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSectionHeader title="NOTIFICATION TYPES" />
      <SettingsGroup>
        <SettingsRow
          title="Profile Updates"
          subtitle="When LinkedIn data changes"
          leading={<SettingsIconTile web="person" color="#34C759" />}
          trailing={
            <Switch
              disabled={!allowNotifications}
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
              disabled={!allowNotifications}
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
              disabled={!allowNotifications}
              value={syncReminders}
              onValueChange={(val) => {
                haptic.selection();
                setSyncReminders(val);
              }}
            />
          }
        />
      </SettingsGroup>
      <SettingsGroupFooter text="Profile Updates notify you when your LinkedIn data changes. Share Activity alerts you when someone views your shared card." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
