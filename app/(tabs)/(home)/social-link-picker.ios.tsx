/**
 * [INPUT]: expo-router useRouter, @expo/ui/swift-ui Host/List/Section/LabeledContent/TextField/Text,
 *          @expo/ui/swift-ui/modifiers, @/src/stores/cardStore,
 *          @/src/lib/social-platforms (detectPlatformFromUrl, getSocialPlatform, PLATFORM_ORDER),
 *          @/src/lib/haptics
 * [OUTPUT]: SocialLinkPickerScreen — URL-first add flow with platform auto-detection + manual fallback
 * [POS]: Push screen from social-links — paste URL to auto-detect, or browse platform list
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, Text as RNText } from "react-native";
import { useRouter } from "expo-router";
import { Host, LabeledContent, List, Section, TextField, Text } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listStyle,
  onTapGesture,
} from "@expo/ui/swift-ui/modifiers";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import {
  detectPlatformFromUrl,
  getSocialPlatform,
  PLATFORM_ORDER,
} from "@/src/lib/social-platforms";
import { useCardStore } from "@/src/stores/cardStore";
import type { SocialPlatform } from "@/src/types";

export default function SocialLinkPickerScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const socialLinks = card?.profile.socialLinks ?? [];
  const existing = useMemo(
    () => new Set(socialLinks.map((l) => l.platform)),
    [socialLinks]
  );

  const available = useMemo(
    () => PLATFORM_ORDER.filter((p) => !existing.has(p)),
    [existing]
  );

  const addLink = useCallback(
    (platform: SocialPlatform, url: string) => {
      haptic.light();
      const links = [...socialLinks, { platform, url }];
      updateProfile({ socialLinks: links });
      const newIndex = links.length - 1;
      router.replace({
        pathname: "/social-link-detail" as any,
        params: { index: String(newIndex) },
      });
    },
    [socialLinks, updateProfile, router]
  );

  const handleUrlSubmit = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;
      const detected = detectPlatformFromUrl(trimmed);
      const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      addLink(existing.has(detected) ? "website" : detected, normalized);
    },
    [addLink, existing]
  );

  if (!card) {
    return (
      <View style={styles.empty}>
        <RNText style={styles.emptyText}>No card available.</RNText>
      </View>
    );
  }

  return (
    <Host style={styles.host}>
      <List modifiers={[listStyle("insetGrouped")]}>
        <Section
          header={
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
              Paste a link
            </Text>
          }
          footer={
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
              Paste any social profile URL — the platform is detected automatically.
            </Text>
          }
        >
          <TextField
            placeholder="https://github.com/username"
            keyboardType="url"
            autocorrection={false}
            onSubmit={handleUrlSubmit}
          />
        </Section>

        <Section
          header={
            <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
              Or choose a platform
            </Text>
          }
        >
          {available.map((platform) => {
            const meta = getSocialPlatform(platform);
            return (
              <LabeledContent
                key={platform}
                label={meta.label}
                modifiers={[onTapGesture(() => addLink(platform, ""))]}
              >
                <Text modifiers={[foregroundStyle({ type: "hierarchical", style: "secondary" })]}>
                  {meta.urlPrefix.replace(/^https?:\/\//, "")}
                </Text>
              </LabeledContent>
            );
          })}
        </Section>
      </List>
    </Host>
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
