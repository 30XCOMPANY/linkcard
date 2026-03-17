/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore useCardStore,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, react-native Switch/Alert,
 *          expo-router Stack
 * [OUTPUT]: SettingsScreen — native Apple Settings look with sync controls and data management
 * [POS]: Settings tab — account and sync management, Apple grouped list pattern
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { Switch, Alert } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Stack } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";

/* ------------------------------------------------------------------ */
/*  Separator                                                          */
/* ------------------------------------------------------------------ */

function Separator() {
  return <View className="h-px bg-sf-separator ml-4" />;
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8">
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
      className="flex-row items-center justify-between px-4 min-h-[44px] min-w-[44px] py-3"
      onPress={onPress}
      disabled={!onPress && !accessory}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={destructive ? "text-base text-sf-red" : "text-base text-sf-text"}
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
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "regular",
        }}
      />

      <ScrollView
        className="flex-1 bg-sf-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
      >
        {/* SYNC */}
        <SectionHeader title="Sync" />
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
                onValueChange={(val) => {
                  setAutoSync(val);
                }}
              />
            }
          />
          <Separator />
          <SettingsRow
            title="Sync Now"
            subtitle="Refresh data manually"
            onPress={handleSyncNow}
            accessory={
              <Icon ios="chevron.right" web="chevron-forward" size={16} />
            }
          />
        </View>

        {/* DATA */}
        <SectionHeader title="Data" />
        <View
          className="bg-sf-card rounded-2xl overflow-hidden mx-4"
          style={{ borderCurve: "continuous" as any }}
        >
          <SettingsRow
            title="Reset Card"
            destructive
            onPress={handleResetCard}
            accessory={
              <Icon ios="trash" web="trash-outline" size={18} color="var(--sf-red)" />
            }
          />
        </View>

        {/* Footer */}
        <View className="items-center gap-1 mt-4 pb-8">
          <Text className="text-xs text-sf-text-3">LinkCard v1.0.0</Text>
          <Text className="text-xs text-sf-text-3">Made with love</Text>
        </View>
      </ScrollView>
    </>
  );
}
