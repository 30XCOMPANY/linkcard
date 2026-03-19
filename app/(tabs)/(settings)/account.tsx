/**
 * [INPUT]: react-native ScrollView/Text/View/Alert/Linking/PlatformColor/StyleSheet,
 *          @/src/stores/cardStore, @/src/components/shared/avatar Avatar,
 *          @/src/design-system/settings primitives, @/src/lib/haptics, @/src/lib/icons Icon
 * [OUTPUT]: AccountScreen — profile summary, linked accounts, import status, clear-card, and delete-data actions
 * [POS]: Settings sub-page — account management with actions named after their real effects
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";
import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import {
  SettingsGroup,
  SettingsGroupFooter,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsIconTile,
  settingsPageStyle,
} from "@/src/design-system/settings";

export default function AccountScreen() {
  const card = useCardStore((s) => s.card);
  const clearCard = useCardStore((s) => s.clearCard);
  const resetAllData = useCardStore((s) => s.resetAllData);
  const profile = card?.profile;

  // Derive accent color from the default version
  const defaultVersion = card?.versions.find((v) => v.isDefault) ?? card?.versions[0];
  const accentColor = defaultVersion?.accentColor ?? "#007AFF";

  const handleRemoveCard = () => {
    Alert.alert(
      "Remove Imported Card",
      "This clears your current card and sends you back through onboarding. Your app preferences stay intact.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Card",
          style: "destructive",
          onPress: () => {
            haptic.warning();
            clearCard();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete All LinkCard Data",
      "This permanently deletes the imported card and resets your local app preferences. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you sure?",
              "All your data will be permanently deleted.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: () => {
                    haptic.error();
                    resetAllData();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No account data</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={settingsPageStyle}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {/* ── PROFILE ── */}
      <SettingsSectionHeader title="PROFILE" />
      <SettingsGroup>
        <View style={styles.profileRow}>
          <Avatar
            source={profile.photoUrl}
            name={profile.name}
            size={60}
            accentColor={accentColor}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileDetail}>
              {[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
            </Text>
            {profile.email ? (
              <Text style={styles.profileDetail}>{profile.email}</Text>
            ) : null}
          </View>
        </View>
      </SettingsGroup>
      <SettingsGroupFooter text="To edit your profile, tap your card on the Home tab." />

      {/* ── LINKED ACCOUNTS ── */}
      <SettingsSectionHeader title="LINKED ACCOUNTS" />
      <SettingsGroup>
        <SettingsRow
          title="LinkedIn"
          subtitle={profile.username}
          leading={<SettingsIconTile web="link" color="#0A66C2" />}
          onPress={() => {
            haptic.light();
            Linking.openURL(profile.url);
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Last Imported"
          subtitle={new Date(profile.lastSynced).toLocaleDateString()}
          leading={<SettingsIconTile web="refresh" color="#34C759" />}
          trailing={<Text style={styles.statusText}>Auto-sync</Text>}
        />
      </SettingsGroup>
      <SettingsGroupFooter text="Your LinkedIn data is imported locally. LinkCard does not store your LinkedIn credentials, and manual refresh is not yet exposed as a separate flow." />

      {/* ── DANGER ZONE ── */}
      <SettingsSectionHeader title="" />
      <SettingsGroup>
        <SettingsRow
          title="Remove Imported Card"
          leading={<SettingsIconTile web="arrow-right" color="#FF3B30" />}
          onPress={handleRemoveCard}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Delete All LinkCard Data"
          destructive
          leading={<SettingsIconTile web="trash" color="#FF3B30" />}
          onPress={handleDeleteAccount}
        />
      </SettingsGroup>
      <SettingsGroupFooter text="Removing the imported card preserves app preferences. Deleting all LinkCard data clears the card and resets app-level settings." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 17,
    color: platformColor("secondaryLabel"),
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: platformColor("label"),
  },
  profileDetail: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    color: platformColor("secondaryLabel"),
  },
  statusText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: platformColor("secondaryLabel"),
  },
});
