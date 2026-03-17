/**
 * [INPUT]: @/src/tw View/Text/ScrollView/Pressable, @/src/stores/cardStore useCardStore,
 *          @/src/components/card/card-display CardDisplay, @/src/lib/haptics haptic,
 *          @/src/lib/icons Icon, react-native Switch
 * [OUTPUT]: EditorScreen — card editor with live preview, field toggles, background row
 * [POS]: Push screen from home — card customization with native grouped list controls
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { Switch } from "react-native";
import { View, Text, ScrollView, Pressable } from "@/src/tw";
import { Stack, useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { LinkedInProfile } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Field metadata                                                     */
/* ------------------------------------------------------------------ */

type ToggleableField = keyof LinkedInProfile | "qrCode" | "character";

interface FieldMeta {
  key: ToggleableField;
  label: string;
}

const TOGGLEABLE_FIELDS: FieldMeta[] = [
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

/* ------------------------------------------------------------------ */
/*  Separator                                                          */
/* ------------------------------------------------------------------ */

function Separator() {
  return <View className="h-px bg-sf-separator ml-4" />;
}

/* ------------------------------------------------------------------ */
/*  Section Header                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8">
      {title}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Field Toggle Row                                                   */
/* ------------------------------------------------------------------ */

function FieldToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <Pressable className="flex-row items-center justify-between px-4 min-h-[44px] py-3">
      <Text className="text-base text-sf-text flex-1">{label}</Text>
      <Switch
        value={enabled}
        onValueChange={(val) => {
          haptic.selection();
          onToggle(val);
        }}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Editor Screen                                                      */
/* ------------------------------------------------------------------ */

export default function EditorScreen() {
  const router = useRouter();
  const card = useCardStore((s) => s.card);
  const updateVersion = useCardStore((s) => s.updateVersion);

  // Current default version
  const version = card?.versions.find((v) => v.isDefault) ?? card?.versions[0];

  const handleToggleField = useCallback(
    (field: ToggleableField, next: boolean) => {
      if (!version) return;

      const current = version.visibleFields as string[];
      const updated = next
        ? [...current, field]
        : current.filter((f) => f !== field);

      updateVersion(version.id, { visibleFields: updated as any });
    },
    [version, updateVersion]
  );

  /* Empty state */
  if (!card || !version) {
    return (
      <View className="flex-1 items-center justify-center bg-sf-bg">
        <Text className="text-base text-sf-text-2">No card to edit.</Text>
      </View>
    );
  }

  const visibleSet = new Set(version.visibleFields as string[]);

  return (
    <>
      {/* Header Done button */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => {
                haptic.light();
                router.back();
              }}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
            >
              <Text className="text-sf-blue text-base font-semibold">Done</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-sf-bg"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="pb-12"
      >
        {/* Live Card Preview */}
        <View
          className="bg-sf-bg-2 rounded-2xl p-4 mx-4 mt-4"
          style={{ borderCurve: "continuous" as any }}
        >
          <CardDisplay
            profile={card.profile}
            version={version}
            qrCodeData={card.qrCodeData}
            compact
          />
        </View>

        {/* VISIBLE FIELDS */}
        <SectionHeader title="Visible Fields" />
        <View
          className="bg-sf-card rounded-2xl overflow-hidden mx-4"
          style={{ borderCurve: "continuous" as any }}
        >
          {TOGGLEABLE_FIELDS.map((field, i) => (
            <React.Fragment key={field.key}>
              {i > 0 && <Separator />}
              <FieldToggleRow
                label={field.label}
                enabled={visibleSet.has(field.key)}
                onToggle={(next) => handleToggleField(field.key, next)}
              />
            </React.Fragment>
          ))}
        </View>

        {/* BACKGROUND */}
        <SectionHeader title="Background" />
        <View
          className="bg-sf-card rounded-2xl overflow-hidden mx-4"
          style={{ borderCurve: "continuous" as any }}
        >
          <Pressable
            className="flex-row items-center justify-between px-4 min-h-[44px] py-3 min-w-[44px]"
            onPress={() => {
              haptic.light();
              // Sheet implementation deferred
            }}
          >
            <Text className="text-base text-sf-text">Choose Background</Text>
            <Icon ios="chevron.right" web="chevron-forward" size={16} />
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
