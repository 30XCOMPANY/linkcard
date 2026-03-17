/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, react-native Switch/Share/Clipboard/StyleSheet,
 *          @/src/stores/cardStore useCardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics haptic, @/src/lib/icons Icon, @/src/lib/cn cn
 * [OUTPUT]: ShareScreen — field-toggle glass grouped list, card preview, single CTA
 * [POS]: Share tab — editorial luxury sharing experience with glass material grouped cards
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback, useMemo } from "react";
import { Switch, Share, Clipboard, StyleSheet } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Animated } from "@/src/tw/animated";
import { FadeInDown } from "react-native-reanimated";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
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
      <View style={styles.fieldRow}>
        <View style={styles.fieldIconWrap}>
          <Icon web={field.web} size={20} />
        </View>
        <Text className="text-sf-text" style={styles.fieldLabel}>{field.label}</Text>
        <Switch
          value={enabled}
          onValueChange={() => {
            haptic.selection();
            onToggle();
          }}
        />
      </View>
      {!isLast && <View className="h-px bg-sf-separator" style={styles.fieldSeparator} />}
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
      className="flex-1"
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
      <Text className="text-sf-text-2" style={styles.sectionHeader}>
        What to Share
      </Text>
      <AdaptiveGlass
        className="rounded-[10px] overflow-hidden"
        style={styles.group}
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
      </AdaptiveGlass>

      {/* Primary CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          className="bg-sf-text"
          style={styles.cta}
          onPress={handleShare}
        >
          <Icon web="share-outline" size={18} color="#FFFFFF" />
          <Text className="text-sf-bg" style={styles.ctaLabel}>Share</Text>
        </Pressable>
      </View>

      {/* Secondary links */}
      <View style={styles.secondaryLinks}>
        <Pressable style={styles.secondaryLinkButton} onPress={handleCopyLink}>
          <Text className="text-sf-blue" style={styles.secondaryLinkText}>Copy Link</Text>
        </Pressable>
        <Text className="text-sf-text-3" style={styles.secondaryLinkText}>{"\u00B7"}</Text>
        <Pressable style={styles.secondaryLinkButton} onPress={handleWallet}>
          <Text className="text-sf-blue" style={styles.secondaryLinkText}>Add to Wallet</Text>
        </Pressable>
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
  fieldRow: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldIconWrap: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  fieldSeparator: {
    marginLeft: 56,
  },
  ctaWrap: {
    paddingHorizontal: 16,
    marginTop: 35,
  },
  cta: {
    minHeight: 50,
    borderRadius: 10,
    borderCurve: "continuous" as any,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    marginLeft: 8,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  secondaryLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  secondaryLinkButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  secondaryLinkText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
