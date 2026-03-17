/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, react-native Switch/Alert,
 *          @/src/stores/cardStore, @/src/lib/haptics, @/src/lib/icons Icon,
 *          @/src/components/shared/striped-background BG_COLORS
 * [OUTPUT]: SettingsScreen — Apple grouped list with appearance, sync, and data sections
 * [POS]: Settings tab — user preferences, background color picker, sync controls
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState } from "react";
import { Switch, Alert } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { Animated } from "@/src/tw/animated";

import { useCardStore } from "@/src/stores/cardStore";
import { StripedBackground, BG_COLORS, type BgColorKey } from "@/src/components/shared/striped-background";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-caption-1 font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8">
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
      className="flex-row items-center justify-between px-4 min-h-[44px] py-3"
      onPress={onPress}
      disabled={!onPress && !accessory}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={
            destructive ? "text-body text-sf-red" : "text-body text-sf-text"
          }
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-footnote text-sf-text-2">{subtitle}</Text>
        )}
      </View>
      {accessory}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Color Dot                                                          */
/* ------------------------------------------------------------------ */

function ColorDot({
  colorKey,
  hex,
  selected,
  onPress,
}: {
  colorKey: string;
  hex: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          haptic.selection();
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.9, springs.snappy); }}
        onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
        accessibilityLabel={`${colorKey} background`}
        accessibilityRole="button"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: hex,
          borderWidth: selected ? 3 : 1,
          borderColor: selected ? "#000000" : "rgba(0,0,0,0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <Icon web="check" size={16} color="#FFFFFF" />}
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings Screen                                                    */
/* ------------------------------------------------------------------ */

export default function SettingsScreen() {
  const clearCard = useCardStore((s) => s.clearCard);
  const currentGradient = useCardStore((s) => s.currentGradient);
  const setCurrentGradient = useCardStore((s) => s.setCurrentGradient);
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
    <View style={{ flex: 1 }}>
      <StripedBackground color={currentGradient || "cyan"} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
        style={{ backgroundColor: "transparent" }}
      >
        {/* APPEARANCE */}
      <SectionHeader title="Appearance" />
      <View
        className="bg-sf-card rounded-2xl overflow-hidden mx-4 p-4"
        style={{ borderCurve: "continuous" as any }}
      >
        <Text className="text-subheadline font-medium text-sf-text mb-3">
          Background Color
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {(Object.entries(BG_COLORS) as [BgColorKey, string][]).map(
            ([key, hex]) => (
              <ColorDot
                key={key}
                colorKey={key}
                hex={hex}
                selected={currentGradient === key}
                onPress={() => setCurrentGradient(key)}
              />
            )
          )}
        </View>
      </View>

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
            <Icon web="chevron-right" size={14} color="rgba(0,0,0,0.2)" />
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
          accessory={<Icon web="trash" size={18} color="#FF383C" />}
        />
      </View>

      {/* Footer */}
      <View className="items-center mt-12 pb-8">
        <Text className="text-caption-2 text-sf-text-3">LinkCard v1.0.0</Text>
      </View>
      </ScrollView>
    </View>
  );
}
