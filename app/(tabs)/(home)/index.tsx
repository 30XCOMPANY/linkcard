/**
 * [INPUT]: react/react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          expo-router useRouter, @/src/stores/cardStore,
 *          @/src/components/card/profile-card, @/src/services/share shareCard,
 *          @/src/types CardVersion, local profile-header, local swipe-to-share
 * [OUTPUT]: HomeScreen — card preview with direct edit entry in the header and version switching
 * [POS]: (home) module entrypoint, displaying the card while delegating editing to the editor screen
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import type { CardVersion } from "@/src/types";

import { shareCard } from "@/src/services/share";
import { HomeProfileHeader } from "./profile-header";
import { SwipeToShare } from "./swipe-to-share";

export default function HomeScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);
  const nameFont = useCardStore((state) => state.nameFont) ?? "classic";
  const addVersion = useCardStore((state) => state.addVersion);
  const setNameFont = useCardStore((state) => state.setNameFont);

  const defaultVersion = useMemo(
    () => card?.versions.find((version) => version.isDefault) ?? card?.versions[0],
    [card]
  );
  const [selectedVersionId, setSelectedVersionId] = useState(defaultVersion?.id ?? "");

  const currentVersion = useMemo(
    () => card?.versions.find((version) => version.id === selectedVersionId) ?? defaultVersion,
    [card, defaultVersion, selectedVersionId]
  );

  const handleFontCycle = useCallback(() => {
    const keys = ["classic", "modern", "mono", "system"] as const;
    const currentIndex = keys.indexOf(nameFont);
    const nextFont = keys[(currentIndex + 1) % keys.length];
    setNameFont(nextFont);
  }, [nameFont, setNameFont]);

  const handleCreateVersion = useCallback(() => {
    if (!card) {
      return;
    }

    const count = card.versions.length + 1;
    const nextVersion: CardVersion = {
      accentColor: "#007AFF",
      background: currentVersion?.background ?? "lightGlass",
      id: `v-${Date.now()}`,
      isDefault: false,
      name: `Card ${count}`,
      template: "modern",
      visibleFields: [
        "photoUrl",
        "name",
        "jobTitle",
        "headline",
        "company",
        "location",
        "qrCode",
      ],
    };

    addVersion(nextVersion);
    setSelectedVersionId(nextVersion.id);
  }, [addVersion, card]);

  const handleShare = useCallback(async () => {
    if (!card || !currentVersion) return;
    try {
      await shareCard(card, currentVersion, currentVersion.visibleFields as string[]);
    } catch (error) {
      Alert.alert("Share failed", "Please try again.");
    }
  }, [card, currentVersion]);

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
      <HomeProfileHeader
        currentVersion={currentVersion}
        onCreateVersion={handleCreateVersion}
        onEdit={() =>
          router.push({
            pathname: "/(tabs)/(home)/editor" as any,
            params: { versionId: selectedVersionId },
          })
        }
        onFontCycle={handleFontCycle}
        onSelectVersion={setSelectedVersionId}
        onSync={() =>
          Alert.alert(
            "LinkedIn refresh is coming soon",
            "Auto-sync preferences are ready. Manual refresh will land in a later build."
          )
        }
        profile={card.profile}
        versions={card.versions}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SwipeToShare
          accentColor={currentVersion.accentColor}
          onShare={handleShare}
        >
          <ProfileCard
            nameFont={nameFont}
            profile={card.profile}
            version={currentVersion}
          />
        </SwipeToShare>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
  },
});
