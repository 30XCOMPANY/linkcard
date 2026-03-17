/**
 * [INPUT]: react-native StyleSheet/ViewStyle/PlatformColor, @/src/tw View/Text/Pressable, @/src/lib/haptics
 * [OUTPUT]: SettingsSectionHeader, SettingsGroup, SettingsRow, SettingsSegmented, SettingsColorGrid, settingsPageStyle
 * [POS]: design-system entry for iOS grouped settings surfaces, rows, inline controls, and page background
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import { Platform, PlatformColor, StyleSheet, type ViewStyle } from "react-native";
import { View, Text, Pressable } from "@/src/tw";
import { haptic } from "@/src/lib/haptics";

const settingsColors = {
  page: Platform.OS === "ios" ? PlatformColor("systemGroupedBackground") : "#F2F2F7",
  group: Platform.OS === "ios" ? PlatformColor("secondarySystemGroupedBackground") : "#FFFFFF",
  separator: Platform.OS === "ios" ? PlatformColor("separator") : "rgba(60,60,67,0.29)",
};

export const settingsPageStyle = {
  backgroundColor: settingsColors.page,
} satisfies ViewStyle;

export function SettingsSectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sf-text-2" style={styles.sectionHeader}>
      {title}
    </Text>
  );
}

export function SettingsGroup({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[styles.group, style]}
    >
      {children}
    </View>
  );
}

export function SettingsSeparator({ inset = 16 }: { inset?: number }) {
  return <View style={[styles.separator, { marginLeft: inset }]} />;
}

export function SettingsRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  destructive = false,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textBlock}>
        <Text
          className={destructive ? "text-sf-red" : "text-sf-text"}
          style={styles.rowTitle}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sf-text-2" style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
    >
      {content}
    </Pressable>
  );
}

export function SettingsSegmented({
  values,
  selectedIndex,
  onChange,
}: {
  values: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <View style={styles.segmentedContainer}>
      {values.map((value, index) => {
        const selected = selectedIndex === index;
        return (
          <Pressable
            key={value}
            style={[styles.segmentedItem, selected && styles.segmentedItemSelected]}
            onPress={() => {
              haptic.selection();
              onChange(index);
            }}
          >
            <Text
              className={selected ? "text-sf-text" : "text-sf-text-2"}
              style={[styles.segmentedLabel, selected && styles.segmentedLabelSelected]}
            >
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SettingsColorGrid({
  colors,
  selectedColor,
  onSelect,
}: {
  colors: readonly string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  return (
    <View style={styles.colorGrid}>
      {colors.map((color) => (
        <Pressable
          key={color}
          onPress={() => {
            haptic.selection();
            onSelect(color);
          }}
          style={[
            styles.colorChip,
            { backgroundColor: color },
            selectedColor === color && styles.colorChipSelected,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 30,
    marginBottom: 6,
    marginHorizontal: 20,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  group: {
    marginHorizontal: 16,
    backgroundColor: settingsColors.group,
    borderRadius: 20,
    borderCurve: "continuous" as any,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: settingsColors.separator,
  },
  row: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  leading: {
    width: 28,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
  },
  trailing: {
    marginLeft: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  segmentedContainer: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 13,
    backgroundColor: "rgba(120,120,128,0.12)",
  },
  segmentedItem: {
    flex: 1,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedItemSelected: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  segmentedLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  segmentedLabelSelected: {
    fontWeight: "600",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorChip: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorChipSelected: {
    borderColor: "#000000",
  },
});
