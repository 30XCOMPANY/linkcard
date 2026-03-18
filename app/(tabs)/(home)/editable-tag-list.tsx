/**
 * [INPUT]: react, react-native Alert/Pressable/Text/TextInput/View/PlatformColor/StyleSheet,
 *          react-native-reanimated, expo-symbols SymbolView, @/src/lib/haptics, @/src/types CardTag
 * [OUTPUT]: EditableTagList — animated tag row with rename/delete/add interactions
 * [POS]: (home) 模块 tag 编辑器，隔离 chip 交互与动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SymbolView } from "expo-symbols";

import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { platformColor } from "@/src/lib/platform-color";
import { haptic } from "@/src/lib/haptics";
import type { CardTag } from "@/src/types";

interface EditableTagItemProps {
  tag: CardTag;
  editing: boolean;
  isDark?: boolean;
  onDelete: (id: string) => void;
  onEditingChange: (editing: boolean) => void;
  onRename: (id: string, label: string) => void;
}

function EditableTagItem({
  tag,
  editing,
  isDark,
  onDelete,
  onEditingChange,
  onRename,
}: EditableTagItemProps) {
  const darkTag = isDark ? { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.12)" } : undefined;
  const darkLabel = isDark ? { color: "#F9FAFB" } : undefined;
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(tag.label);

  useEffect(() => {
    if (!renaming) {
      setDraft(tag.label);
    }
  }, [renaming, tag.label]);

  return (
    <Animated.View
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(250)}
    >
      <Pressable
        onLongPress={() => {
          haptic.medium();
          onEditingChange(true);
        }}
        onPress={() => {
          if (!editing || renaming) {
            return;
          }

          haptic.light();
          setDraft(tag.label);
          setRenaming(true);
        }}
      >
        <View style={[styles.tag, darkTag]}>
          <Text style={styles.tagEmoji}>{tag.emoji}</Text>
          {renaming ? (
            <TextInput
              autoFocus
              onBlur={() => {
                const nextLabel = draft.trim();
                setRenaming(false);

                if (nextLabel && nextLabel !== tag.label) {
                  onRename(tag.id, nextLabel);
                }
              }}
              onChangeText={setDraft}
              returnKeyType="done"
              style={[styles.tagLabel, styles.tagInput, darkLabel]}
              value={draft}
            />
          ) : (
            <Text style={[styles.tagLabel, darkLabel]}>{tag.label}</Text>
          )}
          {editing && !renaming ? (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
            >
              <Pressable hitSlop={8} onPress={() => onDelete(tag.id)}>
                <SymbolView
                  name="xmark.circle.fill"
                  resizeMode="scaleAspectFit"
                  style={styles.tagDelete}
                  tintColor={platformColor("systemGray3")}
                />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface EditableTagListProps {
  editing: boolean;
  isDark?: boolean;
  tags: CardTag[];
  onAdd: (input: string) => void;
  onDelete: (id: string) => void;
  onEditingChange: (editing: boolean) => void;
  onRename: (id: string, label: string) => void;
}

export function EditableTagList({
  editing,
  isDark,
  tags,
  onAdd,
  onDelete,
  onEditingChange,
  onRename,
}: EditableTagListProps) {
  return (
    <>
      <Animated.View style={styles.tagsWrap} layout={LinearTransition.duration(250)}>
        {tags.map((tag) => (
          <EditableTagItem
            key={tag.id}
            editing={editing}
            isDark={isDark}
            onDelete={onDelete}
            onEditingChange={onEditingChange}
            onRename={onRename}
            tag={tag}
          />
        ))}
        <Animated.View layout={LinearTransition.duration(250)}>
          <Pressable
            onPress={() => {
              haptic.light();
              Alert.prompt(
                "Add Tag",
                "Enter a tag (e.g. 💡 Swift)",
                (text?: string) => {
                  if (!text?.trim()) {
                    return;
                  }

                  onAdd(text);
                }
              );
            }}
          >
            <View style={[styles.addTagPill, isDark && { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.12)" }]}>
              <SymbolView
                name="plus"
                resizeMode="scaleAspectFit"
                style={styles.addTagIcon}
                tintColor={isDark ? "rgba(255,255,255,0.60)" : (platformColor("secondaryLabel"))}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {editing ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
        >
          <Pressable
            accessibilityLabel="Done editing tags"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => {
              haptic.light();
              onEditingChange(false);
            }}
            style={({ pressed }) => [
              pressed ? { transform: [{ scale: 0.96 }] } : null,
            ]}
          >
            <AdaptiveGlass
              style={styles.doneButton}
              glassEffectStyle="regular"
              tintColor="#007AFFCC"
              intensity={60}
              blurTint="default"
              fallbackColor="#007AFF"
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </AdaptiveGlass>
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
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
  tagEmoji: {
    fontSize: 14,
  },
  tagLabel: {
    color: platformColor("label"),
    fontSize: 14,
    fontWeight: "500",
  },
  tagInput: {
    margin: 0,
    minWidth: 40,
    padding: 0,
  },
  tagDelete: {
    height: 16,
    marginLeft: 4,
    width: 16,
  },
  addTagPill: {
    alignItems: "center",
    backgroundColor: platformColor("systemBackground"),
    borderColor: platformColor("separator"),
    borderCurve: "continuous" as any,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  addTagIcon: {
    height: 14,
    width: 14,
  },
  doneButton: {
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    borderCurve: "continuous" as any,
    borderRadius: 999,
    justifyContent: "center" as const,
    minHeight: 38,
    minWidth: 74,
    overflow: "hidden" as any,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
});
