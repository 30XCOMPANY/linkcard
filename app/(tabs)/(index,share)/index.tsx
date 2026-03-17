/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/tw/animated Animated,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics haptic, @/src/lib/springs springs, @/src/lib/icons Icon, @/src/lib/cn cn
 * [OUTPUT]: HomeScreen — card hero display, version selector, quick actions
 * [POS]: Primary tab screen — the card is the hero, everything serves it
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Animated } from "@/src/tw/animated";
import { FadeInDown, useSharedValue, withSpring } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import { cn } from "@/src/lib/cn";
import type { CardVersion } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Version Chip                                                       */
/* ------------------------------------------------------------------ */

function VersionChip({
  version,
  selected,
  onPress,
}: {
  version: CardVersion;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className={cn(
          "h-[40px] px-4 rounded-full flex-row items-center gap-2 min-h-[44px] min-w-[44px]",
          selected
            ? "bg-sf-card border-2"
            : "bg-sf-bg-2 border border-sf-card-border"
        )}
        style={[
          selected && {
            borderColor: version.accentColor,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          },
        ]}
        onPress={() => {
          haptic.selection();
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.97, springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.snappy);
        }}
      >
        <View
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: version.accentColor }}
        />
        <Text
          className={cn(
            "text-sm text-sf-text",
            selected ? "font-semibold" : "font-medium"
          )}
          selectable
        >
          {version.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action Button                                                */
/* ------------------------------------------------------------------ */

function QuickAction({
  ios,
  web,
  label,
  onPress,
}: {
  ios: string;
  web: string;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className="w-[44px] h-[44px] min-h-[44px] min-w-[44px] rounded-full bg-sf-card items-center justify-center"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.snappy);
        }}
      >
        <Icon ios={ios} web={web} size={20} />
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Screen                                                        */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const router = useRouter();
  const card = useCardStore((s) => s.card);

  // Find default version, fall back to first
  const defaultVersion =
    card?.versions.find((v) => v.isDefault) ?? card?.versions[0];
  const [selectedVersionId, setSelectedVersionId] = useState(
    defaultVersion?.id ?? ""
  );

  const [showQR, setShowQR] = useState(false);

  const currentVersion =
    card?.versions.find((v) => v.id === selectedVersionId) ?? defaultVersion;

  const handleSelectVersion = useCallback(
    (id: string) => setSelectedVersionId(id),
    []
  );

  /* Empty state */
  if (!card || !currentVersion) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-base text-sf-text-2" selectable>
          No card yet. Complete onboarding to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-sf-bg"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-8"
    >
      {/* Card Display — hero */}
      <Animated.View
        entering={FadeInDown.springify()
          .stiffness(springs.gentle.stiffness)
          .damping(springs.gentle.damping)}
        className="px-4 pt-4"
      >
        <CardDisplay
          profile={card.profile}
          version={currentVersion}
          qrCodeData={card.qrCodeData}
          showQR={showQR}
        />
      </Animated.View>

      {/* Version Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 py-4"
        className="mt-2"
      >
        {card.versions.map((v) => (
          <VersionChip
            key={v.id}
            version={v}
            selected={v.id === selectedVersionId}
            onPress={() => handleSelectVersion(v.id)}
          />
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View className="flex-row items-center justify-center gap-4 mt-2">
        <QuickAction
          ios="pencil"
          web="create-outline"
          label="Edit card"
          onPress={() => {
            haptic.light();
            router.push("/editor");
          }}
        />
        <QuickAction
          ios="square.and.arrow.up"
          web="share-outline"
          label="Share card"
          onPress={() => {
            haptic.light();
            router.push("/share");
          }}
        />
        <QuickAction
          ios="qrcode"
          web="qr-code-outline"
          label="Toggle QR code"
          onPress={() => {
            haptic.medium();
            setShowQR((prev) => !prev);
          }}
        />
      </View>
    </ScrollView>
  );
}
