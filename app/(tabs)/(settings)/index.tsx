/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore useCardStore,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, react-native Switch/Alert
 * [OUTPUT]: SettingsScreen — Apple grouped list with sync controls and data management
 * [POS]: Settings tab — account and sync management, editorial luxury finish
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { Switch, Alert } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { useCardStore } from "@/src/stores/cardStore";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";

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
      className="flex-row items-center justify-between px-4 min-h-[44px] py-3"
      onPress={onPress}
      disabled={!onPress && !accessory}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={
            destructive ? "text-base text-sf-red" : "text-base text-sf-text"
          }
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-sf-text-2">{subtitle}</Text>
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
      <Text className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8">
        Sync
      </Text>
      <View
        className="bg-sf-card rounded-2xl overflow-hidden mx-4"
        style={{ borderCurve: "continuous" as any }}
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
        <View className="h-px bg-sf-separator ml-4" />
        <SettingsRow
          title="Sync Now"
          subtitle="Refresh data manually"
          onPress={handleSyncNow}
          accessory={
            <Icon
              web="chevron-right"
              size={14}
              color="rgba(0,0,0,0.2)"
            />
          }
        />
      </View>

      {/* DATA */}
      <Text className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8">
        Data
      </Text>
      <View
        className="bg-sf-card rounded-2xl overflow-hidden mx-4"
        style={{ borderCurve: "continuous" as any }}
      >
        <SettingsRow
          title="Reset Card"
          destructive
          onPress={handleResetCard}
          accessory={
            <Icon web="trash-outline" size={18} color="var(--sf-red)" />
          }
        />
      </View>

      {/* Footer */}
      <View className="items-center mt-12 pb-8">
        <Text className="text-[11px] text-sf-text-3">LinkCard v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
