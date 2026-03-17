/**
 * [INPUT]: expo-router Stack/useRouter, react-native ScrollView/Pressable/Text/Switch/StyleSheet,
 *          @/src/tw View/Text, @/src/stores/cardStore, local profile-card-editor,
 *          @/src/design-system/settings primitives, @/src/lib/icons, @/src/lib/accent-colors,
 *          @/src/lib/card-presets, @/src/lib/profile-tags, expo-image-picker
 * [OUTPUT]: EditorScreen — card editor aligned to the shared settings design system
 * [POS]: Push screen from home — editing controls expressed as grouped settings rows and inline controls
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Switch,
  StyleSheet,
  ScrollView as RNScrollView,
  Pressable as RNPressable,
  Text as RNText,
} from "react-native";
import { View, Text } from "@/src/tw";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCardStore } from "@/src/stores/cardStore";
import { parseCustomTagInput, resolveProfileTags } from "@/src/lib/profile-tags";
import { Icon } from "@/src/lib/icons";
import { accentColors } from "@/src/lib/accent-colors";
import { CARD_BACKGROUND_OPTIONS } from "@/src/lib/card-presets";
import type { LinkedInProfile } from "@/src/types";

import { ProfileCardEditor } from "./profile-card-editor";
import {
  SettingsColorGrid,
  SettingsGroup,
  SettingsChevron,
  SettingsIconTile,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSegmented,
  SettingsSeparator,
} from "@/src/design-system/settings";

type ToggleableField = keyof LinkedInProfile | "qrCode" | "character";

const FIELDS: { key: ToggleableField; label: string; icon: string; color: string }[] = [
  { key: "name", label: "Name", icon: "person", color: "#007AFF" },
  { key: "headline", label: "Headline", icon: "note-text", color: "#5856D6" },
  { key: "jobTitle", label: "Job Title", icon: "briefcase", color: "#FF9500" },
  { key: "company", label: "Company", icon: "briefcase", color: "#34C759" },
  { key: "location", label: "Location", icon: "location", color: "#FF3B30" },
  { key: "email", label: "Email", icon: "mail", color: "#007AFF" },
  { key: "phone", label: "Phone", icon: "phone", color: "#34C759" },
  { key: "website", label: "Website", icon: "globe", color: "#5AC8FA" },
  { key: "qrCode", label: "QR Code", icon: "qr-code", color: "#8E8E93" },
  { key: "character", label: "Character", icon: "star", color: "#FF9500" },
];

const WEIGHTS = ["Regular", "Medium", "Bold"] as const;
const WEIGHT_KEYS = ["regular", "medium", "bold"] as const;
const ACCENT_OPTIONS = [
  accentColors.blue,
  accentColors.indigo,
  accentColors.violet,
  accentColors.pink,
  accentColors.orange,
  accentColors.emerald,
  accentColors.teal,
  accentColors.slate,
] as const;
const BACKGROUND_LABELS = CARD_BACKGROUND_OPTIONS.map((option) => option.label);

function FieldToggleRow({
  label,
  icon,
  color,
  enabled,
  onToggle,
}: {
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <SettingsRow
      title={label}
      leading={<SettingsIconTile web={icon} color={color} />}
      trailing={<Switch value={enabled} onValueChange={onToggle} />}
    />
  );
}

function LabeledBody({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.groupBody}>
      <Text className="text-sf-text-2" style={styles.helperLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function EditorScreen() {
  const router = useRouter();
  const { versionId } = useLocalSearchParams<{ versionId?: string }>();
  const card = useCardStore((s) => s.card);
  const nameFont = useCardStore((s) => s.nameFont) ?? "classic";
  const addCustomTag = useCardStore((s) => s.addCustomTag);
  const removeTag = useCardStore((s) => s.removeTag);
  const renameTag = useCardStore((s) => s.renameTag);
  const updateProfile = useCardStore((s) => s.updateProfile);
  const updateVersion = useCardStore((s) => s.updateVersion);

  const [tagsEditing, setTagsEditing] = useState(false);

  const version = useMemo(() => {
    if (!card) return undefined;
    if (versionId) {
      const found = card.versions.find((v) => v.id === versionId);
      if (found) return found;
    }
    return card.versions.find((v) => v.isDefault) ?? card.versions[0];
  }, [card, versionId]);

  const nameWeight = (version?.fieldStyles?.name?.fontWeight ?? "bold") as string;
  const weightIdx = Math.max(WEIGHT_KEYS.indexOf(nameWeight as any), 0);
  const backgroundIdx = Math.max(
    CARD_BACKGROUND_OPTIONS.findIndex((option) => option.id === version?.background),
    0
  );

  const handleToggle = useCallback(
    (field: ToggleableField, next: boolean) => {
      if (!version) return;
      const cur = version.visibleFields as string[];
      updateVersion(version.id, {
        visibleFields: (next ? [...cur, field] : cur.filter((f) => f !== field)) as any,
      });
    },
    [updateVersion, version]
  );

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

  if (!card || !version) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-body text-sf-text-2">No card to edit.</Text>
      </View>
    );
  }

  const vis = new Set(version.visibleFields as string[]);
  const tags = resolveProfileTags(card.profile, card.tagState);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <RNPressable
              onPress={() => router.back()}
              style={styles.doneButton}
            >
              <RNText style={styles.doneLabel}>Done</RNText>
            </RNPressable>
          ),
        }}
      />

      <RNScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Editable card preview */}
        <View style={styles.cardWrap}>
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
            version={version}
          />
        </View>

        <SettingsSectionHeader title="CARD VERSION" />
        <SettingsGroup>
          <SettingsRow
            title="Version"
            onPress={() => router.push("/versions" as any)}
            trailing={
              <View style={styles.rowValue}>
                <Text className="text-sf-text-2" style={styles.rowValueText}>
                  {version.name}
                </Text>
                <SettingsChevron />
              </View>
            }
          />
        </SettingsGroup>

        <SettingsSectionHeader title="VISIBLE FIELDS" />
        <SettingsGroup>
          {FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 ? <SettingsSeparator inset={60} /> : null}
              <FieldToggleRow
                label={f.label}
                icon={f.icon}
                color={f.color}
                enabled={vis.has(f.key)}
                onToggle={(next) => handleToggle(f.key, next)}
              />
            </React.Fragment>
          ))}
        </SettingsGroup>

        <SettingsSectionHeader title="NAME STYLE" />
        <SettingsGroup>
          <LabeledBody label="Weight">
            <SettingsSegmented
              values={WEIGHTS}
              selectedIndex={weightIdx}
              onChange={(index) => {
                const weight = WEIGHT_KEYS[index];
                updateVersion(version.id, {
                  fieldStyles: {
                    ...version.fieldStyles,
                    name: { ...version.fieldStyles?.name, fontWeight: weight },
                  },
                });
              }}
            />
          </LabeledBody>
        </SettingsGroup>

        <SettingsSectionHeader title="ACCENT" />
        <SettingsGroup>
          <LabeledBody label="Color">
            <SettingsColorGrid
              colors={ACCENT_OPTIONS}
              selectedColor={version.accentColor}
              onSelect={(color) => updateVersion(version.id, { accentColor: color })}
            />
          </LabeledBody>
        </SettingsGroup>

        <SettingsSectionHeader title="BACKGROUND" />
        <SettingsGroup>
          <LabeledBody label="Style">
            <SettingsSegmented
              values={BACKGROUND_LABELS}
              selectedIndex={backgroundIdx}
              onChange={(index) =>
                updateVersion(version.id, {
                  background: CARD_BACKGROUND_OPTIONS[index]?.id ?? CARD_BACKGROUND_OPTIONS[0].id,
                })
              }
            />
          </LabeledBody>
          <SettingsSeparator />
          <SettingsRow
            title={CARD_BACKGROUND_OPTIONS[backgroundIdx]?.label ?? "Glass"}
            subtitle={CARD_BACKGROUND_OPTIONS[backgroundIdx]?.description}
            trailing={<Icon web="color-palette-outline" size={16} />}
          />
        </SettingsGroup>
      </RNScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  groupBody: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  helperLabel: {
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 20,
  },
  rowValue: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  rowValueText: {
    fontSize: 17,
    lineHeight: 22,
  },
  doneButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  doneLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#007AFF",
  },
});
