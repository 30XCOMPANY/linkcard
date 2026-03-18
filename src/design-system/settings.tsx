/**
 * [INPUT]: react-native Platform/PlatformColor/StyleSheet/ViewStyle, @/src/tw View/Text/Pressable,
 *          @/src/lib/haptics, @/src/lib/icons Icon, @/src/components/shared/avatar Avatar
 * [OUTPUT]: SettingsSectionHeader, SettingsGroup, SettingsRow, SettingsSegmented, SettingsColorGrid,
 *           SettingsChevron, SettingsIconTile, SettingsAccountCard, settingsPageStyle
 * [POS]: design-system entry for iOS grouped settings surfaces, rows, account hero, inline controls, and page background
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { View, Text, Pressable } from "@/src/tw";
import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { Icon } from "@/src/lib/icons";
import { Avatar } from "@/src/components/shared/avatar";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";

const settingsColors = {
  page: platformColor("systemGroupedBackground"),
  group: platformColor("secondarySystemGroupedBackground"),
  separator: platformColor("separator"),
};

export const settingsPageStyle = {
  backgroundColor: settingsColors.page,
} satisfies ViewStyle;

export function SettingsChevron() {
  return <Icon web="chevron-right" size={16} color="rgba(60,60,67,0.3)" />;
}

export function SettingsIconTile({
  web,
  color,
}: {
  web: string;
  color: string;
}) {
  return (
    <AdaptiveGlass
      style={{ ...styles.iconTile, backgroundColor: color }}
      intensity={12}
      blurTint="default"
      fallbackColor={color}
      glassEffectStyle="clear"
    >
      <Icon web={web} size={16} color="#FFFFFF" />
    </AdaptiveGlass>
  );
}

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

export function SettingsGroupFooter({ text }: { text: string }) {
  return (
    <Text className="text-sf-text-2" style={styles.groupFooter}>
      {text}
    </Text>
  );
}

export function SettingsRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  destructive = false,
  titleStyle,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  titleStyle?: TextStyle;
}) {
  const content = (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textBlock}>
        <Text
          className={destructive ? "text-sf-red" : "text-sf-text"}
          style={[styles.rowTitle, titleStyle]}
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

export function SettingsAccountCard({
  name,
  subtitle,
  detail,
  avatarSource,
  accentColor,
  footerLabel,
  footerLeading,
  onPress,
  onFooterPress,
}: {
  name: string;
  subtitle: string;
  detail?: string;
  avatarSource?: string | null;
  accentColor: string;
  footerLabel: string;
  footerLeading?: React.ReactNode;
  onPress?: () => void;
  onFooterPress?: () => void;
}) {
  return (
    <SettingsGroup style={styles.accountCard}>
      <Pressable
        disabled={!onPress}
        onPress={() => {
          if (!onPress) return;
          haptic.light();
          onPress();
        }}
      >
        <View style={styles.accountPrimary}>
          <Avatar source={avatarSource} name={name} size={60} accentColor={accentColor} />
          <View style={styles.accountText}>
            <Text className="text-sf-text" style={styles.accountName}>
              {name}
            </Text>
            <Text className="text-sf-text-2" style={styles.accountSubtitle}>
              {subtitle}
            </Text>
            {detail ? (
              <Text className="text-sf-text-2" style={styles.accountDetail}>
                {detail}
              </Text>
            ) : null}
          </View>
          <SettingsChevron />
        </View>
      </Pressable>

      <SettingsSeparator inset={92} />

      <Pressable
        disabled={!onFooterPress}
        onPress={() => {
          if (!onFooterPress) return;
          haptic.light();
          onFooterPress();
        }}
      >
        <View style={styles.accountFooter}>
          <View style={styles.accountFooterLeading}>
            {footerLeading}
          </View>
          <Text className="text-sf-text" style={styles.accountFooterLabel}>
            {footerLabel}
          </Text>
          <SettingsChevron />
        </View>
      </Pressable>
    </SettingsGroup>
  );
}

export function SettingsSegmented({
  values,
  selectedIndex,
  onChange,
  renderLabel,
}: {
  values: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  renderLabel?: (value: string, index: number, selected: boolean) => React.ReactNode;
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
            {renderLabel ? renderLabel(value, index, selected) : (
              <Text
                className={selected ? "text-sf-text" : "text-sf-text-2"}
                style={[styles.segmentedLabel, selected && styles.segmentedLabelSelected]}
              >
                {value}
              </Text>
            )}
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
  groupFooter: {
    marginTop: 6,
    marginHorizontal: 20,
    fontSize: 13,
    lineHeight: 18,
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
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderCurve: "continuous" as any,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  accountCard: {
    marginTop: 12,
  },
  accountPrimary: {
    minHeight: 96,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  accountText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  accountName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  accountSubtitle: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 22,
  },
  accountDetail: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
  },
  accountFooter: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  accountFooterLeading: {
    flexShrink: 0,
    marginRight: 16,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  accountFooterLabel: {
    flex: 1,
    marginRight: 12,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
  },
});
