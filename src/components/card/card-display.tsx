/**
 * [INPUT]: react-native View/Text/StyleSheet, @/src/types LinkedInProfile/CardVersion,
 *          Avatar, QRCode, react-native-reanimated
 * [OUTPUT]: CardDisplay — stable business card renderer with explicit RN layout
 * [POS]: Card core — hero component, isolated from flaky className layout utilities
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "@/src/components/shared/avatar";
import { QRCode } from "@/src/components/shared/qr-code";
import type { LinkedInProfile, CardVersion } from "@/src/types";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

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
  const vis = (f: string) => visibleFields.includes(f as any);

  return (
    <View style={[styles.shell, compact && styles.shellCompact]}>
      {/* QR Overlay */}
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

      {/* Card surface */}
      <View style={[styles.surface, compact ? styles.surfaceCompact : styles.surfaceRegular]}>
        {/* Top row: version name + location */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.versionName}>{version.name}</Text>
            {vis("location") && profile.location && (
              <Text style={styles.metaText}>{profile.location}</Text>
            )}
          </View>
          {vis("company") && profile.company && (
            <Text style={styles.metaText}>{profile.company}</Text>
          )}
        </View>

        {/* Centered avatar */}
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

        {/* Name */}
        {vis("name") && (
          <Text
            style={[styles.name, compact ? styles.nameCompact : styles.nameRegular]}
          >
            {profile.name}
          </Text>
        )}

        {/* Headline / Job Title */}
        {vis("headline") && (
          <Text
            style={styles.headline}
            numberOfLines={2}
          >
            {profile.jobTitle
              ? `${profile.jobTitle} at ${profile.company}`
              : profile.headline}
          </Text>
        )}

        {/* Character tag */}
        {vis("character") && profile.character && (
          <View style={styles.characterWrap}>
            <View
              style={[styles.characterChip, { backgroundColor: accentColor + "15" }]}
            >
              <Text style={[styles.characterText, { color: accentColor }]}>
                {profile.character}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom bar: Your Links + Direct */}
        <View
          style={styles.bottomBar}
        >
          <Text style={styles.bottomLabel}>LinkCard</Text>
          <View style={styles.bottomRight}>
            <View
              style={[styles.bottomDot, { backgroundColor: accentColor }]}
            />
            <Text style={styles.bottomLabel}>
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
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
    color: "#111111",
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111111",
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
    color: "#6B7280",
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
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: "#111111",
  },
  bottomRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
});
