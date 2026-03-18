/**
 * [INPUT]: react-native Image/PlatformColor/ScrollView/StyleSheet/Text/View,
 *          expo-blur BlurView, expo-linear-gradient LinearGradient,
 *          @/assets/default-banner.jpg
 * [OUTPUT]: EventsScreen — events page with SF hero banner, blur + fade-to-background mask
 * [POS]: Events tab main screen — hero image fades out into page background via blur + gradient mask
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Image, Platform, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const PAGE_BG = Platform.OS === "ios"
  ? (PlatformColor("systemGroupedBackground") as unknown as string)
  : "#F2F2F7";

export default function EventsScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero banner — blur layers + transparent-to-background fade mask */}
      <View style={styles.heroWrap}>
        <Image
          source={require("@/assets/default-banner.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Progressive blur */}
        <BlurView intensity={8}   tint="default" style={[styles.heroBlur, { top: "45%", opacity: 0.2  }]} />
        <BlurView intensity={20}  tint="default" style={[styles.heroBlur, { top: "52%", opacity: 0.35 }]} />
        <BlurView intensity={40}  tint="default" style={[styles.heroBlur, { top: "59%", opacity: 0.5  }]} />
        <BlurView intensity={60}  tint="default" style={[styles.heroBlur, { top: "66%", opacity: 0.65 }]} />
        <BlurView intensity={80}  tint="default" style={[styles.heroBlur, { top: "73%", opacity: 0.8  }]} />
        <BlurView intensity={100} tint="default" style={[styles.heroBlur, { top: "80%", opacity: 0.9  }]} />
        <BlurView intensity={100} tint="default" style={[styles.heroBlur, { top: "87%", opacity: 1.0  }]} />
        {/* Fade mask — image dissolves into page background */}
        <LinearGradient
          colors={["transparent", "transparent", PAGE_BG]}
          locations={[0, 0.55, 1]}
          style={styles.fadeMask}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>San Francisco</Text>
        <Text style={styles.subtitle}>No upcoming events</Text>
        <Text style={styles.body}>
          Events from your network will appear here. Stay tuned.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: -200,
    height: 400,
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
    height: "60%",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: PlatformColor("label") as unknown as string,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: PlatformColor("secondaryLabel") as unknown as string,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: PlatformColor("tertiaryLabel") as unknown as string,
  },
});
