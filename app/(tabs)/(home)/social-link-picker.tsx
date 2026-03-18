/**
 * [INPUT]: react-native, expo-router useRouter, @/src/stores/cardStore,
 *          @/src/lib/social-platforms (detectPlatformFromUrl, getSocialPlatform, PLATFORM_ORDER),
 *          @/src/lib/platform-color
 * [OUTPUT]: SocialLinkPickerScreen — web/Android fallback, URL-first with manual platform list
 * [POS]: Push screen from social-links — paste URL to auto-detect, or browse platform list
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

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
  const [urlInput, setUrlInput] = useState("");

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

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const detected = detectPlatformFromUrl(trimmed);
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    addLink(existing.has(detected) ? "website" : detected, normalized);
  }, [urlInput, addLink, existing]);

  if (!card) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No card available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Text style={styles.sectionHeader}>PASTE A LINK</Text>
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="https://github.com/username"
          placeholderTextColor={platformColor("tertiaryLabel")}
          keyboardType="url"
          autoCorrect={false}
          autoCapitalize="none"
          value={urlInput}
          onChangeText={setUrlInput}
          onSubmitEditing={handleUrlSubmit}
          returnKeyType="go"
        />
      </View>
      <Text style={styles.sectionFooter}>
        Paste any social profile URL — the platform is detected automatically.
      </Text>

      <Text style={[styles.sectionHeader, { marginTop: 24 }]}>OR CHOOSE A PLATFORM</Text>
      {available.map((platform) => {
        const meta = getSocialPlatform(platform);
        return (
          <Pressable
            key={platform}
            style={styles.card}
            onPress={() => addLink(platform, "")}
          >
            <Text style={styles.label}>{meta.label}</Text>
            <Text style={styles.prefix}>
              {meta.urlPrefix.replace(/^https?:\/\//, "")}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
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
  sectionHeader: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: -4,
    paddingHorizontal: 4,
  },
  sectionFooter: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
    paddingHorizontal: 4,
    marginTop: -4,
  },
  inputCard: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderRadius: 12,
    padding: 16,
  },
  input: {
    color: platformColor("label"),
    fontSize: 17,
  },
  card: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  label: {
    color: platformColor("label"),
    fontSize: 17,
    fontWeight: "600",
  },
  prefix: {
    color: platformColor("secondaryLabel"),
    fontSize: 14,
  },
});
