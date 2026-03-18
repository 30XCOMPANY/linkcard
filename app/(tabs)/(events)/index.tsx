/**
 * [INPUT]: react-native Image/PlatformColor/ScrollView/StyleSheet/Text/View,
 *          expo-blur BlurView, expo-linear-gradient LinearGradient,
 *          @/assets/default-banner.jpg
 * [OUTPUT]: EventsScreen — events page with SF hero banner dissolving into page background
 * [POS]: Events tab main screen — hero image with progressive blur + background-matched fade
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Image, PlatformColor, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export default function EventsScreen() {
  const scheme = useColorScheme();
  const pageBg = scheme === "dark" ? "#000000" : "#F2F2F7";

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: pageBg }}
    >
      {/* Hero banner — progressive blur + fade into page background */}
      <View style={[styles.heroWrap, { backgroundColor: pageBg }]}>
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
        <BlurView intensity={100} tint="default" style={[styles.heroBlur, { top: "80%", opacity: 0.9  }]} />
        <BlurView intensity={100} tint="default" style={[styles.heroBlur, { top: "88%", opacity: 1.0  }]} />
        {/* Fade — blurred image dissolves into page background */}
        <LinearGradient
          colors={[
            pageBg + "00",
            pageBg + "30",
            pageBg + "80",
            pageBg + "CC",
            pageBg,
          ]}
          locations={[0, 0.25, 0.55, 0.8, 1]}
          style={styles.fadeMask}
        />
      </View>

      <View style={[styles.content, { backgroundColor: pageBg }]}>
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
