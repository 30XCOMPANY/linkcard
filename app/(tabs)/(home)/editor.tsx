/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore,
 *          @/src/components/card/card-display, @/src/design-system/settings primitives,
 *          @/src/lib/icons, react-native Switch/RefreshControl/StyleSheet, @/src/lib/accent-colors
 * [OUTPUT]: EditorScreen — card editor aligned to the shared settings design system
 * [POS]: Push screen from home — editing controls expressed as grouped settings rows and inline controls
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo } from "react";
import { Switch, RefreshControl, StyleSheet } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Stack, useRouter } from "expo-router";
import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { Icon } from "@/src/lib/icons";
import { accentColors } from "@/src/lib/accent-colors";
import {
  SettingsColorGrid,
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSegmented,
  SettingsSeparator,
  settingsPageStyle,
} from "@/src/design-system/settings";

type ToggleableField = keyof LinkedInProfile | "qrCode" | "character";

const FIELDS: { key: ToggleableField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "jobTitle", label: "Job Title" },
  { key: "company", label: "Company" },
  { key: "location", label: "Location" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "website", label: "Website" },
  { key: "qrCode", label: "QR Code" },
  { key: "character", label: "Character" },
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

function FieldToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <SettingsRow
      title={label}
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
  const card = useCardStore((s) => s.card);
  const updateVersion = useCardStore((s) => s.updateVersion);
  const setDefaultVersion = useCardStore((s) => s.setDefaultVersion);

  const versionNames = useMemo(
    () => card?.versions.map((v) => v.name) ?? [],
    [card?.versions]
  );
  const versionIdx = useMemo(
    () => Math.max(card?.versions.findIndex((v) => v.isDefault) ?? 0, 0),
    [card?.versions]
  );
  const version = card?.versions[versionIdx] ?? card?.versions[0];

  const nameWeight = (version?.fieldStyles?.name?.fontWeight ?? "bold") as string;
  const weightIdx = Math.max(WEIGHT_KEYS.indexOf(nameWeight as any), 0);

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

  if (!card || !version) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-body text-sf-text-2">No card to edit.</Text>
      </View>
    );
  }

  const vis = new Set(version.visibleFields as string[]);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.doneButton}
            >
              <Text className="text-sf-blue" style={styles.doneLabel}>Done</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        style={settingsPageStyle}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        <View className="bg-sf-bg-2 rounded-[20px] p-4 mx-4 mt-4">
          <CardDisplay
            profile={card.profile}
            version={version}
            qrCodeData={card.qrCodeData}
            compact
          />
        </View>

        <SettingsSectionHeader title="CARD VERSION" />
        <SettingsGroup>
          <LabeledBody label="Version">
            <SettingsSegmented
              values={versionNames}
              selectedIndex={versionIdx}
              onChange={(index) => {
                const next = card.versions[index];
                if (next) setDefaultVersion(next.id);
              }}
            />
          </LabeledBody>
        </SettingsGroup>

        <SettingsSectionHeader title="VISIBLE FIELDS" />
        <SettingsGroup>
          {FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 ? <SettingsSeparator /> : null}
              <FieldToggleRow
                label={f.label}
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
          <SettingsRow
            title="Choose Background"
            trailing={<Icon web="chevron-forward" size={16} />}
          />
        </SettingsGroup>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  groupBody: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  helperLabel: {
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 20,
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
  },
});
