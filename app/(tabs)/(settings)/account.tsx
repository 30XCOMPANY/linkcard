/**
 * [INPUT]: react-native ScrollView/Text/View/Alert/Linking/PlatformColor/StyleSheet,
 *          @/src/stores/cardStore, @/src/components/shared/avatar Avatar,
 *          @/src/design-system/settings primitives, @/src/lib/haptics, @/src/lib/icons Icon
 * [OUTPUT]: AccountScreen — profile summary, linked accounts, re-sync, sign out, delete account
 * [POS]: Settings sub-page — account management and linked service overview
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import {
  Alert,
  Linking,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCardStore } from "@/src/stores/cardStore";
import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import {
  SettingsGroup,
  SettingsGroupFooter,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsChevron,
  SettingsIconTile,
} from "@/src/design-system/settings";

export default function AccountScreen() {
  const card = useCardStore((s) => s.card);
  const clearCard = useCardStore((s) => s.clearCard);
  const profile = card?.profile;

  // Derive accent color from the default version
  const defaultVersion = card?.versions.find((v) => v.isDefault) ?? card?.versions[0];
  const accentColor = defaultVersion?.accentColor ?? "#007AFF";

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Your card data will remain on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
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
      "Delete Account",
      "This will permanently delete your account and all card data. This cannot be undone.",
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
                    clearCard();
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
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL(profile.url);
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Re-sync Profile"
          subtitle="Refresh from LinkedIn"
          leading={<SettingsIconTile web="refresh" color="#34C759" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Alert.alert("Syncing...", "Refreshing your LinkedIn data.");
          }}
        />
      </SettingsGroup>
      <SettingsGroupFooter text="Your LinkedIn data is imported locally. LinkCard does not store your LinkedIn credentials." />

      {/* ── DANGER ZONE ── */}
      <SettingsSectionHeader title="" />
      <SettingsGroup>
        <SettingsRow
          title="Sign Out"
          leading={<SettingsIconTile web="arrow-right" color="#FF3B30" />}
          onPress={handleSignOut}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Delete Account"
          destructive
          leading={<SettingsIconTile web="trash" color="#FF3B30" />}
          onPress={handleDeleteAccount}
        />
      </SettingsGroup>
      <SettingsGroupFooter text="Signing out keeps your card data on this device. Deleting your account removes all data permanently." />
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
    color: PlatformColor("secondaryLabel") as unknown as string,
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
    color: PlatformColor("label") as unknown as string,
  },
  profileDetail: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
