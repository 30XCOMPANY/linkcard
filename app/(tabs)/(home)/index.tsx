/**
 * [INPUT]: react-native ScrollView/View/Text/Pressable,
 *          @/src/stores/cardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics, @/src/lib/icons Icon
 * [OUTPUT]: HomeScreen — card hero, version chips, quick actions
 * [POS]: Primary tab screen — pure RN, no SwiftUI Host (preserves large title)
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { CardVersion } from "@/src/types";

const useGlass = isGlassEffectAPIAvailable();

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
  const inner = (
    <>
      <View
        style={[styles.chipDot, { backgroundColor: selected ? "#FFFFFF" : version.accentColor }]}
      />
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {version.name}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        onPress();
      }}
    >
      {useGlass ? (
        <GlassView
          glassEffectStyle="regular"
          style={[
            styles.chip,
            selected && { backgroundColor: version.accentColor },
          ]}
        >
          {inner}
        </GlassView>
      ) : (
        <View
          style={[
            styles.chip,
            selected
              ? { backgroundColor: version.accentColor }
              : { backgroundColor: "#F2F2F7" },
          ]}
        >
          {inner}
        </View>
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action                                                       */
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={styles.action}
    >
      <Icon web={icon} size={20} color="#000" />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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

  const currentVersion =
    card?.versions.find((v: CardVersion) => v.id === selectedVersionId) ??
    defaultVersion;

  const handleSelectVersion = useCallback(
    (id: string) => setSelectedVersionId(id),
    []
  );

  if (!card || !currentVersion) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No card yet. Complete onboarding to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      {/* Card */}
      <View style={styles.cardWrap}>
        <CardDisplay
          profile={card.profile}
          version={currentVersion}
          qrCodeData={card.qrCodeData}
          showQR={showQR}
        />
      </View>

      {/* Version Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
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
      <View style={styles.actions}>
        <QuickAction
          icon="edit-pen"
          label="Edit"
          onPress={() => {
            haptic.light();
            router.push("/editor" as any);
          }}
        />
        <QuickAction
          icon="share"
          label="Share"
          onPress={() => {
            haptic.light();
            router.push("/share" as any);
          }}
        />
        <QuickAction
          icon="qr-code"
          label="QR Code"
          onPress={() => {
            haptic.medium();
            setShowQR((p) => !p);
          }}
        />
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E93",
  },
  cardWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden" as const,
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  chipTextSelected: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
  },
  action: {
    alignItems: "center",
    gap: 4,
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
