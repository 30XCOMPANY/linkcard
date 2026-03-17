/**
 * [INPUT]: react-native ScrollView/View/Text/Pressable/PlatformColor,
 *          expo-glass-effect GlassView, expo-router Stack,
 *          @/src/stores/cardStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics
 * [OUTPUT]: HomeScreen — card hero (tap for QR), version chips, Edit in nav bar
 * [POS]: Primary tab screen — card is the hero and the interactive surface
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  PlatformColor,
} from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
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
          tintColor={selected ? version.accentColor : undefined}
          style={styles.chip}
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
    <>
      {/* Edit button in navigation bar — Apple standard position */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => {
                haptic.light();
                router.push("/editor" as any);
              }}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Edit</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        {/* Card — tap to toggle QR */}
        <Pressable
          style={styles.cardWrap}
          onPress={() => {
            haptic.medium();
            setShowQR((p) => !p);
          }}
        >
          <CardDisplay
            profile={card.profile}
            version={currentVersion}
            qrCodeData={card.qrCodeData}
            showQR={showQR}
          />
        </Pressable>

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
      </ScrollView>
    </>
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
    color: PlatformColor("secondaryLabel"),
  },
  headerButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 17,
    fontWeight: "400",
    color: PlatformColor("systemBlue"),
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
    color: PlatformColor("label"),
  },
  chipTextSelected: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
