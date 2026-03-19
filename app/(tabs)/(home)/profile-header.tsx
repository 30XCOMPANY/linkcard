/**
 * [INPUT]: react-native View, expo-router Stack, @/src/components/shared/avatar Avatar,
 *          @/src/lib/haptics, @/src/lib/theme, @/src/types CardVersion/LinkedInProfile
 * [OUTPUT]: HomeProfileHeader — native navigation header for version switching and lightweight utilities
 * [POS]: (home) 模块导航壳，隔离 toolbar 菜单与路由页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router/stack";

import { Avatar } from "@/src/components/shared/avatar";
import { haptic } from "@/src/lib/haptics";
import { useResolvedTheme } from "@/src/lib/theme";
import type { CardVersion, LinkedInProfile } from "@/src/types";

interface HomeProfileHeaderProps {
  currentVersion: CardVersion;
  onCreateVersion: () => void;
  onEdit: () => void;
  onFontCycle: () => void;
  onSelectVersion: (id: string) => void;
  onSync: () => void;
  profile: LinkedInProfile;
  versions: CardVersion[];
}

export function HomeProfileHeader({
  currentVersion,
  onCreateVersion,
  onEdit,
  onFontCycle,
  onSelectVersion,
  onSync,
  profile,
  versions,
}: HomeProfileHeaderProps) {
  const resolvedTheme = useResolvedTheme();
  const titleColor = resolvedTheme === "dark" ? "#F8FAFC" : "#0F172A";

  return (
    <>
      <Stack.Screen.Title
        large
        largeStyle={{ fontFamily: "GoudyBookletter1911_400Regular", color: titleColor }}
      >
        My Card
      </Stack.Screen.Title>

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu icon="chevron.up.chevron.down" elementSize="small">
          <Stack.Toolbar.Menu inline title="Switch Card">
            {versions.map((version) => (
              <Stack.Toolbar.MenuAction
                isOn={version.id === currentVersion.id}
                key={version.id}
                onPress={() => {
                  haptic.selection();
                  onSelectVersion(version.id);
                }}
              >
                {version.name}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.MenuAction
            icon="plus"
            onPress={() => {
              haptic.medium();
              onCreateVersion();
            }}
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
        <Stack.Toolbar.View>
          <Pressable
            onPress={() => {
              haptic.light();
              router.push("/(settings)/account" as any);
            }}
          >
            <View style={styles.avatarWrap}>
              <Avatar name={profile.name} size={32} source={profile.photoUrl} />
            </View>
          </Pressable>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
    </>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    height: 32,
    width: 32,
  },
});
