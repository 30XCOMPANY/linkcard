/**
 * [INPUT]: react-native Image/Pressable/ScrollView/StyleSheet/Text/View,
 *          expo-blur BlurView, expo-linear-gradient LinearGradient,
 *          expo-router useRouter, @/assets/default-banner.jpg,
 *          @/src/lib/platform-color, @/src/lib/semantic-colors, @/src/lib/theme
 * [OUTPUT]: EventsScreen — events placeholder with minimal empty-state guidance
 * [POS]: Events tab main screen — lightweight placeholder that points to the next best action
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { platformColor } from "@/src/lib/platform-color";
import { LinearGradient } from "expo-linear-gradient";
import { useSemanticColors } from "@/src/lib/semantic-colors";
import { useResolvedTheme } from "@/src/lib/theme";

export default function EventsScreen() {
  const router = useRouter();
  const sc = useSemanticColors();
  const fadeBg = useResolvedTheme() === "dark" ? "#000000" : "#F2F2F7";

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: platformColor("systemGroupedBackground") }}
    >
      {/* Hero banner — progressive blur + fade into page background */}
      <View style={styles.heroWrap}>
        <Image
          source={require("@/assets/default-banner.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Progressive blur layers */}
        <BlurView intensity={8}   tint="default" style={[styles.heroBlur, { top: "40%", opacity: 0.15 }]} />
        <BlurView intensity={20}  tint="default" style={[styles.heroBlur, { top: "48%", opacity: 0.3  }]} />
        <BlurView intensity={40}  tint="default" style={[styles.heroBlur, { top: "56%", opacity: 0.45 }]} />
        <BlurView intensity={60}  tint="default" style={[styles.heroBlur, { top: "64%", opacity: 0.6  }]} />
        <BlurView intensity={80}  tint="default" style={[styles.heroBlur, { top: "72%", opacity: 0.75 }]} />
        <BlurView intensity={100} tint="default" style={[styles.heroBlur, { top: "88%" }]} />
        {/* Fade — blurred image dissolves into page background.
            Uses semantic pageBg hex for gradient concat. The underlying
            contentStyle already guarantees correct bg via platformColor. */}
        <LinearGradient
          colors={[
            fadeBg + "00",
            fadeBg + "30",
            fadeBg + "80",
            fadeBg + "CC",
            fadeBg,
          ]}
          locations={[0, 0.25, 0.55, 0.8, 1]}
          style={styles.fadeMask}
        />
      </View>

      <View style={[styles.content, { backgroundColor: platformColor("systemGroupedBackground") }]}>
        <Text style={styles.heading}>San Francisco</Text>
        <Text style={styles.subtitle}>No upcoming events yet</Text>
        <Text style={styles.body}>
          Nothing is scheduled yet. Save people in Discover or review your card before the next room you walk into.
        </Text>
        <View style={styles.actionStack}>
          <Pressable style={[styles.primaryAction, { backgroundColor: sc.buttonPrimaryBg }]} onPress={() => router.push("/(discover)" as any)}>
            <Text style={[styles.primaryActionLabel, { color: sc.buttonPrimaryLabel }]}>Open Discover</Text>
          </Pressable>
          <Pressable style={[styles.secondaryAction, { backgroundColor: sc.buttonSecondaryBg }]} onPress={() => router.push("/(home)" as any)}>
            <Text style={[styles.secondaryActionLabel, { color: sc.buttonSecondaryLabel }]}>Review My Card</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: -200,
    height: 420,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  fadeMask: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: platformColor("label"),
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: platformColor("secondaryLabel"),
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: platformColor("tertiaryLabel"),
  },
  actionStack: {
    gap: 12,
    marginTop: 24,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
});
