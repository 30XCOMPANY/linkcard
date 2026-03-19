/**
 * [INPUT]: react-native StyleSheet/ViewStyle, @/src/tw View/Text/Pressable, @/src/lib/platform-color,
 *          @/src/lib/haptics, @/src/lib/icons Icon, @/src/components/shared/avatar Avatar,
 *          @/src/lib/semantic-colors useSemanticColors
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
import { useSemanticColors } from "@/src/lib/semantic-colors";

const settingsColors = {
  page: platformColor("systemGroupedBackground"),
  group: platformColor("secondarySystemGroupedBackground"),
  separator: platformColor("separator"),
};

export const settingsPageStyle = {
  backgroundColor: settingsColors.page,
} satisfies ViewStyle;

export function SettingsChevron() {
  const sc = useSemanticColors();
  return <Icon web="chevron-right" size={16} color={sc.chevronTint} />;
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
    <Text style={[styles.sectionHeader, { color: platformColor("secondaryLabel") }]}>
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
    <Text style={[styles.groupFooter, { color: platformColor("secondaryLabel") }]}>
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
          style={[
            styles.rowTitle,
            { color: destructive ? platformColor("systemRed") : platformColor("label") },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: platformColor("secondaryLabel") }]}>
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
            <Text style={[styles.accountName, { color: platformColor("label") }]}>
              {name}
            </Text>
            <Text style={[styles.accountSubtitle, { color: platformColor("secondaryLabel") }]}>
              {subtitle}
            </Text>
            {detail ? (
              <Text style={[styles.accountDetail, { color: platformColor("secondaryLabel") }]}>
                {detail}
              </Text>
            ) : null}
          </View>
          {onPress ? <SettingsChevron /> : null}
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
          <Text style={[styles.accountFooterLabel, { color: platformColor("label") }]}>
            {footerLabel}
          </Text>
          {onFooterPress ? <SettingsChevron /> : null}
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
  const sc = useSemanticColors();
  return (
    <View style={[styles.segmentedContainer, { backgroundColor: sc.segmentedTrackBg }]}>
      {values.map((value, index) => {
        const selected = selectedIndex === index;
        return (
          <Pressable
            key={value}
            style={[
              styles.segmentedItem,
              selected && styles.segmentedItemSelected,
              selected && { backgroundColor: sc.segmentedSelectedBg, boxShadow: `0 1px 2px ${sc.segmentedSelectedShadow}` },
            ]}
            onPress={() => {
              haptic.selection();
              onChange(index);
            }}
          >
            {renderLabel ? renderLabel(value, index, selected) : (
              <Text
                style={[
                  styles.segmentedLabel,
                  { color: selected ? platformColor("label") : platformColor("secondaryLabel") },
                  selected && styles.segmentedLabelSelected,
                ]}
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
  const sc = useSemanticColors();
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
            selectedColor === color && { borderColor: sc.colorChipSelectedBorder },
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
  },
  segmentedItem: {
    flex: 1,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedItemSelected: {},
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
