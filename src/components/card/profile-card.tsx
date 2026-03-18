/**
 * [INPUT]: react-native View/Text/Image/Pressable/StyleSheet/PlatformColor/Linking,
 *          expo-blur BlurView, expo-linear-gradient LinearGradient,
 *          @/src/components/shared/avatar Avatar, @/src/lib/haptics,
 *          @/src/lib/profile-tags, @/src/lib/name-fonts, @/src/lib/card-presets,
 *          @/src/types LinkedInProfile/CardVersion
 * [OUTPUT]: ProfileCard — full profile card with banner, glass-framed avatar, tags, contacts
 * [POS]: Shared card component — used on home/editor flows for the high-emphasis profile hero
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  PlatformColor,
  Linking,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar } from "@/src/components/shared/avatar";
import { Icon } from "@/src/lib/icons";
import { haptic } from "@/src/lib/haptics";
import { deriveProfileTags } from "@/src/lib/profile-tags";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import { resolveCardBackground } from "@/src/lib/card-presets";
import type { LinkedInProfile, CardVersion } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Tag Pill                                                           */
/* ------------------------------------------------------------------ */

interface TagPillColors {
  bg: string;
  border: string;
  label: string;
}

function TagPill({ emoji, label, colors }: { emoji: string; label: string; colors: TagPillColors }) {
  return (
    <View style={[s.tag, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={s.tagEmoji}>{emoji}</Text>
      <Text style={[s.tagLabel, { color: colors.label }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  ProfileCard                                                        */
/* ------------------------------------------------------------------ */

interface ProfileCardProps {
  profile: LinkedInProfile;
  version: CardVersion;
  nameFont?: NameFontKey;
  onBannerPress?: () => void;
}

export function ProfileCard({
  profile,
  version,
  nameFont = "classic",
  onBannerPress,
}: ProfileCardProps) {
  const accent = version.accentColor;
  const vis = new Set(version.visibleFields as string[]);
  const tags = deriveProfileTags(profile);
  const background = resolveCardBackground(version.background);
  const dark = background.isDark;
  const bannerFadeColors = dark
    ? ["transparent", "rgba(17,24,39,0.3)", "rgba(17,24,39,0.8)", background.surface] as const
    : ["transparent", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)", background.surface] as const;

  /* Dark/light adaptive palette */
  const colors = {
    label: dark ? "#F9FAFB" : (PlatformColor("label") as unknown as string),
    secondaryLabel: dark ? "rgba(255,255,255,0.60)" : (PlatformColor("secondaryLabel") as unknown as string),
    tertiaryLabel: dark ? "rgba(255,255,255,0.40)" : (PlatformColor("tertiaryLabel") as unknown as string),
    pillBg: dark ? "rgba(255,255,255,0.10)" : (PlatformColor("systemBackground") as unknown as string),
    pillBorder: dark ? "rgba(255,255,255,0.12)" : (PlatformColor("separator") as unknown as string),
    link: accent,
    separator: dark ? "rgba(255,255,255,0.10)" : (PlatformColor("separator") as unknown as string),
  };

  const nameWeightMap = { regular: "400", medium: "500", bold: "700" } as const;
  const nameWeight = nameWeightMap[(version.fieldStyles?.name?.fontWeight as keyof typeof nameWeightMap)] ?? "400";

  const showWebsite = vis.has("website") && profile.website;
  const showJobTitle = vis.has("jobTitle") && profile.jobTitle;

  return (
    <View style={[s.card, { backgroundColor: background.surface, borderColor: background.border }]}>
      {/* Banner Image */}
      <Pressable style={s.bannerWrap} onPress={onBannerPress} disabled={!onBannerPress}>
        <Image
          source={
            profile.bannerUrl
              ? { uri: profile.bannerUrl }
              : require("@/assets/default-banner.jpg")
          }
          style={s.bannerImage}
          resizeMode="cover"
        />
        {/* Progressive blur — 8 layers */}
        <BlurView intensity={15}  tint="default" style={[s.bannerBlur, { top: "30%", opacity: 0.15 }]} />
        <BlurView intensity={30}  tint="default" style={[s.bannerBlur, { top: "38%", opacity: 0.25 }]} />
        <BlurView intensity={50}  tint="default" style={[s.bannerBlur, { top: "46%", opacity: 0.35 }]} />
        <BlurView intensity={70}  tint="default" style={[s.bannerBlur, { top: "54%", opacity: 0.50 }]} />
        <BlurView intensity={85}  tint="default" style={[s.bannerBlur, { top: "62%", opacity: 0.65 }]} />
        <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "70%", opacity: 0.80 }]} />
        <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "78%", opacity: 0.90 }]} />
        <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "86%", opacity: 1.0  }]} />
        <LinearGradient
          colors={bannerFadeColors}
          locations={[0, 0.4, 0.7, 1]}
          style={s.bannerFade}
        />
      </Pressable>

      {/* Avatar */}
      <Avatar
        source={profile.photoUrl}
        name={profile.name}
        size={120}
        glassPadding={8}
        glassIntensity={18}
        accentColor={accent}
      />

      {/* Name */}
      {vis.has("name") && (
        <Text
          style={[
            s.profileName,
            { color: colors.label, fontWeight: nameWeight as any },
            nameFonts[nameFont].fontFamily
              ? { fontFamily: nameFonts[nameFont].fontFamily }
              : undefined,
          ]}
        >
          {profile.name}
        </Text>
      )}

      {/* Identity Line */}
      {(showWebsite || showJobTitle) && (
        <View style={s.identityLine}>
          {showWebsite && (
            <Pressable
              onPress={() => {
                haptic.light();
                const url = profile.website!.startsWith("http")
                  ? profile.website!
                  : `https://${profile.website}`;
                Linking.openURL(url);
              }}
              style={s.identityLink}
            >
              <Text style={s.identityEmoji}>🗺</Text>
              <Text style={[s.identityLinkText, { color: colors.link }]}>
                {profile.website!.replace(/^https?:\/\//, "")}
              </Text>
            </Pressable>
          )}
          {showWebsite && showJobTitle && (
            <Text style={[s.identitySep, { color: colors.secondaryLabel }]}> | </Text>
          )}
          {showJobTitle && (
            <Text style={[s.identityRole, { color: colors.label }]}>{profile.jobTitle}</Text>
          )}
        </View>
      )}

      {/* Headline */}
      {vis.has("headline") && (
        profile.headline ? (
          <View style={[s.statusBox, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
            <Text style={[s.statusText, { color: colors.label }]} numberOfLines={2}>
              {profile.headline}
            </Text>
          </View>
        ) : (
          <View style={[s.statusBox, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
            <Text style={[s.statusPlaceholder, { color: colors.tertiaryLabel }]}>What do you do?</Text>
          </View>
        )
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={s.tagsWrap}>
          {tags.map((t, i) => (
            <TagPill
              key={`${t.label}-${i}`}
              emoji={t.emoji}
              label={t.label}
              colors={{ bg: colors.pillBg, border: colors.pillBorder, label: colors.label }}
            />
          ))}
        </View>
      )}

      {/* Contact + Stats */}
      {vis.has("email") && (
        <View style={s.contactRow}>
          <View style={[s.contactPill, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
            <Text style={s.contactPillIcon}>✉</Text>
            <Text style={[s.contactPillText, { color: colors.secondaryLabel }]}>
              {profile.email ?? "No contact set"}
            </Text>
          </View>
          <View style={s.statsRow}>
            <Text style={[s.statNum, { color: colors.link }]}>0</Text>
            <Text style={[s.statLabel, { color: colors.secondaryLabel }]}> connects </Text>
            <Text style={[s.statNum, { color: colors.link }]}>0</Text>
            <Text style={[s.statLabel, { color: colors.secondaryLabel }]}> shares</Text>
          </View>
          <View style={[s.statsSeparator, { backgroundColor: colors.separator }]} />
        </View>
      )}

      {/* Social icons row */}
      <View style={s.socialRow}>
        {profile.url ? (
          <Pressable
            style={[s.socialIcon, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
            onPress={() => { haptic.light(); Linking.openURL(profile.url); }}
          >
            <Icon web="link" size={18} color={colors.link} />
          </Pressable>
        ) : null}
        {profile.website ? (
          <Pressable
            style={[s.socialIcon, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
            onPress={() => {
              haptic.light();
              const url = profile.website!.startsWith("http") ? profile.website! : `https://${profile.website}`;
              Linking.openURL(url);
            }}
          >
            <Icon web="globe" size={18} color={colors.link} />
          </Pressable>
        ) : null}
        {profile.email ? (
          <Pressable
            style={[s.socialIcon, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
            onPress={() => { haptic.light(); Linking.openURL(`mailto:${profile.email}`); }}
          >
            <Icon web="mail" size={18} color={colors.link} />
          </Pressable>
        ) : null}
        {profile.phone ? (
          <Pressable
            style={[s.socialIcon, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
            onPress={() => { haptic.light(); Linking.openURL(`tel:${profile.phone}`); }}
          >
            <Icon web="phone" size={18} color={colors.link} />
          </Pressable>
        ) : null}
      </View>

      {/* Publications */}
      {profile.publications &&
        profile.publications.length > 0 &&
        profile.publications
          .slice(0, 3)
          .map(
            (
              pub: { title: string; publisher?: string; url?: string },
              i: number
            ) => (
              <Pressable
                key={`pub-${i}`}
                style={[s.pubCard, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
                onPress={() => {
                  if (pub.url) {
                    haptic.light();
                    Linking.openURL(pub.url);
                  }
                }}
              >
                <View style={s.pubContent}>
                  <Text style={[s.pubTitle, { color: colors.label }]} numberOfLines={1}>
                    {pub.title}
                  </Text>
                  {pub.publisher && (
                    <Text style={[s.pubMeta, { color: colors.secondaryLabel }]}>{pub.publisher}</Text>
                  )}
                </View>
                {pub.url && (
                  <View style={[s.pubVisit, { backgroundColor: dark ? "rgba(255,255,255,0.15)" : undefined }]}>
                    <Text style={[s.pubVisitText, { color: dark ? "#F9FAFB" : "#FFFFFF" }]}>Visit</Text>
                  </View>
                )}
              </Pressable>
            )
          )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  card: {
    backgroundColor: PlatformColor(
      "secondarySystemGroupedBackground"
    ) as unknown as string,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
    overflow: "hidden",
  },

  bannerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  bannerImage: { width: "100%", height: "100%" },
  bannerBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },

  profileName: {
    fontSize: 32,
    color: PlatformColor("label") as unknown as string,
    letterSpacing: 0.2,
  },

  statusBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
  },
  statusText: {
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("label") as unknown as string,
  },
  statusPlaceholder: {
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("tertiaryLabel") as unknown as string,
  },

  identityLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  identityLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  identityEmoji: { fontSize: 15 },
  identityLinkText: {
    fontSize: 15,
    color: PlatformColor("systemBlue") as unknown as string,
    fontWeight: "600",
  },
  identitySep: {
    fontSize: 15,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
  identityRole: {
    fontSize: 15,
    color: PlatformColor("label") as unknown as string,
  },

  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
  },
  tagEmoji: { fontSize: 14 },
  tagLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: PlatformColor("label") as unknown as string,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  contactPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
  },
  contactPillIcon: { fontSize: 14 },
  contactPillText: {
    fontSize: 13,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statNum: {
    fontSize: 15,
    fontWeight: "700",
    color: PlatformColor("systemBlue") as unknown as string,
  },
  statLabel: {
    fontSize: 13,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
  statsSeparator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: PlatformColor("separator") as unknown as string,
    marginLeft: 8,
  },

  socialRow: {
    flexDirection: "row",
    gap: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous" as any,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  pubCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
    minHeight: 50,
  },
  pubContent: { flex: 1, marginRight: 12 },
  pubTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: PlatformColor("label") as unknown as string,
  },
  pubMeta: {
    fontSize: 13,
    color: PlatformColor("secondaryLabel") as unknown as string,
    marginTop: 2,
  },
  pubVisit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBlue") as unknown as string,
  },
  pubVisitText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
