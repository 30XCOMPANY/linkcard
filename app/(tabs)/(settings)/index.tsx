/**
 * [INPUT]: @/src/tw View/Text/ScrollView, react-native Switch/Alert/StyleSheet/Platform/PlatformColor,
 *          @/src/stores/cardStore (updateContactAction), @/src/types (ContactAction/ContactActionType),
 *          @/src/design-system/settings primitives, @/src/lib/icons Icon
 * [OUTPUT]: SettingsScreen — Apple grouped list with sync, contact preferences, and data sections
 * [POS]: Settings tab — preferences and destructive actions on top of the settings design system
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useRef, useState } from "react";
import { Pressable, Switch, Alert, StyleSheet, ScrollView as RNScrollView, Platform, PlatformColor } from "react-native";
import type { ContactActionType } from "@/src/types";
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
  const updateContactAction = useCardStore((s) => s.updateContactAction);
  const contactAction = card?.contactAction;
  const [autoSync, setAutoSync] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const CONTACT_METHODS: { type: ContactActionType; label: string; placeholder: string }[] = [
    { type: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    { type: "email", label: "Email", placeholder: "you@example.com" },
    { type: "wechat", label: "WeChat", placeholder: "WeChat ID" },
    { type: "url", label: "Custom URL", placeholder: "https://..." },
  ];

  const handleContactMethodPick = () => {
    const options = [...CONTACT_METHODS.map((m) => m.label), "Cancel"];
    if (Platform.OS === "ios") {
      const ActionSheetIOS = require("react-native").ActionSheetIOS;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: CONTACT_METHODS.length },
        (index: number) => {
          if (index >= CONTACT_METHODS.length) return;
          const method = CONTACT_METHODS[index];
          updateContactAction({
            type: method.type,
            label: method.label,
            value: contactAction?.value ?? "",
          });
        }
      );
    } else {
      Alert.alert("Contact Method", "Choose how others can reach you",
        CONTACT_METHODS.map((method) => ({
          text: method.label,
          onPress: () =>
            updateContactAction({
              type: method.type,
              label: method.label,
              value: contactAction?.value ?? "",
            }),
        })).concat({ text: "Cancel", onPress: () => {} })
      );
    }
  };

  const handleContactValueEdit = () => {
    const method = CONTACT_METHODS.find((m) => m.type === contactAction?.type);
    Alert.prompt(
      "Contact Value",
      `Enter your ${contactAction?.label ?? "contact"} info`,
      (text) => {
        if (!text?.trim()) return;
        updateContactAction({
          type: contactAction?.type ?? "linkedin",
          label: contactAction?.label ?? "LinkedIn",
          value: text.trim(),
        });
      },
      "plain-text",
      contactAction?.value ?? "",
      method?.placeholder
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

      <SettingsSectionHeader title="CONTACT PREFERENCES" />
      <SettingsGroup>
        <SettingsRow
          title="Contact Method"
          leading={<SettingsIconTile web="person" color="#5856D6" />}
          trailing={
            <Text style={styles.trailingValue}>
              {contactAction?.label ?? "Not set"}
            </Text>
          }
          onPress={handleContactMethodPick}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Contact Value"
          subtitle={contactAction?.value || "Tap to set"}
          leading={<SettingsIconTile web="link" color="#32ADE6" />}
          trailing={<SettingsChevron />}
          onPress={handleContactValueEdit}
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

      {devMode ? (
        <>
          <SettingsSectionHeader title="DEVELOPER" />
          <SettingsGroup>
            <SettingsRow
              title="Restart Onboarding"
              subtitle="Clear card and re-enter setup flow"
              onPress={() => {
                Alert.alert(
                  "Restart Onboarding",
                  "This will clear your card and return to the onboarding flow.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Restart",
                      style: "destructive",
                      onPress: () => clearCard(),
                    },
                  ]
                );
              }}
              leading={<SettingsIconTile web="arrow-forward" color="#FF9500" />}
              trailing={<SettingsChevron />}
            />
          </SettingsGroup>
        </>
      ) : null}

      <Pressable
        onPress={() => {
          tapCountRef.current += 1;
          if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
          if (tapCountRef.current >= 3) {
            tapCountRef.current = 0;
            setDevMode((prev) => !prev);
          } else {
            tapTimerRef.current = setTimeout(() => {
              tapCountRef.current = 0;
            }, 600);
          }
        }}
      >
        <View style={styles.footer}>
          <Text className="text-sf-text-3" style={styles.footerText}>LinkCard v1.0.0</Text>
        </View>
      </Pressable>
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
  trailingValue: {
    fontSize: 17,
    lineHeight: 22,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
