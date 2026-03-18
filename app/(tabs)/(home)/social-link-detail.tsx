/**
 * [INPUT]: expo-router useLocalSearchParams, react-native StyleSheet/View/Text,
 *          @expo/ui/swift-ui Host/List/Section/TextField/Text,
 *          @expo/ui/swift-ui/modifiers listStyle/foregroundStyle,
 *          @/src/stores/cardStore, @/src/lib/social-platforms, @/src/lib/platform-color
 * [OUTPUT]: SocialLinkDetailScreen — SwiftUI form to edit a social link URL
 * [POS]: Push screen from social-links — inline TextField editing for URL
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, View, Text as RNText } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Host, List, Section, TextField, Text } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";

import { platformColor } from "@/src/lib/platform-color";
import { getSocialPlatform } from "@/src/lib/social-platforms";
import { useCardStore } from "@/src/stores/cardStore";

export default function SocialLinkDetailScreen() {
  const { index: indexParam } = useLocalSearchParams<{ index: string }>();
  const linkIndex = parseInt(indexParam ?? "0", 10);

  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const socialLinks = card?.profile.socialLinks ?? [];
  const link = socialLinks[linkIndex];

  const handleUrlChange = useCallback(
    (value: string) => {
      const links = [...socialLinks];
      links[linkIndex] = { ...links[linkIndex], url: value.trim() };
      updateProfile({ socialLinks: links });
    },
    [socialLinks, linkIndex, updateProfile]
  );

  if (!card || !link) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>Link not found.</RNText>
      </View>
    );
  }

  const meta = getSocialPlatform(link.platform);

  return (
    <>
      <Stack.Screen options={{ title: meta.label }} />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section
            header={
              <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                {meta.label}
              </Text>
            }
            footer={
              <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                Changes are saved automatically.
              </Text>
            }
          >
            <TextField
              defaultValue={link.url}
              placeholder={meta.placeholder}
              keyboardType="url"
              autocorrection={false}
              onSubmit={handleUrlChange}
            />
          </Section>
        </List>
      </Host>
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
