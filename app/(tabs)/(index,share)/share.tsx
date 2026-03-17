/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/tw/animated Animated,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics haptic, @/src/lib/springs springs, @/src/lib/icons Icon, @/src/lib/cn cn,
 *          react-native Share/Clipboard
 * [OUTPUT]: ShareScreen — field-level share config, preview, quick actions
 * [POS]: Share tab — contextual card sharing with field toggles and share methods
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback, useMemo } from "react";
import { Share, Clipboard } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Animated } from "@/src/tw/animated";
import { FadeInDown, useSharedValue, withSpring } from "react-native-reanimated";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import { cn } from "@/src/lib/cn";
import type { CardVersion, LinkedInProfile } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Shareable field definitions                                        */
/* ------------------------------------------------------------------ */

type ShareField = keyof LinkedInProfile | "qrCode";

interface FieldDef {
  key: ShareField;
  label: string;
  ios: string;
  web: string;
}

const SHARE_FIELDS: FieldDef[] = [
  { key: "name", label: "Name", ios: "person", web: "person-outline" },
  { key: "headline", label: "Headline", ios: "text.quote", web: "text-outline" },
  { key: "company", label: "Company", ios: "building.2", web: "business-outline" },
  { key: "location", label: "Location", ios: "location", web: "location-outline" },
  { key: "email", label: "Email", ios: "envelope", web: "mail-outline" },
  { key: "phone", label: "Phone", ios: "phone", web: "call-outline" },
  { key: "website", label: "Website", ios: "globe", web: "globe-outline" },
  { key: "qrCode", label: "QR Code", ios: "qrcode", web: "qr-code-outline" },
];

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 mb-2"
      selectable
    >
      {title}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Version Chip (same pattern as Home)                                */
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
/*  Field Toggle Chip                                                  */
/* ------------------------------------------------------------------ */

