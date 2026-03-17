/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable/Link,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, @/src/lib/cn cn,
 *          react-native RefreshControl
 * [OUTPUT]: HomeScreen — card hero with context menu, pull-to-refresh, version chips, quick actions
 * [POS]: Primary tab screen — the card is the hero, everything serves it
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import { View, Text, ScrollView, Pressable, Link } from "@/src/tw";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import { cn } from "@/src/lib/cn";
import type { CardVersion } from "@/src/types";
import { Animated } from "@/src/tw/animated";

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
          "h-[40px] px-4 rounded-full flex-row items-center gap-2 min-h-[44px]",
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
        onPressIn={() => { scale.value = withSpring(0.97, springs.snappy); }}
        onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
      >
        <View
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: version.accentColor }}
        />
        <Text
          className={cn(
            "text-subheadline text-sf-text",
            selected ? "font-semibold" : "font-medium"
          )}
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
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className="w-[48px] h-[48px] min-h-[44px] min-w-[44px] rounded-2xl bg-sf-card items-center justify-center"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderCurve: "continuous" as any,
        }}
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, springs.snappy); }}
        onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
      >
        <Icon web={icon} size={20} />
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Screen                                                        */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const router = useRouter();
  const card = useCardStore((s: any) => s.card);

  const defaultVersion =
    card?.versions.find((v: CardVersion) => v.isDefault) ?? card?.versions[0];
  const [selectedVersionId, setSelectedVersionId] = useState(
    defaultVersion?.id ?? ""
  );
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentVersion =
    card?.versions.find((v: CardVersion) => v.id === selectedVersionId) ??
    defaultVersion;

  const handleSelectVersion = useCallback(
    (id: string) => setSelectedVersionId(id),
    []
  );

  /* Pull-to-refresh — re-sync card data */
  const onRefresh = useCallback(() => {
    haptic.medium();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  if (!card || !currentVersion) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-body text-sf-text-2" selectable>
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Card Display — hero with native context menu + preview */}
      <View className="px-4 pt-4">
        <Link href="/editor">
          <Link.Trigger>
            <CardDisplay
              profile={card.profile}
              version={currentVersion}
              qrCodeData={card.qrCodeData}
              showQR={showQR}
            />
          </Link.Trigger>
          <Link.Menu>
            <Link.MenuAction
              icon="pencil"
              onPress={() => router.push("/editor" as any)}
            >
              Edit Card
            </Link.MenuAction>
            <Link.MenuAction
              icon="square.and.arrow.up"
              onPress={() => router.push("/share" as any)}
            >
              Share
            </Link.MenuAction>
            <Link.MenuAction
              icon="qrcode"
              onPress={() => setShowQR(true)}
            >
              Show QR Code
            </Link.MenuAction>
          </Link.Menu>
          <Link.Preview />
        </Link>
      </View>

      {/* Version Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 py-3"
        className="mt-2"
      >
        {card.versions.map((v: CardVersion) => (
          <VersionChip
            key={v.id}
            version={v}
            selected={v.id === selectedVersionId}
            onPress={() => handleSelectVersion(v.id)}
          />
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View className="flex-row items-center justify-center gap-4 mt-3">
        <QuickAction
          icon="edit-pen"
          label="Edit card"
          onPress={() => { haptic.light(); router.push("/editor" as any); }}
        />
        <QuickAction
          icon="share"
          label="Share card"
          onPress={() => { haptic.light(); router.push("/share" as any); }}
        />
        <QuickAction
          icon="qr-code"
          label="Toggle QR code"
          onPress={() => { haptic.medium(); setShowQR((p) => !p); }}
        />
      </View>
    </ScrollView>
  );
}
