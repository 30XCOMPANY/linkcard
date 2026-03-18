/**
 * [INPUT]: react-native Pressable/Switch/Alert/StyleSheet/ScrollView/PlatformColor,
 *          expo-router useRouter, expo-constants Constants,
 *          @/src/stores/cardStore, @/src/tw View/Text,
 *          @/src/design-system/settings primitives, @/src/lib/icons Icon, @/src/lib/haptics
 * [OUTPUT]: SettingsScreen — navigation hub pushing to account, appearance, privacy, notifications, about
 * [POS]: Settings tab — Apple-style grouped list hub with inline sync controls and sub-page navigation
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useRef, useState } from "react";
import Constants from "expo-constants";
import {
  Alert,
  PlatformColor,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Switch,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { View } from "@/src/tw";

import { useCardStore, MOCK_CARD } from "@/src/stores/cardStore";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import {
  SettingsAccountCard,
  SettingsChevron,
  SettingsGroup,
  SettingsIconTile,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
} from "@/src/design-system/settings";

export default function SettingsScreen() {
  const router = useRouter();
  const card = useCardStore((s) => s.card);
  const setCard = useCardStore((s) => s.setCard);
  const clearCard = useCardStore((s) => s.clearCard);
  const themeMode = useCardStore((s) => s.themeMode);
  const autoSync = useCardStore((s) => s.autoSync);
  const setAutoSync = useCardStore((s) => s.setAutoSync);
  const nameFont = useCardStore((s) => s.nameFont) ?? "classic";
  const notifProfileUpdates = useCardStore((s) => s.notifProfileUpdates);
  const notifShareActivity = useCardStore((s) => s.notifShareActivity);
  const notifSyncReminders = useCardStore((s) => s.notifSyncReminders);
  const [devMode, setDevMode] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = card?.profile;
  const versionCount = card?.versions.length ?? 0;

  const themeLabel =
    themeMode === "light" ? "Light" : themeMode === "dark" ? "Dark" : "System";
  const fontLabel =
    nameFont === "classic" ? "Classic" :
    nameFont === "modern" ? "Modern" :
    nameFont === "mono" ? "Mono" : "System";
  const notifCount = [notifProfileUpdates, notifShareActivity, notifSyncReminders].filter(Boolean).length;

  const handleSyncNow = () => {
    haptic.light();
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
          onPress: () => {
            haptic.error();
            clearCard();
          },
        },
      ]
    );
  };

  return (
    <RNScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {/* ── Account Card ──────────────────────────────────── */}
      {profile ? (
        <SettingsAccountCard
          name={profile.name}
          subtitle={[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
          detail={profile.email ?? profile.location}
          avatarSource={profile.photoUrl}
          accentColor="#0A84FF"
          footerLabel={`${versionCount} Card Version${versionCount === 1 ? "" : "s"}`}
          footerLeading={
            <View style={styles.versionStack}>
              {card?.versions.slice(0, 3).map((version, index) => (
                <View
                  key={version.id}
                  style={[
                    styles.versionDot,
                    { backgroundColor: version.accentColor, marginLeft: index === 0 ? 0 : -8 },
                  ]}
                >
                  <Text style={styles.versionDotLabel}>{version.name.slice(0, 1)}</Text>
                </View>
              ))}
            </View>
          }
          onPress={() => {
            haptic.light();
            router.push("/(settings)/account" as any);
          }}
          onFooterPress={() => {
            haptic.light();
            router.push("/(home)/versions" as any);
          }}
        />
      ) : null}

      {/* ── Sync (inline — simple toggles stay here) ──────── */}
      <SettingsSectionHeader title="SYNC" />
      <SettingsGroup>
        <SettingsRow
          title="Auto-sync LinkedIn"
          subtitle="Check for profile changes"
          leading={<SettingsIconTile web="reload" color="#34C759" />}
          trailing={
            <Switch
              value={autoSync}
              onValueChange={(val) => {
                haptic.selection();
                setAutoSync(val);
              }}
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

      {/* ── Sub-page navigation rows ─────────────────────── */}
      <SettingsSectionHeader title="PREFERENCES" />
      <SettingsGroup>
        <SettingsRow
          title="Appearance"
          subtitle={`${themeLabel} · ${fontLabel}`}
          leading={<SettingsIconTile web="moon" color="#5856D6" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            router.push("/(settings)/appearance" as any);
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Privacy & Sharing"
          leading={<SettingsIconTile web="eye" color="#32ADE6" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            router.push("/(settings)/privacy" as any);
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Notifications"
          subtitle={`${notifCount} of 3 enabled`}
          leading={<SettingsIconTile web="bell" color="#FF3B30" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            router.push("/(settings)/notifications" as any);
          }}
        />
      </SettingsGroup>

      {/* ── Data (destructive stays inline) ───────────────── */}
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

      {/* ── About ─────────────────────────────────────────── */}
      <SettingsSectionHeader title="" />
      <SettingsGroup>
        <SettingsRow
          title="About LinkCard"
          leading={<SettingsIconTile web="heart" color="#FF9500" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            router.push("/(settings)/about" as any);
          }}
        />
      </SettingsGroup>

      {/* ── Developer (hidden) ────────────────────────────── */}
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
              leading={<SettingsIconTile web="reload" color="#FF9500" />}
              trailing={<SettingsChevron />}
            />
            <SettingsSeparator />
            <SettingsRow
              title="Reset as Default User"
              subtitle="Restore Zihan Huang demo card"
              onPress={() => {
                haptic.success();
                setCard(MOCK_CARD);
              }}
              leading={<SettingsIconTile web="person" color="#007AFF" />}
              trailing={<SettingsChevron />}
            />
          </SettingsGroup>
        </>
      ) : null}

      {/* ── Footer (triple-tap for dev mode) ──────────────── */}
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
          <Text style={styles.footerText}>LinkCard v{Constants.expoConfig?.version ?? "1.0.0"}</Text>
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
    color: PlatformColor("tertiaryLabel") as unknown as string,
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
