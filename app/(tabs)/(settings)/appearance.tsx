/**
 * [INPUT]: react-native ScrollView/Text/View/StyleSheet,
 *          @/src/stores/cardStore, @/src/design-system/settings primitives,
 *          @/src/lib/icons Icon, @/src/lib/name-fonts nameFonts/NameFontKey
 * [OUTPUT]: AppearanceScreen — theme mode segmented control + name font picker with live preview
 * [POS]: Settings sub-page — visual customization for theme and card name font
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useCardStore } from "@/src/stores/cardStore";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import { platformColor } from "@/src/lib/platform-color";
import type { ThemeMode } from "@/src/types";
import {
  SettingsGroup,
  SettingsGroupFooter,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsSegmented,
  settingsPageStyle,
} from "@/src/design-system/settings";

const THEME_OPTIONS = ["Light", "Dark", "System"] as const;
const THEME_MAP: Record<string, ThemeMode> = {
  Light: "light",
  Dark: "dark",
  System: "system",
};
const THEME_REVERSE: Record<ThemeMode, number> = {
  light: 0,
  dark: 1,
  system: 2,
};

const FONT_KEYS: NameFontKey[] = ["classic", "modern", "mono", "system"];

export default function AppearanceScreen() {
  const themeMode = useCardStore((s) => s.themeMode);
  const nameFont = useCardStore((s) => s.nameFont) ?? "classic";
  const setThemeMode = useCardStore((s) => s.setThemeMode);
  const setNameFont = useCardStore((s) => s.setNameFont);
  const profileName = useCardStore((s) => s.card?.profile?.name) ?? "Your Name";

  const activeFontFamily = nameFonts[nameFont].fontFamily;

  return (
    <ScrollView
      style={settingsPageStyle}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {/* ── THEME ── */}
      <SettingsSectionHeader title="THEME" />
      <SettingsGroup>
        <View style={styles.segmentedWrap}>
          <SettingsSegmented
            values={THEME_OPTIONS}
            selectedIndex={THEME_REVERSE[themeMode]}
            onChange={(i) => {
              haptic.selection();
              setThemeMode(THEME_MAP[THEME_OPTIONS[i]]);
            }}
          />
        </View>
      </SettingsGroup>
      <SettingsGroupFooter text="Choose how LinkCard appears. System follows your device settings." />

      {/* ── NAME FONT ── */}
      <SettingsSectionHeader title="NAME FONT" />
      <SettingsGroup>
        {FONT_KEYS.map((key, i) => (
          <React.Fragment key={key}>
            <SettingsRow
              title={nameFonts[key].label}
              titleStyle={
                nameFonts[key].fontFamily
                  ? { fontFamily: nameFonts[key].fontFamily }
                  : undefined
              }
              onPress={() => {
                haptic.selection();
                setNameFont(key);
              }}
              trailing={
                nameFont === key ? (
                  <Icon web="checkmark" size={18} color={platformColor("systemBlue")} />
                ) : null
              }
            />
            {i < FONT_KEYS.length - 1 ? <SettingsSeparator /> : null}
          </React.Fragment>
        ))}
      </SettingsGroup>
      <SettingsGroupFooter text="The name font applies to your name on all card versions." />

      {/* ── LIVE PREVIEW ── */}
      <SettingsSectionHeader title="PREVIEW" />
      <SettingsGroup>
        <View style={styles.previewWrap}>
          <Text
            style={[
              styles.previewName,
              activeFontFamily ? { fontFamily: activeFontFamily } : undefined,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {profileName}
          </Text>
        </View>
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  segmentedWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewWrap: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
    textAlign: "center",
  },
});
