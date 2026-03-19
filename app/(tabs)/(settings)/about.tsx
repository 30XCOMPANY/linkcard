/**
 * [INPUT]: react-native ScrollView/Text/View/Image/PlatformColor/StyleSheet/Linking/Platform/Alert,
 *          @/src/design-system/settings primitives, @/src/lib/icons Icon
 * [OUTPUT]: AboutScreen — app hero, app info, legal links (with icons), support actions, team footer
 * [POS]: Settings sub-page — read-only app information and external links
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsChevron,
  SettingsIconTile,
  settingsPageStyle,
} from "@/src/design-system/settings";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";
const buildNumber =
  Platform.OS === "ios"
    ? (Constants.expoConfig?.ios?.buildNumber ?? "1")
    : (Constants.expoConfig?.android?.versionCode?.toString() ?? "1");

export default function AboutScreen() {
  return (
    <ScrollView
      style={settingsPageStyle}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {/* ── App hero ─────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Image
          source={require("@/assets/icon.png")}
          style={styles.heroIcon}
        />
        <Text style={styles.heroName}>LinkCard</Text>
        <Text style={styles.heroTagline}>Professional Networking Cards</Text>
      </View>

      {/* ── App info ─────────────────────────────────────────────── */}
      <SettingsSectionHeader title="APP INFO" />
      <SettingsGroup>
        <SettingsRow
          title="Version"
          trailing={<Text style={styles.detailText}>{appVersion}</Text>}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Build"
          trailing={<Text style={styles.detailText}>{buildNumber}</Text>}
        />
      </SettingsGroup>

      {/* ── Legal ────────────────────────────────────────────────── */}
      <SettingsSectionHeader title="LEGAL" />
      <SettingsGroup>
        <SettingsRow
          title="Terms of Service"
          leading={<SettingsIconTile web="document" color="#5856D6" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.ai/terms");
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Privacy Policy"
          leading={<SettingsIconTile web="eye" color="#34C759" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.ai/privacy");
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Open Source Licenses"
          leading={<SettingsIconTile web="code" color="#FF9500" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.ai/licenses");
          }}
        />
      </SettingsGroup>

      {/* ── Support ──────────────────────────────────────────────── */}
      <SettingsSectionHeader title="SUPPORT" />
      <SettingsGroup>
        <SettingsRow
          title="Send Feedback"
          leading={<SettingsIconTile web="mail" color="#007AFF" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL(
              `mailto:feedback@linkcard.ai?subject=LinkCard%20Feedback%20v${appVersion}&body=%0A%0A---%0AVersion: ${appVersion} (${buildNumber})%0APlatform: ${Platform.OS}`
            );
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Rate on App Store"
          leading={<SettingsIconTile web="star" color="#FF9500" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Alert.alert("Rate LinkCard", "App Store rating coming soon!");
          }}
        />
      </SettingsGroup>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <Text style={styles.footer}>Made with care in San Francisco</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  // ── Hero ──────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  heroName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "700",
    color: platformColor("label"),
  },
  heroTagline: {
    marginTop: 4,
    fontSize: 15,
    color: platformColor("secondaryLabel"),
  },
  // ── Rows ──────────────────────────────────────────────────────
  detailText: {
    fontSize: 17,
    lineHeight: 22,
    color: platformColor("secondaryLabel"),
  },
  // ── Footer ────────────────────────────────────────────────────
  footer: {
    marginTop: 48,
    paddingBottom: 32,
    textAlign: "center",
    fontSize: 13,
    color: platformColor("tertiaryLabel"),
  },
});
