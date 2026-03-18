/**
 * [INPUT]: react-native Image/Linking/Pressable/StyleSheet/Text/View/PlatformColor,
 *          expo-linear-gradient, expo-blur, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/name-fonts, @/src/lib/card-presets,
 *          @/src/lib/social-icon SocialIcon,
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
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { Avatar } from "@/src/components/shared/avatar";
import { platformColor } from "@/src/lib/platform-color";
import { SocialIcon } from "@/src/lib/social-icon";
import { haptic } from "@/src/lib/haptics";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import { resolveCardBackground } from "@/src/lib/card-presets";
import type { CardTag, CardVersion, ContactAction, LinkedInProfile } from "@/src/types";

import { EditableTagList } from "./editable-tag-list";
import { EditableText } from "./editable-text";

interface ProfileCardEditorProps {
  contactAction?: ContactAction;
  nameFont: NameFontKey;
  onAvatarPress: () => void;
  onBannerPress: () => void;
  onFieldSave: (field: string, value: string) => void;
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
  onAvatarPress,
  onBannerPress,
  onFieldSave,
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
    label: dark ? "#F9FAFB" : (platformColor("label")),
    secondaryLabel: dark ? "rgba(255,255,255,0.60)" : (platformColor("secondaryLabel")),
    tertiaryLabel: dark ? "rgba(255,255,255,0.40)" : (platformColor("tertiaryLabel")),
    pillBg: dark ? "rgba(255,255,255,0.10)" : (platformColor("systemBackground")),
    pillBorder: dark ? "rgba(255,255,255,0.12)" : (platformColor("separator")),
    link: version.accentColor,
    separator: dark ? "rgba(255,255,255,0.10)" : (platformColor("separator")),
  };

  const nameWeightMap = { regular: "400", medium: "500", bold: "700" } as const;
  const nameWeight = nameWeightMap[(version.fieldStyles?.name?.fontWeight as keyof typeof nameWeightMap)] ?? "400";

  return (
    <View style={[styles.card, { backgroundColor: background.surface }]}>
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

      <Pressable onPress={onAvatarPress}>
        <Avatar
          accentColor={version.accentColor}
          glassIntensity={18}
          glassPadding={8}
          name={profile.name}
          size={120}
          source={profile.photoUrl}
        />
      </Pressable>

      {vis.has("name") && (
        <EditableText
          onSave={(v) => onFieldSave("name", v)}
          placeholder="Add your name"
          style={[
            styles.profileName,
            { color: colors.label, fontWeight: nameWeight as any },
            nameFonts[nameFont].fontFamily
              ? { fontFamily: nameFonts[nameFont].fontFamily }
              : undefined,
          ]}
          value={profile.name}
        />
      )}

      <View style={styles.identityLine}>
        {vis.has("website") && (
          <>
            <Text style={styles.identityEmoji}>🗺</Text>
            <EditableText
              onSave={(v) => onFieldSave("website", v)}
              placeholder="Add website"
              style={[styles.identityLinkText, { color: colors.link }]}
              value={profile.website?.replace(/^https?:\/\//, "") ?? ""}
            />
          </>
        )}
        {vis.has("website") && vis.has("jobTitle") && profile.website && profile.jobTitle ? (
          <Text style={[styles.identitySeparator, { color: colors.secondaryLabel }]}> | </Text>
        ) : null}
        {vis.has("jobTitle") && (
          <EditableText
            onSave={(v) => onFieldSave("jobTitle", v)}
            placeholder="Add title"
            style={[styles.identityRole, { color: colors.label }]}
            value={profile.jobTitle ?? ""}
          />
        )}
      </View>

      {vis.has("headline") && (
        <EditableText
          multiline
          onSave={(v) => onFieldSave("headline", v)}
          placeholder="What do you do?"
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
            <EditableText
              onSave={(v) => onFieldSave("email", v)}
              placeholder="Add email"
              style={[styles.contactPillText, { color: colors.secondaryLabel }]}
              value={profile.email ?? ""}
            />
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

      {/* Social icons — render from socialLinks, fallback to legacy profile.url */}
      <View style={styles.socialRow}>
        {(profile.socialLinks && profile.socialLinks.length > 0
          ? profile.socialLinks
          : profile.url
            ? [{ platform: "linkedin" as const, url: profile.url }]
            : []
        ).map((link) => (
          <Pressable
            key={link.platform}
            style={[styles.socialIcon, { backgroundColor: colors.pillBg, borderColor: colors.pillBorder }]}
            onPress={() => {
              if (!link.url) return;
              haptic.light();
              const url = link.url.startsWith("http") ? link.url : `https://${link.url}`;
              Linking.openURL(url);
            }}
          >
            <SocialIcon platform={link.platform} size={18} color={colors.link} />
          </Pressable>
        ))}
      </View>

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
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderColor: "rgba(255,255,255,0.40)",
    borderCurve: "continuous" as any,
    borderRadius: 24,
    borderWidth: 2,
    gap: 20,
    marginTop: 8,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bannerWrap: {
    height: 204,
    left: -2,
    position: "absolute",
    right: -2,
    top: -2,
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
    color: platformColor("label"),
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
    color: platformColor("systemBlue"),
    fontSize: 15,
    fontWeight: "600",
  },
  identitySeparator: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
  },
  identityRole: {
    color: platformColor("label"),
    fontSize: 15,
  },
  statusBox: {
    backgroundColor: platformColor("systemBackground"),
    borderColor: platformColor("separator"),
    borderCurve: "continuous" as any,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: {
    color: platformColor("label"),
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
    backgroundColor: platformColor("systemBackground"),
    borderColor: platformColor("separator"),
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
    color: platformColor("secondaryLabel"),
    fontSize: 13,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  statNumber: {
    color: platformColor("systemBlue"),
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
  },
  statsSeparator: {
    backgroundColor: platformColor("separator"),
    flex: 1,
    height: StyleSheet.hairlineWidth,
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
  publicationCard: {
    alignItems: "center",
    backgroundColor: platformColor("systemBackground"),
    borderColor: platformColor("separator"),
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
    color: platformColor("label"),
    fontSize: 15,
    fontWeight: "600",
  },
  publicationMeta: {
    color: platformColor("secondaryLabel"),
    fontSize: 13,
  },
  publicationVisit: {
    backgroundColor: platformColor("secondarySystemGroupedBackground"),
    borderCurve: "continuous" as any,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  publicationVisitText: {
    color: platformColor("systemBlue"),
    fontSize: 13,
    fontWeight: "600",
  },
});
