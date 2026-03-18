/**
 * [INPUT]: react-native ScrollView/Text/View/PlatformColor/StyleSheet/Linking/Platform,
 *          @/src/design-system/settings primitives, @/src/lib/icons Icon
 * [OUTPUT]: AboutScreen — app info, legal links, support actions
 * [POS]: Settings sub-page — read-only app information and external links
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Linking, Platform, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import { haptic } from "@/src/lib/haptics";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsChevron,
  SettingsIconTile,
} from "@/src/design-system/settings";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";
const buildNumber = Platform.OS === "ios"
  ? Constants.expoConfig?.ios?.buildNumber ?? "1"
  : Constants.expoConfig?.android?.versionCode?.toString() ?? "1";

export default function AboutScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
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

      <SettingsSectionHeader title="LEGAL" />
      <SettingsGroup>
        <SettingsRow
          title="Terms of Service"
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.app/terms");
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Privacy Policy"
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.app/privacy");
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Open Source Licenses"
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://linkcard.app/licenses");
          }}
        />
      </SettingsGroup>

      <SettingsSectionHeader title="SUPPORT" />
      <SettingsGroup>
        <SettingsRow
          title="Send Feedback"
          leading={<SettingsIconTile web="mail" color="#007AFF" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("mailto:feedback@linkcard.app");
          }}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Rate on App Store"
          leading={<SettingsIconTile web="star" color="#FF9500" />}
          trailing={<SettingsChevron />}
          onPress={() => {
            haptic.light();
            Linking.openURL("https://apps.apple.com/app/linkcard/id0000000000");
          }}
        />
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  detailText: {
    fontSize: 17,
    lineHeight: 22,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