function FieldChip({
  field,
  selected,
  accentColor,
  onToggle,
}: {
  field: FieldDef;
  selected: boolean;
  accentColor: string;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className={cn(
          "flex-row items-center gap-2 px-3 py-2 rounded-full min-h-[44px]",
          selected
            ? "border-[1.5px]"
            : "bg-sf-bg-2/50 border border-sf-separator/20"
        )}
        style={[
          selected && {
            backgroundColor: accentColor + "20",
            borderColor: accentColor,
          },
        ]}
        onPress={() => {
          haptic.selection();
          onToggle();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.97, springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.snappy);
        }}
      >
        <Icon
          ios={field.ios}
          web={field.web}
          size={16}
          color={selected ? accentColor : undefined}
        />
        <Text
          className={cn(
            "text-sm",
            selected ? "font-semibold" : "font-medium text-sf-text-2"
          )}
          style={selected ? { color: accentColor } : undefined}
          selectable
        >
          {field.label}
        </Text>
        {selected && (
          <Icon ios="checkmark" web="checkmark-outline" size={14} color={accentColor} />
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action Button (56x56)                                        */
/* ------------------------------------------------------------------ */

function ShareAction({
  ios,
  web,
  label,
  dark,
  onPress,
}: {
  ios: string;
  web: string;
  label: string;
  dark?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  return (
    <View className="items-center gap-1.5">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          className={cn(
            "w-[56px] h-[56px] min-h-[44px] min-w-[44px] rounded-full items-center justify-center",
            dark ? "bg-sf-text" : "bg-sf-card"
          )}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
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
          <Icon
            ios={ios}
            web={web}
            size={24}
            color={dark ? "#FFFFFF" : undefined}
          />
        </Pressable>
      </Animated.View>
      <Text className="text-xs text-sf-text-2" selectable>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Share Screen                                                       */
/* ------------------------------------------------------------------ */

export default function ShareScreen() {
  const card = useCardStore((s) => s.card);

  const defaultVersion =
    card?.versions.find((v) => v.isDefault) ?? card?.versions[0];
  const [selectedVersionId, setSelectedVersionId] = useState(
    defaultVersion?.id ?? ""
  );
  const currentVersion =
    card?.versions.find((v) => v.id === selectedVersionId) ?? defaultVersion;

  // Field selection — default to current version's visible fields
  const [selectedFields, setSelectedFields] = useState<Set<ShareField>>(
    () => new Set(currentVersion?.visibleFields ?? [])
  );

  const toggleField = useCallback((field: ShareField) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  // Build a modified version that only shows selectedFields
  const previewVersion = useMemo<CardVersion | undefined>(() => {
    if (!currentVersion) return undefined;
    return {
      ...currentVersion,
      visibleFields: Array.from(selectedFields),
    };
  }, [currentVersion, selectedFields]);

  const handleCopyLink = useCallback(() => {
    if (!card) return;
    haptic.success();
    Clipboard.setString(card.qrCodeData);
  }, [card]);

  const handleShare = useCallback(async () => {
    if (!card) return;
    haptic.success();
    await Share.share({
      message: `Check out my LinkCard: ${card.qrCodeData}`,
      url: card.qrCodeData,
    });
  }, [card]);

  const handleAirDrop = useCallback(() => {
    haptic.light();
    // AirDrop triggers via the native share sheet on iOS
    handleShare();
  }, [handleShare]);

  const handleWallet = useCallback(() => {
    haptic.light();
    // Wallet pass generation — placeholder for future implementation
  }, []);

  const isWeb = process.env.EXPO_OS === "web";

  /* Empty state */
  if (!card || !currentVersion || !previewVersion) {
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
      {/* Section: Preview */}
      <View className="px-4 pt-4">
        <SectionHeader title="Preview" />
        <Animated.View
          entering={FadeInDown.springify()
            .stiffness(springs.gentle.stiffness)
            .damping(springs.gentle.damping)}
        >
          <CardDisplay
            profile={card.profile}
            version={previewVersion}
            qrCodeData={card.qrCodeData}
            compact
          />
        </Animated.View>
      </View>

      {/* Section: Card Style */}
      <View className="mt-6 px-4">
        <SectionHeader title="Card Style" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 py-1"
      >
        {card.versions.map((v) => (
          <VersionChip
            key={v.id}
            version={v}
            selected={v.id === selectedVersionId}
            onPress={() => {
              setSelectedVersionId(v.id);
              // Sync selected fields to new version's defaults
              setSelectedFields(new Set(v.visibleFields));
            }}
          />
        ))}
      </ScrollView>

      {/* Section: What to Share */}
      <View className="px-4 mt-6">
        <SectionHeader title="What to Share" />
        <View className="flex-row flex-wrap gap-2">
          {SHARE_FIELDS.map((f) => (
            <FieldChip
              key={f.key}
              field={f}
              selected={selectedFields.has(f.key)}
              accentColor={currentVersion.accentColor}
              onToggle={() => toggleField(f.key)}
            />
          ))}
        </View>
      </View>

      {/* Section: Quick Actions */}
      <View className="px-4 mt-6">
        <SectionHeader title="Quick Actions" />
        <View className="flex-row items-start justify-center gap-6 mt-1">
          <ShareAction
            ios="link"
            web="link-outline"
            label="Copy Link"
            onPress={handleCopyLink}
          />
          {!isWeb && (
            <ShareAction
              ios="antenna.radiowaves.left.and.right"
              web="radio-outline"
              label="AirDrop"
              onPress={handleAirDrop}
            />
          )}
          <ShareAction
            ios="wallet.bifold"
            web="wallet-outline"
            label="Wallet"
            dark
            onPress={handleWallet}
          />
        </View>
      </View>

      {/* Share Card Button */}
      <View className="px-4 mt-8">
        <Pressable
          className="h-[52px] rounded-full bg-sf-text flex-row items-center justify-center gap-2 min-h-[44px]"
          onPress={handleShare}
        >
          <Icon
            ios="square.and.arrow.up"
            web="share-outline"
            size={18}
            color="#FFFFFF"
          />
          <Text className="text-base font-semibold text-sf-bg">
            Share Card
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
