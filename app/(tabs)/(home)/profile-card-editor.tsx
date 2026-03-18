/**
 * [INPUT]: react-native Image/Linking/Pressable/StyleSheet/Text/View/PlatformColor,
 *          expo-linear-gradient, expo-blur, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/name-fonts, @/src/lib/card-presets,
 *          @/src/types LinkedInProfile/CardTag/CardVersion,
 *          local editable-text/editable-tag-list
 * [OUTPUT]: ProfileCardEditor — editable home hero card body with banner, inline text, tags, and links
 * [POS]: (home) 模块展示层，渲染卡片主体而不拥有全局状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import {
  Image,
  Linking,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import { resolveCardBackground } from "@/src/lib/card-presets";
import type { CardTag, CardVersion, LinkedInProfile } from "@/src/types";

import { EditableTagList } from "./editable-tag-list";
import { EditableText } from "./editable-text";

interface ProfileCardEditorProps {
  nameFont: NameFontKey;
  onBannerPress: () => void;
  onHeadlineSave: (value: string) => void;
  onNameSave: (value: string) => void;
  onTagAdd: (input: string) => void;
  onTagDelete: (id: string) => void;
  onTagRename: (id: string, label: string) => void;
  onTagsEditingChange: (editing: boolean) => void;
  profile: LinkedInProfile;
  tags: CardTag[];
  tagsEditing: boolean;
  version: CardVersion;
}

export function ProfileCardEditor({
  nameFont,
  onBannerPress,
  onHeadlineSave,
  onNameSave,
  onTagAdd,
  onTagDelete,
  onTagRename,
  onTagsEditingChange,
  profile,
  tags,
  tagsEditing,
  version,
}: ProfileCardEditorProps) {
  const background = resolveCardBackground(version.background);
  const dark = background.isDark;
  const vis = new Set(version.visibleFields as string[]);
  const bannerFadeColors = dark
    ? ["transparent", "rgba(17,24,39,0.3)", "rgba(17,24,39,0.8)", background.surface] as const
    : ["transparent", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)", background.surface] as const;

  const colors = {
    label: dark ? "#F9FAFB" : (PlatformColor("label") as unknown as string),
    secondaryLabel: dark ? "rgba(255,255,255,0.60)" : (PlatformColor("secondaryLabel") as unknown as string),
    tertiaryLabel: dark ? "rgba(255,255,255,0.40)" : (PlatformColor("tertiaryLabel") as unknown as string),
    pillBg: dark ? "rgba(255,255,255,0.10)" : (PlatformColor("systemBackground") as unknown as string),
    pillBorder: dark ? "rgba(255,255,255,0.12)" : (PlatformColor("separator") as unknown as string),
    link: dark ? "#60A5FA" : (PlatformColor("systemBlue") as unknown as string),
    separator: dark ? "rgba(255,255,255,0.10)" : (PlatformColor("separator") as unknown as string),
  };

  const showWebsite = vis.has("website") && profile.website;
  const showJobTitle = vis.has("jobTitle") && profile.jobTitle;

  return (
    <View style={[styles.card, { backgroundColor: background.surface, borderColor: background.border }]}>
      <Pressable onPress={onBannerPress} style={styles.bannerWrap}>
        <Image
          resizeMode="cover"
          source={
            profile.bannerUrl
              ? { uri: profile.bannerUrl }
              : require("@/assets/default-banner.jpg")
          }
          style={styles.bannerImage}
        />
        <BlurView intensity={15} tint="default" style={[styles.bannerBlur, { top: "30%", opacity: 0.15 }]} />
        <BlurView intensity={30} tint="default" style={[styles.bannerBlur, { top: "38%", opacity: 0.25 }]} />
        <BlurView intensity={50} tint="default" style={[styles.bannerBlur, { top: "46%", opacity: 0.35 }]} />
        <BlurView intensity={70} tint="default" style={[styles.bannerBlur, { top: "54%", opacity: 0.5 }]} />
        <BlurView intensity={85} tint="default" style={[styles.bannerBlur, { top: "62%", opacity: 0.65 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "70%", opacity: 0.8 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "78%", opacity: 0.9 }]} />
        <BlurView intensity={100} tint="default" style={[styles.bannerBlur, { top: "86%", opacity: 1 }]} />
        <LinearGradient
          colors={bannerFadeColors}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.bannerFade}
        />
      </Pressable>

      <Avatar
        accentColor={version.accentColor}
        glassIntensity={18}
        glassPadding={8}
        name={profile.name}
        size={120}
        source={profile.photoUrl}
      />

      {vis.has("name") && (
        <EditableText
          onSave={onNameSave}
          placeholder="Your Name"
          style={[
            styles.profileName,
            { color: colors.label },
            nameFonts[nameFont].fontFamily
              ? { fontFamily: nameFonts[nameFont].fontFamily }
              : undefined,
          ]}
          value={profile.name}
        />
      )}

      {(showWebsite || showJobTitle) ? (
        <View style={styles.identityLine}>
          {showWebsite ? (
            <Pressable
              onPress={() => {
                haptic.light();
                const url = profile.website!.startsWith("http")
                  ? profile.website!
                  : `https://${profile.website}`;
                Linking.openURL(url);
              }}
              style={styles.identityLink}
            >
              <Text style={styles.identityEmoji}>🗺</Text>
              <Text style={[styles.identityLinkText, { color: colors.link }]}>
                {profile.website!.replace(/^https?:\/\//, "")}
              </Text>
            </Pressable>
          ) : null}
          {showWebsite && showJobTitle ? (
            <Text style={[styles.identitySeparator, { color: colors.secondaryLabel }]}> | </Text>
          ) : null}
          {showJobTitle ? (
            <Text style={[styles.identityRole, { color: colors.label }]}>{profile.jobTitle}</Text>
          ) : null}
        </View>
      ) : null}

      {vis.has("headline") && (
        <EditableText
          multiline
          onSave={onHeadlineSave}
          placeholder="Set a status..."
          style={[styles.statusText, { color: colors.label }]}
          value={profile.headline}
          wrapperStyle={[styles.statusBox, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
        />
      )}

      <EditableTagList
        editing={tagsEditing}
        isDark={dark}
        onAdd={onTagAdd}
        onDelete={onTagDelete}
        onEditingChange={onTagsEditingChange}
        onRename={onTagRename}
        tags={tags}
      />

      {vis.has("email") && (
        <View style={styles.contactRow}>
          <View style={[styles.contactPill, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}>
            <Text style={styles.contactPillIcon}>✉</Text>
            <Text style={[styles.contactPillText, { color: colors.secondaryLabel }]}>
              {profile.email ?? "No contact set"}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statNumber, { color: colors.link }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}> connects </Text>
            <Text style={[styles.statNumber, { color: colors.link }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}> shares</Text>
          </View>
          <View style={[styles.statsSeparator, { backgroundColor: colors.separator }]} />
        </View>
      )}

      <Pressable
        onPress={() => {
          haptic.light();
          if (profile.url) {
            Linking.openURL(profile.url);
          }
        }}
        style={[styles.activityCard, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
      >
        <Text style={[styles.activityTitle, { color: colors.label }]}>LinkedIn Profile</Text>
        <View style={styles.activityRight}>
          <Text style={[styles.activityLink, { color: colors.link }]}>View</Text>
          <Text style={[styles.activityChevron, { color: colors.tertiaryLabel }]}>›</Text>
        </View>
      </Pressable>

      {profile.publications?.slice(0, 3).map((publication, index) => (
        <Pressable
          key={`pub-${index}`}
          onPress={() => {
            if (!publication.url) {
              return;
            }

            haptic.light();
            Linking.openURL(publication.url);
          }}
          style={[styles.publicationCard, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
        >
          <View style={styles.publicationContent}>
            <Text numberOfLines={1} style={[styles.publicationTitle, { color: colors.label }]}>
              {publication.title}
            </Text>
            {publication.publisher ? (
              <Text style={[styles.publicationMeta, { color: colors.secondaryLabel }]}>{publication.publisher}</Text>
            ) : null}
          </View>
          {publication.url ? (
            <View style={[styles.publicationVisit, dark && { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Text style={[styles.publicationVisitText, { color: dark ? "#F9FAFB" : colors.link }]}>Visit</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PlatformColor("secondarySystemGroupedBackground") as unknown as string,
    borderColor: PlatformColor("separator") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 20,
    marginTop: 8,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bannerWrap: {
    height: 200,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 0,
  },
  bannerImage: {
    height: "100%",
    width: "100%",
  },
  bannerBlur: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  bannerFade: {
    bottom: 0,
    height: 200,
    left: 0,
    position: "absolute",
    right: 0,
  },
  profileName: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 32,
    letterSpacing: 0.2,
  },
  identityLine: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  identityLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  identityEmoji: {
    fontSize: 15,
  },
  identityLinkText: {
    color: PlatformColor("systemBlue") as unknown as string,
    fontSize: 15,
    fontWeight: "600",
  },
  identitySeparator: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 15,
  },
  identityRole: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 15,
  },
  statusBox: {
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderColor: PlatformColor("separator") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 15,
    lineHeight: 20,
  },
  contactRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactPill: {
    alignItems: "center",
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderColor: PlatformColor("separator") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
  },
  contactPillIcon: {
    fontSize: 14,
  },
  contactPillText: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 13,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  statNumber: {
    color: PlatformColor("systemBlue") as unknown as string,
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 13,
  },
  statsSeparator: {
    backgroundColor: PlatformColor("separator") as unknown as string,
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 8,
  },
  activityCard: {
    alignItems: "center",
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderColor: PlatformColor("separator") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  activityTitle: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 15,
    fontWeight: "500",
  },
  activityRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  activityLink: {
    color: PlatformColor("systemBlue") as unknown as string,
    fontSize: 14,
    fontWeight: "600",
  },
  activityChevron: {
    color: PlatformColor("tertiaryLabel") as unknown as string,
    fontSize: 20,
    fontWeight: "300",
  },
  publicationCard: {
    alignItems: "center",
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderColor: PlatformColor("separator") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  publicationContent: {
    flex: 1,
    gap: 4,
  },
  publicationTitle: {
    color: PlatformColor("label") as unknown as string,
    fontSize: 15,
    fontWeight: "600",
  },
  publicationMeta: {
    color: PlatformColor("secondaryLabel") as unknown as string,
    fontSize: 13,
  },
  publicationVisit: {
    backgroundColor: PlatformColor("secondarySystemGroupedBackground") as unknown as string,
    borderCurve: "continuous" as any,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  publicationVisitText: {
    color: PlatformColor("systemBlue") as unknown as string,
    fontSize: 13,
    fontWeight: "600",
  },
});
