/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, react-native Switch/Alert/StyleSheet,
 *          @/src/stores/cardStore, @/src/lib/haptics, @/src/lib/icons Icon
 * [OUTPUT]: SettingsScreen — Apple grouped list with sync controls and data management
 * [POS]: Settings tab — user preferences, sync controls, data management
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { Switch, Alert, StyleSheet } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";

import { useCardStore } from "@/src/stores/cardStore";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="text-sf-text-2"
      style={styles.sectionHeader}
    >
      {title}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Row                                                       */
/* ------------------------------------------------------------------ */

function SettingsRow({
  title,
  subtitle,
  accessory,
  onPress,
  destructive,
}: {
  title: string;
  subtitle?: string;
  accessory?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !accessory}
    >
      <View style={styles.rowTextBlock}>
        <Text
          className={destructive ? "text-sf-red" : "text-sf-text"}
          style={styles.rowTitle}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sf-text-2" style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {accessory}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Screen                                                    */
/* ------------------------------------------------------------------ */

export default function SettingsScreen() {
  const clearCard = useCardStore((s) => s.clearCard);
  const [autoSync, setAutoSync] = useState(true);

  const handleSyncNow = () => {
    haptic.light();
    Alert.alert("Syncing...", "Refreshing your LinkedIn data.");
  };

  const handleResetCard = () => {
    haptic.heavy();
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

  return (
    <ScrollView
      className="flex-1 bg-sf-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-12"
    >
      {/* SYNC */}
      <SectionHeader title="Sync" />
      <View
        className="bg-sf-card rounded-[10px] overflow-hidden"
        style={styles.group}
      >
        <SettingsRow
          title="Auto-sync LinkedIn"
          subtitle="Check for profile changes"
          accessory={
            <Switch
              value={autoSync}
              onValueChange={(val) => setAutoSync(val)}
            />
          }
        />
        <View className="h-px bg-sf-separator" style={styles.separator} />
        <SettingsRow
          title="Sync Now"
          subtitle="Refresh data manually"
          onPress={handleSyncNow}
          accessory={
            <Icon web="chevron-right" size={14} color="rgba(0,0,0,0.2)" />
          }
        />
      </View>

      {/* DATA */}
      <SectionHeader title="Data" />
      <View
        className="bg-sf-card rounded-[10px] overflow-hidden"
        style={styles.group}
      >
        <SettingsRow
          title="Reset Card"
          destructive
          onPress={handleResetCard}
          accessory={<Icon web="trash" size={18} color="#FF383C" />}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text className="text-sf-text-3" style={styles.footerText}>LinkCard v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 35,
    marginBottom: 6,
    marginHorizontal: 20,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  group: {
    marginHorizontal: 16,
    borderCurve: "continuous" as any,
  },
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  rowTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    marginLeft: 16,
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
});
