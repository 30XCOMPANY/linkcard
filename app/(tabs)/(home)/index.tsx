/**
 * [INPUT]: react/react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          expo-router useRouter, @/src/stores/cardStore,
 *          @/src/components/card/profile-card, @/src/types CardVersion, local profile-header
 * [OUTPUT]: HomeScreen — read-only profile card display with version switching
 * [POS]: (home) module entrypoint, displaying the card while delegating editing to the editor screen
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { Alert, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import type { CardVersion } from "@/src/types";

import { HomeProfileHeader } from "./profile-header";

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
        onEdit={() => router.push({ pathname: "/editor" as any, params: { versionId: selectedVersionId } })}
        onFontCycle={handleFontCycle}
        onSelectVersion={setSelectedVersionId}
        onSync={() => Alert.alert("Syncing", "Refreshing your LinkedIn data...")}
        profile={card.profile}
        versions={card.versions}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard
          nameFont={nameFont}
          profile={card.profile}
          version={currentVersion}
        />
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
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 15,
  },
});
