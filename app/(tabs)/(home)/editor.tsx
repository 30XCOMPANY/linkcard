/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore,
 *          @/src/components/card/card-display, @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics, @/src/lib/icons,
 *          react-native Switch/RefreshControl/StyleSheet, @/src/lib/accent-colors
 * [OUTPUT]: EditorScreen — Apple Settings-style card editor with glass grouped cards
 * [POS]: Push screen from home — grouped list with custom segmented buttons and accent chips
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useMemo } from "react";
import { Switch, RefreshControl, StyleSheet } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Stack, useRouter } from "expo-router";
import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { LinkedInProfile } from "@/src/types";
import { accentColors } from "@/src/lib/accent-colors";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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
const GRP = { borderCurve: "continuous" as any };

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

const Separator = () => <View className="h-px bg-sf-separator" style={styles.separator} />;

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-sf-text-2" style={styles.sectionHeader}>
    {title}
  </Text>
);

const GroupedCard = ({ children }: { children: React.ReactNode }) => (
  <AdaptiveGlass
    className="rounded-[10px] overflow-hidden"
    style={styles.group}
  >
    {children}
  </AdaptiveGlass>
);

function FieldToggleRow({ label, enabled, onToggle }: {
  label: string; enabled: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text className="text-sf-text" style={styles.rowTitle}>{label}</Text>
      <Switch value={enabled} onValueChange={(v) => { haptic.selection(); onToggle(v); }} />
    </View>
  );
}

function SegmentedRow({
  values,
  selectedIndex,
  onChange,
}: {
  values: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <View style={styles.segmentedContainer}>
      {values.map((value, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={value}
            style={[styles.segmentedItem, selected && styles.segmentedItemSelected]}
            onPress={() => {
              haptic.selection();
              onChange(index);
            }}
          >
            <Text
              className={selected ? "text-sf-text" : "text-sf-text-2"}
              style={[styles.segmentedLabel, selected && styles.segmentedLabelSelected]}
            >
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AccentChip({
  color,
  selected,
  onPress,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.accentChip,
        { backgroundColor: color },
        selected && styles.accentChipSelected,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Editor Screen                                                      */
/* ------------------------------------------------------------------ */

export default function EditorScreen() {
  const router = useRouter();
  const card = useCardStore((s) => s.card);
  const updateVersion = useCardStore((s) => s.updateVersion);
  const setDefaultVersion = useCardStore((s) => s.setDefaultVersion);

  const versionNames = useMemo(() => card?.versions.map((v) => v.name) ?? [], [card?.versions]);
  const versionIdx = useMemo(() => Math.max(card?.versions.findIndex((v) => v.isDefault) ?? 0, 0), [card?.versions]);
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
    [version, updateVersion]
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
              onPress={() => { haptic.light(); router.back(); }}
              style={styles.doneButton}
            >
              <Text className="text-sf-blue" style={styles.doneLabel}>Done</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => haptic.medium()} />}
      >
        {/* Live preview */}
        <View className="bg-sf-bg-2 rounded-[10px] p-4 mx-4 mt-4" style={GRP}>
          <CardDisplay profile={card.profile} version={version} qrCodeData={card.qrCodeData} compact />
        </View>

        {/* Card version */}
        <SectionHeader title="Card Version" />
        <GroupedCard>
          <View style={styles.groupBody}>
            <SegmentedRow
              values={versionNames}
              selectedIndex={versionIdx}
              onChange={(index) => {
                const t = card.versions[index];
                if (t) setDefaultVersion(t.id);
              }}
            />
          </View>
        </GroupedCard>

        {/* Visible fields */}
        <SectionHeader title="Visible Fields" />
        <GroupedCard>
          {FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 && <Separator />}
              <FieldToggleRow
                label={f.label}
                enabled={vis.has(f.key)}
                onToggle={(next) => handleToggle(f.key, next)}
              />
            </React.Fragment>
          ))}
        </GroupedCard>

        {/* Name style */}
        <SectionHeader title="Name Style" />
        <GroupedCard>
          <View style={styles.groupBody}>
            <Text className="text-sf-text-2" style={styles.helperLabel}>Weight</Text>
            <SegmentedRow
              values={WEIGHTS}
              selectedIndex={weightIdx}
              onChange={(index) => {
                const w = WEIGHT_KEYS[index];
                updateVersion(version.id, {
                  fieldStyles: { ...version.fieldStyles, name: { ...version.fieldStyles?.name, fontWeight: w } },
                });
              }}
            />
          </View>
        </GroupedCard>

        {/* Accent */}
        <SectionHeader title="Accent" />
        <GroupedCard>
          <View style={styles.groupBody}>
            <Text className="text-sf-text-2" style={styles.helperLabel}>Color</Text>
            <View style={styles.accentGrid}>
              {ACCENT_OPTIONS.map((color) => (
                <AccentChip
                  key={color}
                  color={color}
                  selected={version.accentColor === color}
                  onPress={() =>
                    updateVersion(version.id, {
                      accentColor: color,
                    })
                  }
                />
              ))}
            </View>
          </View>
        </GroupedCard>

        {/* Background */}
        <SectionHeader title="Background" />
        <GroupedCard>
          <Pressable
            style={styles.row}
            onPress={() => haptic.light()}
          >
            <Text className="text-sf-text" style={styles.rowTitle}>Choose Background</Text>
            <Icon web="chevron-forward" size={16} />
          </Pressable>
        </GroupedCard>
      </ScrollView>
    </>
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
  groupBody: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  segmentedContainer: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 12,
    backgroundColor: "rgba(120,120,128,0.12)",
  },
  segmentedItem: {
    flex: 1,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedItemSelected: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  segmentedLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  segmentedLabelSelected: {
    fontWeight: "600",
  },
  separator: {
    marginLeft: 16,
  },
  row: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  rowTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  helperLabel: {
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  accentChip: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accentChipSelected: {
    borderColor: "#000000",
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
