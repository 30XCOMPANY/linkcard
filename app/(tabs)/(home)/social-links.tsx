/**
 * [INPUT]: react-native, expo-router useRouter, @/src/stores/cardStore,
 *          @/src/lib/social-platforms, @/src/lib/platform-color
 * [OUTPUT]: SocialLinksScreen — web/Android fallback with plain RN components
 * [POS]: Push screen from editor — simple list of social links with delete
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { platformColor } from "@/src/lib/platform-color";
import { getSocialPlatform } from "@/src/lib/social-platforms";
import { useCardStore } from "@/src/stores/cardStore";

export default function SocialLinksScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);
  const updateProfile = useCardStore((state) => state.updateProfile);

  const socialLinks = card?.profile.socialLinks ?? [];

  const handleDelete = useCallback(
    (index: number) => {
      const links = [...socialLinks];
      links.splice(index, 1);
      updateProfile({ socialLinks: links });
    },
    [socialLinks, updateProfile]
  );

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
      {socialLinks.length > 0 ? (
        socialLinks.map((link, i) => {
          const meta = getSocialPlatform(link.platform);
          return (
            <Pressable
              key={`${link.platform}-${i}`}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/social-link-detail" as any,
                  params: { index: String(i) },
                })
              }
            >
              <View style={styles.cardBody}>
                <Text style={styles.linkTitle}>{meta.label}</Text>
                {link.url ? (
                  <Text style={styles.linkSub}>{link.url}</Text>
                ) : null}
              </View>
              <Pressable onPress={() => handleDelete(i)} hitSlop={8}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.emptyText}>
          No social links yet. Tap Add to create one.
        </Text>
      )}

      <Pressable
        style={styles.addBtn}
        onPress={() => router.push("/social-link-picker" as any)}
      >
        <Text style={styles.addBtnText}>Add Social Link</Text>
      </Pressable>
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
  card: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  linkTitle: {
    color: platformColor("label"),
    fontSize: 17,
    fontWeight: "600",
  },
  linkSub: {
    color: platformColor("secondaryLabel"),
    fontSize: 14,
  },
  deleteText: {
    color: platformColor("systemRed"),
    fontSize: 15,
  },
  addBtn: {
    alignItems: "center",
    backgroundColor: platformColor("systemBlue"),
    borderRadius: 12,
    marginTop: 8,
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 12,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
