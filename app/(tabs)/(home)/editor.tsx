/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore,
 *          @/src/components/card/card-display, @/src/lib/haptics, @/src/lib/icons,
 *          react-native Switch/RefreshControl, segmented-control, slider
 * [OUTPUT]: EditorScreen — Apple Settings-style card editor
 * [POS]: Push screen from home — native grouped list with SegmentedControl, Switch, Slider
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { Switch, RefreshControl } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Stack, useRouter } from "expo-router";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Slider from "@react-native-community/slider";
import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { LinkedInProfile } from "@/src/types";

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
const GRP = { borderCurve: "continuous" as any };

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

const Separator = () => <View className="h-px bg-sf-separator ml-4" />;

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-caption-1 font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-1.5 mt-[35px]">
    {title}
  </Text>
);

const GroupedCard = ({ children }: { children: React.ReactNode }) => (
  <View className="bg-sf-card rounded-2xl overflow-hidden mx-4" style={GRP}>
    {children}
  </View>
);

function FieldToggleRow({ label, enabled, onToggle }: {
  label: string; enabled: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 min-h-[44px] py-[11px]">
      <Text className="text-body text-sf-text flex-1">{label}</Text>
      <Switch value={enabled} onValueChange={(v) => { haptic.selection(); onToggle(v); }} />
    </View>
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
  const [accentIntensity, setAccentIntensity] = useState(50);

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
              className="min-w-[44px] min-h-[44px] items-center justify-center"
            >
              <Text className="text-sf-blue text-body font-semibold">Done</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-sf-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => haptic.medium()} />}
      >
        {/* Live preview */}
        <View className="bg-sf-bg-2 rounded-2xl p-4 mx-4 mt-4" style={GRP}>
          <CardDisplay profile={card.profile} version={version} qrCodeData={card.qrCodeData} compact />
        </View>

        {/* Card version */}
        <SectionHeader title="Card Version" />
        <GroupedCard>
          <View className="px-4 py-[11px]">
            <SegmentedControl
              values={versionNames}
              selectedIndex={versionIdx}
              onChange={(e) => {
                haptic.selection();
                const t = card.versions[e.nativeEvent.selectedSegmentIndex];
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
          <View className="px-4 py-[11px]">
            <Text className="text-footnote text-sf-text-2 mb-1.5">Weight</Text>
            <SegmentedControl
              values={[...WEIGHTS]}
              selectedIndex={weightIdx}
              onChange={(e) => {
                haptic.selection();
                const w = WEIGHT_KEYS[e.nativeEvent.selectedSegmentIndex];
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
          <View className="px-4 py-[11px]">
            <Text className="text-footnote text-sf-text-2 mb-1.5">Intensity</Text>
            <Slider
              minimumValue={0}
              maximumValue={100}
              value={accentIntensity}
              onValueChange={setAccentIntensity}
              minimumTrackTintColor={version.accentColor}
            />
          </View>
        </GroupedCard>

        {/* Background */}
        <SectionHeader title="Background" />
        <GroupedCard>
          <Pressable
            className="flex-row items-center justify-between px-4 min-h-[44px] py-[11px]"
            onPress={() => haptic.light()}
          >
            <Text className="text-body text-sf-text">Choose Background</Text>
            <Icon web="chevron-forward" size={16} />
          </Pressable>
        </GroupedCard>
      </ScrollView>
    </>
  );
}
