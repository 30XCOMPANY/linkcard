/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, react-native Switch/Share/Clipboard/StyleSheet,
 *          @/src/stores/cardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/design-system/settings primitives, @/src/lib/haptics, @/src/lib/icons Icon
 * [OUTPUT]: ShareScreen — card preview plus grouped share fields built from settings primitives
 * [POS]: Share tab — share controls aligned to the same grouped-list language as Settings
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useState, useCallback, useMemo } from "react";
import { Switch, Share, Clipboard, StyleSheet, PlatformColor, ScrollView as RNScrollView } from "react-native";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { View, Text, Pressable } from "@/src/tw";
import { Animated } from "@/src/tw/animated";
import { FadeInDown } from "react-native-reanimated";

const useGlass = isGlassEffectAPIAvailable();

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import type { LinkedInProfile } from "@/src/types";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  settingsPageStyle,
} from "@/src/design-system/settings";

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
      <SettingsRow
        title={field.label}
        leading={<Icon web={field.web} size={20} />}
        trailing={
          <Switch
            value={enabled}
            onValueChange={() => {
              haptic.selection();
              onToggle();
            }}
          />
        }
      />
      {!isLast ? <SettingsSeparator inset={60} /> : null}
    </>
  );
}

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
    <RNScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
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

      <SettingsSectionHeader title="WHAT TO SHARE" />
      <SettingsGroup>
        {SHARE_FIELDS.map((f, i) => (
          <FieldRow
            key={f.key}
            field={f}
            enabled={selectedFields.has(f.key)}
            onToggle={() => toggleField(f.key)}
            isLast={i === SHARE_FIELDS.length - 1}
          />
        ))}
      </SettingsGroup>

      <View style={styles.ctaWrap}>
        <Pressable onPress={handleShare}>
          {useGlass ? (
            <GlassView
              glassEffectStyle="regular"
              tintColor={PlatformColor("systemBlue") as unknown as string}
              style={styles.cta}
            >
              <Icon web="share" size={18} color="#FFFFFF" />
              <Text style={styles.ctaLabel}>Share</Text>
            </GlassView>
          ) : (
            <View style={[styles.cta, { backgroundColor: PlatformColor("systemBlue") as any }]}>
              <Icon web="share" size={18} color="#FFFFFF" />
              <Text style={styles.ctaLabel}>Share</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.secondaryLinks}>
        <Pressable style={styles.secondaryLinkButton} onPress={handleCopyLink}>
          <Text className="text-sf-blue" style={styles.secondaryLinkText}>Copy Link</Text>
        </Pressable>
        <Text className="text-sf-text-3" style={styles.secondaryLinkText}>{"\u00B7"}</Text>
        <Pressable style={styles.secondaryLinkButton} onPress={handleWallet}>
          <Text className="text-sf-blue" style={styles.secondaryLinkText}>Add to Wallet</Text>
        </Pressable>
      </View>
    </RNScrollView>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    paddingHorizontal: 16,
    marginTop: 35,
  },
  cta: {
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  ctaLabel: {
    marginLeft: 8,
    fontSize: 17,
    lineHeight: 22,
    color: "#FFFFFF",
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
