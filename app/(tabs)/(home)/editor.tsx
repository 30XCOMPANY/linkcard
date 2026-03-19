/**
 * [INPUT]: expo-router Stack/useRouter, react-native ScrollView/Pressable/Text/Switch/StyleSheet,
 *          @/src/tw View/Text, @/src/stores/cardStore, local profile-card-editor,
 *          @/src/design-system/settings primitives, @/src/lib/icons, @/src/lib/accent-colors,
 *          @/src/lib/card-presets, @/src/lib/profile-tags, @/src/lib/social-platforms, @/src/lib/theme,
 *          @/src/lib/social-icon, expo-image-picker
 * [OUTPUT]: EditorScreen — edit hub aligned to the shared settings design system
 * [POS]: Push screen from home — root of the structured card-editing subtree
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
import { accentColors } from "@/src/lib/accent-colors";
import { CARD_BACKGROUND_OPTIONS } from "@/src/lib/card-presets";
import { nameFonts, NAME_FONT_KEYS } from "@/src/lib/name-fonts";
import type { LinkedInProfile, SocialLink } from "@/src/types";
import { platformColor } from "@/src/lib/platform-color";
import { getSocialPlatform } from "@/src/lib/social-platforms";
import { SocialIcon } from "@/src/lib/social-icon";
import { useResolvedTheme } from "@/src/lib/theme";

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
  settingsPageStyle,
} from "@/src/design-system/settings";

type ToggleableField = keyof LinkedInProfile | "qrCode" | "character";

const FIELDS: { key: ToggleableField; label: string; icon: string; color: string }[] = [
  { key: "name", label: "Name", icon: "person", color: "#007AFF" },
  { key: "headline", label: "Headline", icon: "note-text", color: "#5856D6" },
  { key: "jobTitle", label: "Job Title", icon: "briefcase", color: "#FF9500" },
  { key: "website", label: "Website", icon: "globe", color: "#5AC8FA" },
  { key: "email", label: "Email", icon: "mail", color: "#007AFF" },
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
const CARD_COLOR_OPTIONS = CARD_BACKGROUND_OPTIONS.map((option) => option.gradient[0]);

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
      <Text style={[styles.helperLabel, { color: platformColor("secondaryLabel") }]}>{label}</Text>
      {children}
    </View>
  );
}

export default function EditorScreen() {
  const router = useRouter();
  const smallTitleColor = useResolvedTheme() === "dark" ? "#FFFFFF" : "#000000";
  const { versionId } = useLocalSearchParams<{ versionId?: string }>();
  const card = useCardStore((s) => s.card);
  const nameFont = useCardStore((s) => s.nameFont) ?? "classic";
  const setNameFont = useCardStore((s) => s.setNameFont);
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

  const handleAvatarPick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ photoUrl: result.assets[0].uri });
    }
  }, [updateProfile]);

  const handleFieldSave = useCallback(
    (field: string, value: string) => {
      updateProfile({ [field]: value });
    },
    [updateProfile]
  );

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
          headerBackTitle: "Card",
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
      <Stack.Screen.Title
        large={false}
        style={{ color: smallTitleColor, fontWeight: "700" }}
      >
        Edit Card
      </Stack.Screen.Title>

      <RNScrollView
        style={settingsPageStyle}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Editable card preview */}
        <View style={styles.cardWrap}>
          <ProfileCardEditor
            contactAction={card.contactAction}
            nameFont={nameFont}
            onAvatarPress={handleAvatarPick}
            onBannerPress={handleBannerPick}
            onFieldSave={handleFieldSave}
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
            subtitle="Manage the versions attached to this card"
            onPress={() => router.push("/(tabs)/(home)/versions" as any)}
            trailing={
              <View style={styles.rowValue}>
                <Text style={[styles.rowValueText, { color: platformColor("secondaryLabel") }]}>
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

        <SettingsSectionHeader title="TYPOGRAPHY" />
        <SettingsGroup>
          <LabeledBody label="Name Font">
            <SettingsSegmented
              values={NAME_FONT_KEYS.map((k) => nameFonts[k].label)}
              selectedIndex={NAME_FONT_KEYS.indexOf(nameFont)}
              onChange={(index) => setNameFont(NAME_FONT_KEYS[index])}
              renderLabel={(_, index, selected) => (
                <RNText
                  style={[
                    styles.segLabel,
                    { color: selected ? platformColor("label") : platformColor("secondaryLabel") },
                    selected && styles.segLabelSelected,
                    nameFonts[NAME_FONT_KEYS[index]].fontFamily
                      ? { fontFamily: nameFonts[NAME_FONT_KEYS[index]].fontFamily }
                      : undefined,
                  ]}
                >
                  {nameFonts[NAME_FONT_KEYS[index]].label}
                </RNText>
              )}
            />
          </LabeledBody>
          <SettingsSeparator />
          <LabeledBody label="Name Weight">
            <SettingsSegmented
              values={WEIGHTS as unknown as string[]}
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
              renderLabel={(value, index, selected) => (
                <RNText
                  style={[
                    styles.segLabel,
                    { color: selected ? platformColor("label") : platformColor("secondaryLabel") },
                    selected && styles.segLabelSelected,
                    { fontWeight: (["400", "500", "700"] as const)[index] },
                  ]}
                >
                  {value}
                </RNText>
              )}
            />
          </LabeledBody>
        </SettingsGroup>

        <SettingsSectionHeader title="COLOR" />
        <SettingsGroup>
          <LabeledBody label="Card Color">
            <SettingsColorGrid
              colors={CARD_COLOR_OPTIONS}
              selectedColor={CARD_BACKGROUND_OPTIONS[backgroundIdx]?.gradient[0] ?? CARD_COLOR_OPTIONS[0]}
              onSelect={(color) => {
                const match = CARD_BACKGROUND_OPTIONS.find((opt) => opt.gradient[0] === color);
                if (match) {
                  updateVersion(version.id, { background: match.id });
                }
              }}
            />
          </LabeledBody>
          <SettingsSeparator />
          <LabeledBody label="Accent Color">
            <SettingsColorGrid
              colors={ACCENT_OPTIONS}
              selectedColor={version.accentColor}
              onSelect={(color) => updateVersion(version.id, { accentColor: color })}
            />
          </LabeledBody>
        </SettingsGroup>

        <SettingsSectionHeader title="SOCIAL LINKS" />
        <SettingsGroup>
          {(card.profile.socialLinks ?? []).map((link: SocialLink, i: number) => {
            const meta = getSocialPlatform(link.platform);
            return (
              <React.Fragment key={`${link.platform}-${i}`}>
                {i > 0 ? <SettingsSeparator inset={60} /> : null}
                <SettingsRow
                  title={meta.label}
                  subtitle={link.url || "Not set"}
                  leading={
                    <View style={{ width: 30, height: 30, borderRadius: 7, borderCurve: "continuous" as any, backgroundColor: meta.glassColor, alignItems: "center", justifyContent: "center" }}>
                      <SocialIcon platform={link.platform} size={16} color="#FFFFFF" />
                    </View>
                  }
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/social-link-detail" as any,
                      params: { index: String(i) },
                    })
                  }
                  trailing={<SettingsChevron />}
                />
              </React.Fragment>
            );
          })}
          {(card.profile.socialLinks ?? []).length > 0 ? <SettingsSeparator inset={60} /> : null}
          <SettingsRow
            title="Add Social Link"
            leading={<SettingsIconTile web="plus" color="#34C759" />}
            onPress={() => router.push("/(tabs)/(home)/social-link-picker" as any)}
            trailing={<SettingsChevron />}
          />
        </SettingsGroup>

        <SettingsSectionHeader title="PUBLICATIONS" />
        <SettingsGroup>
          <SettingsRow
            title="Publications"
            leading={<SettingsIconTile web="document" color="#FF9500" />}
            subtitle="Edit the stories and links that travel with this version"
            onPress={() => router.push("/(tabs)/(home)/publications" as any)}
            trailing={
              <View style={styles.rowValue}>
                <RNText style={[styles.rowValueText, { color: platformColor("secondaryLabel") }]}>
                  {card.profile.publications?.length ?? 0}
                </RNText>
                <SettingsChevron />
              </View>
            }
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
    color: platformColor("systemBlue"),
  },
  segLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  segLabelSelected: {
    fontWeight: "600",
  },
});
