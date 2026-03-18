/**
 * [INPUT]: react-native ScrollView/Text/View/PlatformColor/StyleSheet,
 *          @/src/stores/cardStore, @/src/design-system/settings primitives,
 *          @/src/lib/icons Icon, @/src/lib/name-fonts nameFonts/NameFontKey
 * [OUTPUT]: AppearanceScreen — theme mode segmented control + name font picker
 * [POS]: Settings sub-page — visual customization for theme and card name font
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCardStore } from "@/src/stores/cardStore";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { ThemeMode } from "@/src/types";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsSegmented,
  SettingsIconTile,
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
const FONT_LABELS: Record<NameFontKey, string> = {
  classic: "Classic",
  modern: "Modern",
  mono: "Mono",
  system: "System",
};

export default function AppearanceScreen() {
  const themeMode = useCardStore((s) => s.themeMode);
  const nameFont = useCardStore((s) => s.nameFont) ?? "classic";
  const setThemeMode = useCardStore((s) => s.setThemeMode);
  const setNameFont = useCardStore((s) => s.setNameFont);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
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

      <SettingsSectionHeader title="NAME FONT" />
      <SettingsGroup>
        {FONT_KEYS.map((key, i) => (
          <React.Fragment key={key}>
            <SettingsRow
              title={FONT_LABELS[key]}
              onPress={() => {
                haptic.selection();
                setNameFont(key);
              }}
              trailing={
                nameFont === key ? (
                  <Icon web="checkmark" size={18} color="#007AFF" />
                ) : null
              }
            />
            {i < FONT_KEYS.length - 1 ? <SettingsSeparator /> : null}
          </React.Fragment>
        ))}
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
});
