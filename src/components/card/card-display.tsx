/**
 * [INPUT]: react-native View/Text/StyleSheet, expo-linear-gradient, @/src/types LinkedInProfile/CardVersion,
 *          Avatar, QRCode, react-native-reanimated, @/src/lib/card-presets
 * [OUTPUT]: CardDisplay — stable business card renderer with explicit RN layout
 * [POS]: Card core — hero component, isolated from flaky className layout utilities
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

import { resolveCardBackground } from "@/src/lib/card-presets";
import { Avatar } from "@/src/components/shared/avatar";
import { QRCode } from "@/src/components/shared/qr-code";
import type { CardVersion, LinkedInProfile } from "@/src/types";

interface CardDisplayProps {
  profile: LinkedInProfile;
  version: CardVersion;
  qrCodeData: string;
  showQR?: boolean;
  compact?: boolean;
}

export function CardDisplay({
  profile,
  version,
  qrCodeData,
  showQR = false,
  compact = false,
}: CardDisplayProps) {
  const { visibleFields, accentColor } = version;
  const background = resolveCardBackground(version.background);
  const isDark = version.background === "midnightInk";
  const primaryText = isDark ? "#F8FAFC" : "#111111";
  const secondaryText = isDark ? "rgba(248,250,252,0.72)" : "#6B7280";
  const vis = (field: string) => visibleFields.includes(field as any);

  return (
    <View
      style={[
        styles.shell,
        compact && styles.shellCompact,
        { backgroundColor: background.surface, borderColor: background.border },
      ]}
    >
      <LinearGradient colors={background.gradient} style={StyleSheet.absoluteFillObject} />

      {showQR && (
        <Animated.View
          entering={ZoomIn.springify()}
          exiting={ZoomOut.duration(200)}
          style={styles.overlay}
        >
          <QRCode value={qrCodeData} size={compact ? 140 : 180} />
          <Text style={styles.overlayText} selectable>
            {qrCodeData}
          </Text>
        </Animated.View>
      )}

      <View
        style={[
          styles.surface,
          compact ? styles.surfaceCompact : styles.surfaceRegular,
          { backgroundColor: background.surface },
        ]}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={[styles.versionName, { color: primaryText }]}>{version.name}</Text>
            {vis("location") && profile.location && (
              <Text style={[styles.metaText, { color: secondaryText }]}>{profile.location}</Text>
            )}
          </View>
          {vis("company") && profile.company && (
            <Text style={[styles.metaText, { color: secondaryText }]}>{profile.company}</Text>
          )}
        </View>

        {vis("photoUrl") && (
          <View style={styles.avatarWrap}>
            <Avatar
              source={profile.photoUrl}
              name={profile.name}
              size={compact ? 64 : 80}
              accentColor={accentColor}
            />
          </View>
        )}

        {vis("name") && (
          <Text
            style={[
              styles.name,
              compact ? styles.nameCompact : styles.nameRegular,
              { color: primaryText },
            ]}
          >
            {profile.name}
          </Text>
        )}

        {vis("headline") && (
          <Text style={[styles.headline, { color: secondaryText }]} numberOfLines={2}>
            {profile.jobTitle ? `${profile.jobTitle} at ${profile.company}` : profile.headline}
          </Text>
        )}

        {vis("character") && profile.character && (
          <View style={styles.characterWrap}>
            <View style={[styles.characterChip, { backgroundColor: accentColor + "15" }]}>
              <Text style={[styles.characterText, { color: accentColor }]}>{profile.character}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomBar}>
          <Text style={[styles.bottomLabel, { color: secondaryText }]}>LinkCard</Text>
          <View style={styles.bottomRight}>
            <View style={[styles.bottomDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.bottomLabel, { color: secondaryText }]}>
              {version.template.charAt(0).toUpperCase() + version.template.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 24,
    borderCurve: "continuous" as any,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
  },
  shellCompact: {
    borderRadius: 22,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.97)",
  },
  overlayText: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
  },
  surface: {
    position: "relative",
  },
  surfaceRegular: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  surfaceCompact: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  versionName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    textAlign: "center",
    fontWeight: "700",
  },
  nameRegular: {
    fontSize: 22,
    lineHeight: 28,
  },
  nameCompact: {
    fontSize: 20,
    lineHeight: 25,
  },
  headline: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  characterWrap: {
    alignItems: "center",
    marginTop: 12,
  },
  characterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  characterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  bottomBar: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  bottomLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
});
