/**
 * [INPUT]: react/react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          expo-router useRouter, expo-image-picker, @/src/stores/cardStore,
 *          @/src/lib/profile-tags, @/src/types CardVersion, local profile-header/profile-card-editor
 * [OUTPUT]: HomeScreen — orchestration shell for the editable profile card and version actions
 * [POS]: (home) module entrypoint, owning screen-level state while delegating rendering to focused children
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { Alert, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { parseCustomTagInput, resolveProfileTags } from "@/src/lib/profile-tags";
import { useCardStore } from "@/src/stores/cardStore";
import type { CardVersion } from "@/src/types";

import { HomeProfileHeader } from "./profile-header";
import { ProfileCardEditor } from "./profile-card-editor";

export default function HomeScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);
  const nameFont = useCardStore((state) => state.nameFont) ?? "classic";
  const addCustomTag = useCardStore((state) => state.addCustomTag);
  const addVersion = useCardStore((state) => state.addVersion);
  const removeTag = useCardStore((state) => state.removeTag);
  const renameTag = useCardStore((state) => state.renameTag);
  const setNameFont = useCardStore((state) => state.setNameFont);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const defaultVersion = useMemo(
    () => card?.versions.find((version) => version.isDefault) ?? card?.versions[0],
    [card]
  );
  const [selectedVersionId, setSelectedVersionId] = useState(defaultVersion?.id ?? "");
  const [tagsEditing, setTagsEditing] = useState(false);

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

  const handleBannerPick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ bannerUrl: result.assets[0].uri });
    }
  }, [updateProfile]);

  const handleTagAdd = useCallback(
    (input: string) => {
      const parsed = parseCustomTagInput(input);
      if (!parsed) {
        return;
      }

      addCustomTag(parsed);
      setTagsEditing(true);
    },
    [addCustomTag]
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

  const tags = resolveProfileTags(card.profile, card.tagState);

  return (
    <>
      <HomeProfileHeader
        currentVersion={currentVersion}
        onCreateVersion={handleCreateVersion}
        onEdit={() => router.push("/editor" as any)}
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
        <ProfileCardEditor
          nameFont={nameFont}
          onBannerPress={handleBannerPick}
          onHeadlineSave={(value) => updateProfile({ headline: value })}
          onNameSave={(value) => updateProfile({ name: value })}
          onTagAdd={handleTagAdd}
          onTagDelete={removeTag}
          onTagRename={renameTag}
          onTagsEditingChange={setTagsEditing}
          profile={card.profile}
          tags={tags}
          tagsEditing={tagsEditing}
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
