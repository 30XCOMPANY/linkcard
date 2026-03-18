/**
 * [INPUT]: react-native Image/Linking/Pressable/StyleSheet/Text/View/PlatformColor,
 *          expo-linear-gradient, expo-blur, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/name-fonts, @/src/lib/card-presets,
 *          @/src/lib/social-icon SocialIcon, @/src/types LinkedInProfile/CardTag/CardVersion,
 *          screens/home editable-text/editable-tag-list
 * [OUTPUT]: ProfileCardEditor — editable home hero card body with banner, inline text, tags, and links
 * [POS]: screens/home presentation layer rendering the editable card body without owning global state
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

import { EditableTagList } from "@/src/screens/home/editable-tag-list";
import { EditableText } from "@/src/screens/home/editable-text";

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
    label: dark ? "#F9FAFB" : platformColor("label"),
    secondaryLabel: dark ? "rgba(255,255,255,0.60)" : platformColor("secondaryLabel"),
    tertiaryLabel: dark ? "rgba(255,255,255,0.40)" : platformColor("tertiaryLabel"),
    pillBg: dark ? "rgba(255,255,255,0.10)" : platformColor("systemBackground"),
    pillBorder: dark ? "rgba(255,255,255,0.12)" : platformColor("separator"),
    link: version.accentColor,
    separator: dark ? "rgba(255,255,255,0.10)" : platformColor("separator"),
  };

  const nameWeightMap = { regular: "400", medium: "500", bold: "700" } as const;
  const nameWeight =
    nameWeightMap[(version.fieldStyles?.name?.fontWeight as keyof typeof nameWeightMap)] ?? "400";

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

      <Pressable onPress={onAvatarPress} style={{ zIndex: 1 }}>
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
          wrapperStyle={[
            styles.statusBox,
            { backgroundColor: colors.pillBg, borderColor: colors.pillBorder },
          ]}
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
          <View
            style={[
              styles.contactPill,
              { backgroundColor: colors.pillBg, borderColor: colors.pillBorder },
            ]}
          >
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

      <View style={styles.socialRow}>
        {(profile.socialLinks && profile.socialLinks.length > 0
          ? profile.socialLinks
          : profile.url
            ? [{ platform: "linkedin" as const, url: profile.url }]
            : []
        ).map((link) => (
          <Pressable
            key={link.platform}
            style={[
              styles.socialIcon,
              { backgroundColor: colors.pillBg, borderColor: colors.pillBorder },
            ]}
            onPress={() => {
              if (!link.url) return;
              haptic.light();
              const url = link.url.startsWith("http") ? link.url : `https://${link.url}`;
              Linking.openURL(url);
            }}
          >
            <SocialIcon
              color={colors.label}
              platform={link.platform}
              size={20}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderCurve: "continuous" as any,
    borderRadius: 32,
    overflow: "hidden",
    paddingBottom: 28,
  },
  bannerWrap: {
    height: 220,
    overflow: "hidden",
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    height: 220,
    width: "100%",
  },
  bannerBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerFade: {
    ...StyleSheet.absoluteFillObject,
  },
  profileName: {
    fontSize: 38,
    lineHeight: 46,
    marginHorizontal: 24,
    marginTop: 12,
  },
  identityLine: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginHorizontal: 24,
    marginTop: 8,
  },
  identityEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  identityLinkText: {
    fontSize: 17,
    fontWeight: "600",
  },
  identitySeparator: {
    fontSize: 17,
    marginHorizontal: 4,
  },
  identityRole: {
    fontSize: 17,
  },
  statusBox: {
    borderCurve: "continuous" as any,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 24,
    marginTop: 20,
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  statusText: {
    fontSize: 18,
    lineHeight: 24,
  },
  contactRow: {
    marginHorizontal: 24,
    marginTop: 22,
  },
  contactPill: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 16,
  },
  contactPillIcon: {
    fontSize: 16,
  },
  contactPillText: {
    flex: 1,
    fontSize: 16,
  },
  statsRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 18,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 16,
  },
  statsSeparator: {
    height: StyleSheet.hairlineWidth,
    marginTop: 16,
    width: "100%",
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 24,
    marginTop: 18,
  },
  socialIcon: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
