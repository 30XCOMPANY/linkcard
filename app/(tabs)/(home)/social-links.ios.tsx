/**
 * [INPUT]: expo-router Stack/useRouter, @expo/ui/swift-ui Host/List/Section/LabeledContent/Text,
 *          @expo/ui/swift-ui/modifiers, @/src/stores/cardStore,
 *          @/src/lib/social-platforms, @/src/lib/haptics
 * [OUTPUT]: SocialLinksScreen — native SwiftUI list, tap to push detail, swipe to delete
 * [POS]: Push screen from editor — social links management with iOS-native interactions
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text as RNText } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Host, LabeledContent, List, Section, Text } from "@expo/ui/swift-ui";
import {
  environment,
  font,
  foregroundStyle,
  lineLimit,
  listStyle,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { getSocialPlatform } from "@/src/lib/social-platforms";
import { useCardStore } from "@/src/stores/cardStore";

export default function SocialLinksScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);
  const [editing, setEditing] = useState(false);

  const socialLinks = card?.profile.socialLinks ?? [];

  const handleDelete = useCallback(
    (indices: number[]) => {
      const links = [...socialLinks];
      [...indices]
        .sort((a, b) => b - a)
        .forEach((index) => links.splice(index, 1));
      updateProfile({ socialLinks: links });
    },
    [socialLinks, updateProfile]
  );

  const handleAdd = useCallback(() => {
    haptic.light();
    router.push("/social-link-picker" as any);
  }, [router]);

  if (!card) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>No card available.</RNText>
      </View>
    );
  }

  return (
    <>
      <Host style={styles.host}>
        <List
          modifiers={[
            listStyle("insetGrouped"),
            environment("editMode", editing ? "active" : "inactive"),
          ]}
        >
          <Section
            footer={
              socialLinks.length > 0 ? (
                <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                  Swipe left to delete. Tap to edit.
                </Text>
              ) : undefined
            }
          >
            {socialLinks.length > 0 ? (
              <List.ForEach onDelete={handleDelete}>
                {socialLinks.map((link, i) => {
                  const meta = getSocialPlatform(link.platform);
                  return (
                    <LabeledContent
                      key={`${link.platform}-${i}`}
                      label={meta.label}
                      modifiers={[
                        onTapGesture(() => {
                          if (editing) return;
                          haptic.light();
                          router.push({
                            pathname: "/social-link-detail" as any,
                            params: { index: String(i) },
                          });
                        }),
                      ]}
                    >
                      <Text
                        modifiers={[
                          foregroundStyle({ type: "hierarchical", style: "secondary" }),
                          font({ size: 14 }),
                          lineLimit(1),
                        ]}
                      >
                        {link.url || "Not set"}
                      </Text>
                    </LabeledContent>
                  );
                })}
              </List.ForEach>
            ) : (
              <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                No social links yet. Tap + to add one.
              </Text>
            )}
          </Section>
        </List>
      </Host>

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          onPress={() => {
            haptic.light();
            setEditing((prev) => !prev);
          }}
        >
          {editing ? "Done" : "Edit"}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={handleAdd}>
          Add
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
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
