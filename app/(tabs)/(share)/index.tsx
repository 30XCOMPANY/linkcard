/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, react-native Switch/Share/Clipboard,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, @/src/lib/cn cn
 * [OUTPUT]: ShareScreen — field-toggle grouped list, card preview, single CTA
 * [POS]: Share tab — editorial luxury sharing experience with Apple Settings pattern
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback, useMemo } from "react";
import { Switch, Share, Clipboard } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Animated } from "@/src/tw/animated";
import { FadeInDown } from "react-native-reanimated";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import type { LinkedInProfile } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Shareable field definitions                                        */
/* ------------------------------------------------------------------ */

type ShareField = keyof LinkedInProfile | "qrCode";

interface FieldDef {
  key: ShareField;
  label: string;
  web: string;
}

const SHARE_FIELDS: FieldDef[] = [
  { key: "name", label: "Name", web: "person-outline" },
  { key: "headline", label: "Headline", web: "text-outline" },
  { key: "company", label: "Company", web: "business-outline" },
  { key: "location", label: "Location", web: "location-outline" },
  { key: "email", label: "Email", web: "mail-outline" },
  { key: "phone", label: "Phone", web: "call-outline" },
  { key: "website", label: "Website", web: "globe-outline" },
  { key: "qrCode", label: "QR Code", web: "qr-code-outline" },
];

/* ------------------------------------------------------------------ */
/*  Field Row                                                          */
/* ------------------------------------------------------------------ */

function FieldRow({
  field,
  enabled,
  onToggle,
  isLast,
}: {
  field: FieldDef;
  enabled: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <>
      <View className="flex-row items-center min-h-[44px] py-[11px] px-4">
        <View className="w-[30px] items-center mr-3">
          <Icon web={field.web} size={20} />
        </View>
        <Text className="flex-1 text-body text-sf-text">{field.label}</Text>
        <Switch
          value={enabled}
          onValueChange={() => {
            haptic.selection();
            onToggle();
          }}
        />
      </View>
      {!isLast && <View className="h-px bg-sf-separator ml-14" />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Share Screen                                                       */
/* ------------------------------------------------------------------ */

export default function ShareScreen() {
  const card = useCardStore((s) => s.card);

  const defaultVersion =
    card?.versions.find((v) => v.isDefault) ?? card?.versions[0];
  const currentVersion = defaultVersion;

  const [selectedFields, setSelectedFields] = useState<Set<ShareField>>(
    () => new Set(currentVersion?.visibleFields ?? [])
  );

  const toggleField = useCallback((field: ShareField) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const previewVersion = useMemo(() => {
    if (!currentVersion) return undefined;
    return { ...currentVersion, visibleFields: Array.from(selectedFields) };
  }, [currentVersion, selectedFields]);

  const handleShare = useCallback(async () => {
    if (!card) return;
    haptic.success();
    await Share.share({
      message: `Check out my LinkCard: ${card.qrCodeData}`,
      url: card.qrCodeData,
    });
  }, [card]);

  const handleCopyLink = useCallback(() => {
    if (!card) return;
    haptic.success();
    Clipboard.setString(card.qrCodeData);
  }, [card]);

  const handleWallet = useCallback(() => {
    haptic.light();
  }, []);

  /* Empty state */
  if (!card || !currentVersion || !previewVersion) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-body text-sf-text-2">
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
        {/* Card Preview */}
        <View className="px-4 pt-4">
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

      {/* What to Share — grouped list */}
      <Text className="text-caption-1 font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-1.5 mt-[35px]">
        What to Share
      </Text>
      <View
        className="bg-sf-card rounded-2xl overflow-hidden mx-4"
        style={{ borderCurve: "continuous" as any }}
      >
        {SHARE_FIELDS.map((f, i) => (
          <FieldRow
            key={f.key}
            field={f}
            enabled={selectedFields.has(f.key)}
            onToggle={() => toggleField(f.key)}
            isLast={i === SHARE_FIELDS.length - 1}
          />
        ))}
      </View>

      {/* Primary CTA */}
      <View className="px-4 mt-[35px]">
        <Pressable
          className="h-[52px] rounded-2xl bg-sf-text flex-row items-center justify-center gap-2 min-h-[44px]"
          onPress={handleShare}
        >
          <Icon web="share-outline" size={18} color="#FFFFFF" />
          <Text className="text-body font-semibold text-sf-bg">Share</Text>
        </Pressable>
      </View>

      {/* Secondary links */}
      <View className="flex-row items-center justify-center mt-4 gap-1">
        <Pressable className="min-h-[44px] justify-center px-2" onPress={handleCopyLink}>
          <Text className="text-footnote text-sf-blue">Copy Link</Text>
        </Pressable>
        <Text className="text-footnote text-sf-text-3">{"\u00B7"}</Text>
        <Pressable className="min-h-[44px] justify-center px-2" onPress={handleWallet}>
          <Text className="text-footnote text-sf-blue">Add to Wallet</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
