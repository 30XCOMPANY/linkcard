/**
 * [INPUT]: react-native Platform/Pressable/StyleSheet/Text/View, expo-router useRouter, @/src/stores/cardStore,
 *          @/src/lib/public-url
 * [OUTPUT]: IndexScreen — reserved root route that keeps `/` available for landing on web and routes native users into the app
 * [POS]: Root index route — protects the homepage from onboarding gating while keeping native entry behavior explicit
 * [PROTOCOL]: Update this header on change, then check AGENTS.md
 */

import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useCardStore } from "@/src/stores/cardStore";
import { PUBLIC_SITE_URL } from "@/src/lib/public-url";

export default function IndexScreen() {
  const router = useRouter();
  const card = useCardStore((state) => state.card);

  useEffect(() => {
    if (Platform.OS === "web") return;
    router.replace(card ? "/(tabs)/(home)" : "/onboarding");
  }, [card, router]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>LINKCARD</Text>
        <Text style={styles.title}>Professional networking cards that live at one clean URL.</Text>
        <Text style={styles.subtitle}>
          The homepage stays at {PUBLIC_SITE_URL}. Public cards live under the reserved
          {" "}
          <Text style={styles.inlineCode}>/u/</Text>
          {" "}
          namespace.
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push(card ? "/(tabs)/(home)" : "/onboarding")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonLabel}>
              {card ? "Open My Card" : "Create Your Card"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/u/demo-card")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonLabel}>View Public Route</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  hero: {
    width: "100%",
    maxWidth: 760,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#2563EB",
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: "#475569",
  },
  inlineCode: {
    fontFamily: "JetBrainsMono_400Regular",
    color: "#0F172A",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 28,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
});
