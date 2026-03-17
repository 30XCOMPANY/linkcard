/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable/Link,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, @/src/lib/cn cn,
 *          react-native RefreshControl
 * [OUTPUT]: HomeScreen — card hero with context menu, pull-to-refresh, version chips, glass quick actions
 * [POS]: Primary tab screen — the card is the hero, everything serves it
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import { ScrollView as RNScrollView } from "react-native";
import { View, Text, Pressable, Link } from "@/src/tw";
import { useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { CardVersion } from "@/src/types";

// SwiftUI Liquid Glass components
import { Host, HStack, Picker, Button, Text as SUIText } from "@expo/ui/swift-ui";
import { glassEffect, padding, tag, pickerStyle, buttonStyle } from "@expo/ui/swift-ui/modifiers";

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
    <RNScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Card Display — hero with native context menu + preview */}
      <View className="px-4 pt-2">
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

      {/* Version Selector — SwiftUI Segmented Picker with Liquid Glass */}
      <View className="px-4 mt-3">
        <Host style={{ width: "100%", height: 44 }}>
          <Picker
            selection={selectedVersionId}
            onSelectionChange={(id) => {
              haptic.selection();
              handleSelectVersion(id as string);
            }}
            modifiers={[
              pickerStyle("segmented"),
              glassEffect({ glass: { variant: "regular" } }),
            ]}
          >
            {card.versions.map((v: CardVersion) => (
              <SUIText key={v.id} modifiers={[tag(v.id)]}>
                {v.name}
              </SUIText>
            ))}
          </Picker>
        </Host>
      </View>

      {/* Quick Actions — SwiftUI Glass Buttons */}
      <View className="px-4 mt-3">
        <Host style={{ width: "100%", height: 50 }}>
          <HStack modifiers={[
            padding({ horizontal: 8 }),
            glassEffect({ glass: { variant: "regular" } }),
          ]}>
            <Button
              modifiers={[buttonStyle("glass")]}
              onPress={() => { haptic.light(); router.push("/editor" as any); }}
            >
              Edit
            </Button>
            <Button
              modifiers={[buttonStyle("glass")]}
              onPress={() => { haptic.light(); router.push("/share" as any); }}
            >
              Share
            </Button>
            <Button
              modifiers={[buttonStyle("glass")]}
              onPress={() => { haptic.medium(); setShowQR((p) => !p); }}
            >
              QR Code
            </Button>
          </HStack>
        </Host>
      </View>
    </RNScrollView>
  );
}
