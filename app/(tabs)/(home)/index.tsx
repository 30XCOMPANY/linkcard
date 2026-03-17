/**
 * [INPUT]: react-native ScrollView/View/Text/Pressable/PlatformColor/Linking/StyleSheet,
 *          expo-router Stack, expo-blur BlurView, expo-glass-effect GlassView,
 *          @/src/stores/cardStore, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/profile-tags
 * [OUTPUT]: ProfileScreen — Bonjour!-style profile card with glass-ring avatar and native menu version picker
 * [POS]: Primary tab screen — vertical profile card, version switching via header menu
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  PlatformColor,
  Linking,
  Alert,
} from "react-native";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

import { useCardStore } from "@/src/stores/cardStore";
import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import { deriveProfileTags } from "@/src/lib/profile-tags";
import { nameFonts, type NameFontKey } from "@/src/lib/name-fonts";
import type { CardVersion, LinkedInProfile } from "@/src/types";

const useGlass = isGlassEffectAPIAvailable();

/* ------------------------------------------------------------------ */
/*  Editable Text — tap to inline edit, blur to save                   */
/* ------------------------------------------------------------------ */

function EditableText({
  value,
  style,
  wrapperStyle,
  placeholder,
  multiline,
  onSave,
}: {
  value: string;
  style: any;
  wrapperStyle?: any;
  placeholder: string;
  multiline?: boolean;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <View style={wrapperStyle}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={() => {
            setEditing(false);
            if (draft.trim() && draft !== value) {
              onSave(draft.trim());
              haptic.success();
            } else {
              setDraft(value);
            }
          }}
          autoFocus
          multiline={multiline}
          style={[style, { padding: 0, margin: 0 }]}
          placeholder={placeholder}
          placeholderTextColor={PlatformColor("tertiaryLabel") as unknown as string}
          returnKeyType={multiline ? "default" : "done"}
          blurOnSubmit={!multiline}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        setDraft(value);
        setEditing(true);
      }}
    >
      <View style={wrapperStyle}>
        {value ? (
          <Text style={style}>{value}</Text>
        ) : (
          <Text style={[style, { color: PlatformColor("tertiaryLabel") as unknown as string }]}>
            {placeholder}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Editable Tag Pill                                                  */
/* ------------------------------------------------------------------ */

function EditableTag({
  emoji,
  label,
  editing,
  onLongPress,
  onDelete,
  onRename,
}: {
  emoji: string;
  label: string;
  editing: boolean;
  onLongPress: () => void;
  onDelete: () => void;
  onRename: (newLabel: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(label);

  return (
    <Animated.View
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(250)}
    >
      <Pressable
        onLongPress={onLongPress}
        onPress={() => {
          if (editing && !renaming) {
            haptic.light();
            setDraft(label);
            setRenaming(true);
          }
        }}
      >
        <View style={s.tag}>
          <Text style={s.tagEmoji}>{emoji}</Text>
          {renaming ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={() => {
                setRenaming(false);
                if (draft.trim() && draft !== label) {
                  onRename(draft.trim());
                }
              }}
              autoFocus
              style={[s.tagLabel, { padding: 0, margin: 0, minWidth: 40 }]}
              returnKeyType="done"
            />
          ) : (
            <Text style={s.tagLabel}>{label}</Text>
          )}
          {editing && !renaming && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
              <Pressable hitSlop={8} onPress={onDelete}>
                <SymbolView
                  name="xmark.circle.fill"
                  tintColor={PlatformColor("systemGray3") as unknown as string}
                  style={{ width: 16, height: 16, marginLeft: 4 }}
                  resizeMode="scaleAspectFit"
                />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
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
  onFontCycle,
  onCreateVersion,
  onSync,
}: {
  versions: CardVersion[];
  currentVersion: CardVersion;
  profile: LinkedInProfile;
  onSelectVersion: (id: string) => void;
  onEdit: () => void;
  onFontCycle: () => void;
  onCreateVersion: () => void;
  onSync: () => void;
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
              onPress={() => {
                haptic.light();
                onFontCycle();
              }}
            >
              Change Font
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              icon="plus.rectangle"
              onPress={() => {
                haptic.medium();
                onCreateVersion();
              }}
            >
              Create New Card
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="arrow.triangle.2.circlepath"
              onPress={() => {
                haptic.light();
                onSync();
              }}
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

  const [tagsEditing, setTagsEditing] = useState(false);

  const handleSelectVersion = useCallback((id: string) => {
    setSelectedVersionId(id);
  }, []);

  // Cycle through fonts: classic → modern → mono → system → classic
  const handleFontCycle = useCallback(() => {
    const keys: NameFontKey[] = ["classic", "modern", "mono", "system"];
    const current = keys.indexOf(nameFont);
    const next = keys[(current + 1) % keys.length];
    useCardStore.getState().setNameFont(next);
  }, [nameFont]);

  // Create a new version with a unique name
  const handleCreateVersion = useCallback(() => {
    if (!card) return;
    const count = card.versions.length + 1;
    const newVersion: CardVersion = {
      id: `v-${Date.now()}`,
      name: `Card ${count}`,
      visibleFields: ["photoUrl", "name", "jobTitle", "headline", "company", "location", "qrCode"],
      template: "modern",
      accentColor: "#007AFF",
      isDefault: false,
    };
    useCardStore.getState().addVersion(newVersion);
    setSelectedVersionId(newVersion.id);
  }, [card]);

  // Sync LinkedIn profile
  const handleSync = useCallback(() => {
    Alert.alert("Syncing", "Refreshing your LinkedIn data...");
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
        onFontCycle={handleFontCycle}
        onCreateVersion={handleCreateVersion}
        onSync={handleSync}
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
            {/* Progressive blur — 8 layers for seamless gradient blur */}
            <BlurView intensity={15}  tint="default" style={[s.bannerBlur, { top: "30%", opacity: 0.15 }]} />
            <BlurView intensity={30}  tint="default" style={[s.bannerBlur, { top: "38%", opacity: 0.25 }]} />
            <BlurView intensity={50}  tint="default" style={[s.bannerBlur, { top: "46%", opacity: 0.35 }]} />
            <BlurView intensity={70}  tint="default" style={[s.bannerBlur, { top: "54%", opacity: 0.50 }]} />
            <BlurView intensity={85}  tint="default" style={[s.bannerBlur, { top: "62%", opacity: 0.65 }]} />
            <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "70%", opacity: 0.80 }]} />
            <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "78%", opacity: 0.90 }]} />
            <BlurView intensity={100} tint="default" style={[s.bannerBlur, { top: "86%", opacity: 1.0  }]} />
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
            glassPadding={8}
            glassIntensity={18}
            accentColor={accent}
          />
          <EditableText
            value={profile.name}
            style={[s.profileName, nameFonts[nameFont].fontFamily ? { fontFamily: nameFonts[nameFont].fontFamily } : undefined]}
            onSave={(v) => useCardStore.getState().updateProfile({ name: v })}
            placeholder="Your Name"
          />

          {/* Identity Line — below name */}
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

          {/* Headline — tap to edit */}
          <EditableText
            value={profile.headline}
            style={s.statusText}
            wrapperStyle={s.statusBox}
            onSave={(v) => useCardStore.getState().updateProfile({ headline: v })}
            placeholder="Set a status..."
            multiline
          />

          {/* Tags — long press to edit, tap to rename in edit mode */}
          <Animated.View style={s.tagsWrap} layout={LinearTransition.duration(250)}>
            {tags.map((t, i) => (
              <EditableTag
                key={`${t.label}-${i}`}
                emoji={t.emoji}
                label={t.label}
                editing={tagsEditing}
                onLongPress={() => {
                  haptic.medium();
                  setTagsEditing(true);
                }}
                onDelete={() => {
                  haptic.warning();
                  // TODO: remove tag
                }}
                onRename={(newLabel: string) => {
                  haptic.success();
                  // TODO: persist renamed tag
                }}
              />
            ))}
            {/* "+" add tag */}
            <Animated.View layout={LinearTransition.duration(250)}>
              <Pressable
                onPress={() => {
                  haptic.light();
                  Alert.prompt(
                    "Add Tag",
                    "Enter a tag (e.g. 💡 Swift)",
                    (text: string) => {
                      if (text?.trim()) {
                        haptic.success();
                        // TODO: persist custom tags
                      }
                    }
                  );
                }}
              >
                <View style={s.addTagPill}>
                  <SymbolView
                    name="plus"
                    tintColor={PlatformColor("secondaryLabel") as unknown as string}
                    style={{ width: 14, height: 14 }}
                    resizeMode="scaleAspectFit"
                  />
                </View>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Done editing tags */}
          {tagsEditing && (
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)}>
              <Pressable
                onPress={() => {
                  haptic.light();
                  setTagsEditing(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Done editing tags"
                hitSlop={6}
                style={({ pressed }) => [s.doneBtn, pressed ? s.doneBtnPressed : null]}
              >
                {useGlass ? (
                  <GlassView
                    glassEffectStyle="regular"
                    tintColor={PlatformColor("systemBlue") as unknown as string}
                    style={s.doneBtnSurface}
                  >
                    <Text style={s.doneBtnText}>Done</Text>
                  </GlassView>
                ) : (
                  <View style={[s.doneBtnSurface, s.doneBtnFallback]}>
                    <Text style={s.doneBtnText}>Done</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
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
  addTagPill: {
    height: 36,
    width: 36,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBackground") as unknown as string,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator") as unknown as string,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderCurve: "continuous" as any,
  },
  doneBtnSurface: {
    minHeight: 38,
    minWidth: 74,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden" as any,
  },
  doneBtnFallback: {
    backgroundColor: PlatformColor("systemBlue") as unknown as string,
  },
  doneBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
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
