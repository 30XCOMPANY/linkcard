/**
 * [INPUT]: react-native ScrollView/View/Text/Pressable/PlatformColor/Linking/StyleSheet,
 *          expo-router Stack,
 *          @/src/stores/cardStore, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/profile-tags
 * [OUTPUT]: ProfileScreen — Bonjour!-style profile card with native menu version picker
 * [POS]: Primary tab screen — vertical profile card, version switching via header menu
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  PlatformColor,
  Linking,
} from "react-native";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";

import { useCardStore } from "@/src/stores/cardStore";
import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import { deriveProfileTags } from "@/src/lib/profile-tags";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import type { CardVersion, LinkedInProfile } from "@/src/types";

/* ------------------------------------------------------------------ */
/*  Tag Pill                                                           */
/* ------------------------------------------------------------------ */

function TagPill({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagEmoji}>{emoji}</Text>
      <Text style={s.tagLabel}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Native Header                                                      */
/* ------------------------------------------------------------------ */

function ProfileHeader({
  versions,
  currentVersion,
  profile,
  onSelectVersion,
  onEdit,
}: {
  versions: CardVersion[];
  currentVersion: CardVersion;
  profile: LinkedInProfile;
  onSelectVersion: (id: string) => void;
  onEdit: () => void;
}) {
  return (
    <>
      <Stack.Screen.Title large>{currentVersion.name}</Stack.Screen.Title>

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu icon="chevron.up.chevron.down" elementSize="small">
          <Stack.Toolbar.Menu inline title="Switch Card">
            {versions.map((v: CardVersion) => (
              <Stack.Toolbar.MenuAction
                key={v.id}
                isOn={v.id === currentVersion.id}
                onPress={() => {
                  haptic.selection();
                  onSelectVersion(v.id);
                }}
              >
                {v.name}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.MenuAction
            icon="plus"
            onPress={() => haptic.medium()}
          >
            Create New Card
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              icon="pencil"
              onPress={() => {
                haptic.light();
                onEdit();
              }}
            >
              Edit Card
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="textformat"
              onPress={() => haptic.light()}
            >
              Change Font
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              icon="plus.rectangle"
              onPress={() => haptic.medium()}
            >
              Create New Card
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="arrow.triangle.2.circlepath"
              onPress={() => haptic.light()}
            >
              Sync LinkedIn
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.View>
          <View style={{ width: 32, height: 32 }}>
            <Avatar
              source={profile.photoUrl}
              name={profile.name}
              size={32}
            />
          </View>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Screen                                                        */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const router = useRouter();
  const card = useCardStore((s: any) => s.card);
  const nameFont: NameFontKey = useCardStore((s: any) => s.nameFont) ?? "classic";

  const defaultVersion =
    card?.versions.find((v: CardVersion) => v.isDefault) ?? card?.versions[0];
  const [selectedVersionId, setSelectedVersionId] = useState(
    defaultVersion?.id ?? ""
  );

  const currentVersion =
    card?.versions.find((v: CardVersion) => v.id === selectedVersionId) ??
    defaultVersion;

  const handleSelectVersion = useCallback((id: string) => {
    setSelectedVersionId(id);
  }, []);

  if (!card || !currentVersion) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>
          No card yet. Complete onboarding to get started.
        </Text>
      </View>
    );
  }

  const { profile } = card;
  const tags = deriveProfileTags(profile);
  const accent = currentVersion.accentColor;

  return (
    <>
      <ProfileHeader
        versions={card.versions}
        currentVersion={currentVersion}
        profile={profile}
        onSelectVersion={handleSelectVersion}
        onEdit={() => router.push("/editor" as any)}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={s.card}>
          {/* Banner Image — absolute, tap to change */}
          <Pressable
            style={s.bannerWrap}
            onPress={async () => {
              haptic.light();
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                useCardStore.getState().updateProfile({
                  bannerUrl: result.assets[0].uri,
                } as any);
              }
            }}
          >
            <Image
              source={
                (profile as any).bannerUrl
                  ? { uri: (profile as any).bannerUrl }
                  : require("@/assets/default-banner.jpg")
              }
              style={s.bannerImage}
              resizeMode="cover"
            />
            {/* Progressive blur — 4 stacked BlurViews with increasing opacity */}
            <BlurView intensity={20} tint="default" style={[s.bannerBlur, { top: "40%", opacity: 0.3 }]} />
            <BlurView intensity={40} tint="default" style={[s.bannerBlur, { top: "55%", opacity: 0.5 }]} />
            <BlurView intensity={60} tint="default" style={[s.bannerBlur, { top: "70%", opacity: 0.7 }]} />
            <BlurView intensity={80} tint="default" style={[s.bannerBlur, { top: "85%", opacity: 1 }]} />
            {/* White fade on top of blur */}
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)", "rgba(255,255,255,1)"]}
              locations={[0, 0.4, 0.7, 1]}
              style={s.bannerFade}
            />
          </Pressable>

          {/* Avatar + Name */}
          <Avatar
            source={profile.photoUrl}
            name={profile.name}
            size={120}
            accentColor={accent}
          />
          <Text style={[s.profileName, nameFonts[nameFont].fontFamily ? { fontFamily: nameFonts[nameFont].fontFamily } : undefined]}>
            {profile.name}
          </Text>

          {/* Headline */}
          {profile.headline ? (
            <View style={s.statusBox}>
              <Text style={s.statusText} numberOfLines={2}>
                {profile.headline}
              </Text>
            </View>
          ) : (
            <View style={s.statusBox}>
              <Text style={s.statusPlaceholder}>Set a status...</Text>
            </View>
          )}

          {/* Identity Line */}
          {(profile.website || profile.jobTitle) && (
            <View style={s.identityLine}>
              {profile.website && (
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
                  <Text style={s.identityLinkText}>
                    {profile.website!.replace(/^https?:\/\//, "")}
                  </Text>
                </Pressable>
              )}
              {profile.website && profile.jobTitle && (
                <Text style={s.identitySep}> | </Text>
              )}
              {profile.jobTitle && (
                <Text style={s.identityRole}>{profile.jobTitle}</Text>
              )}
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={s.tagsWrap}>
              {tags.map((t, i) => (
                <TagPill key={`${t.label}-${i}`} emoji={t.emoji} label={t.label} />
              ))}
            </View>
          )}

          {/* Contact + Stats */}
          <View style={s.contactRow}>
            <View style={s.contactPill}>
              <Text style={s.contactPillIcon}>✉</Text>
              <Text style={s.contactPillText}>
                {profile.email ?? "No contact set"}
              </Text>
            </View>
            <View style={s.statsRow}>
              <Text style={s.statNum}>0</Text>
              <Text style={s.statLabel}> connects </Text>
              <Text style={s.statNum}>0</Text>
              <Text style={s.statLabel}> shares</Text>
            </View>
            <View style={s.statsSeparator} />
          </View>

          {/* LinkedIn Link */}
          <Pressable
            style={s.activityCard}
            onPress={() => {
              haptic.light();
              if (profile.url) Linking.openURL(profile.url);
            }}
          >
            <Text style={s.activityTitle}>LinkedIn Profile</Text>
            <View style={s.activityRight}>
              <Text style={s.activityLink}>View</Text>
              <Text style={s.activityChevron}>›</Text>
            </View>
          </Pressable>

          {/* Publications */}
          {profile.publications && profile.publications.length > 0 &&
            profile.publications.slice(0, 3).map(
              (pub: { title: string; publisher?: string; url?: string }, i: number) => (
                <Pressable
                  key={`pub-${i}`}
                  style={s.pubCard}
                  onPress={() => {
                    if (pub.url) {
                      haptic.light();
                      Linking.openURL(pub.url);
                    }
                  }}
                >
                  <View style={s.pubContent}>
                    <Text style={s.pubTitle} numberOfLines={1}>{pub.title}</Text>
                    {pub.publisher && <Text style={s.pubMeta}>{pub.publisher}</Text>}
                  </View>
                  {pub.url && (
                    <View style={s.pubVisit}>
                      <Text style={s.pubVisitText}>Visit</Text>
                    </View>
                  )}
                </Pressable>
              )
            )}
        </View>
      </ScrollView>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    color: PlatformColor("secondaryLabel"),
  },

  card: {
    backgroundColor: PlatformColor("secondarySystemGroupedBackground") as unknown as string,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
    marginTop: 8,
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
  bannerImage: {
    width: "100%",
    height: "100%",
  },
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
  identityLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
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

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
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

  activityCard: {
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
  activityTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: PlatformColor("label") as unknown as string,
  },
  activityRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityLink: {
    fontSize: 14,
    color: PlatformColor("systemBlue") as unknown as string,
    fontWeight: "600",
  },
  activityChevron: {
    fontSize: 20,
    color: PlatformColor("tertiaryLabel") as unknown as string,
    fontWeight: "300",
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
  pubContent: {
    flex: 1,
    marginRight: 12,
  },
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
  pubVisitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
