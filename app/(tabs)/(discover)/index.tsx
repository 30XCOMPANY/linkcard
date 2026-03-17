/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView/Dimensions,
 *          expo-router Stack/useRouter, react-native-reanimated,
 *          react-native-gesture-handler Gesture/GestureDetector,
 *          @/src/stores/contactsStore, @/src/components/card/profile-card ProfileCard,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics, @/src/lib/springs, @/src/lib/icons Icon,
 *          @/src/lib/contact-actions, @/src/types CardVersion
 * [OUTPUT]: DiscoverScreen — discover feed with swipe gestures and card browsing
 * [POS]: Discover tab main screen — Tinder-style swipe + Next/Say Hi buttons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useContactsStore } from "@/src/stores/contactsStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import type { CardVersion, DiscoverProfile } from "@/src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

// ── Synthesize CardVersion from DiscoverProfile fields ───────────
function toCardVersion(p: DiscoverProfile): CardVersion {
  return {
    id: "discover-preview",
    name: "Discover",
    visibleFields: p.visibleFields,
    template: p.template,
    accentColor: p.accentColor,
    background: p.background,
    isDefault: false,
  };
}

export default function DiscoverScreen() {
  const router = useRouter();
  const batch = useContactsStore((s) => s.discoverBatch);
  const index = useContactsStore((s) => s.discoverIndex);
  const status = useContactsStore((s) => s.discoverStatus);
  const refreshesUsed = useContactsStore((s) => s.refreshesUsed);
  const nextCard = useContactsStore((s) => s.nextCard);
  const prevCard = useContactsStore((s) => s.prevCard);
  const refreshBatch = useContactsStore((s) => s.refreshBatch);
  const saveContact = useContactsStore((s) => s.saveContact);
  const resetDaily = useContactsStore((s) => s.resetDailyIfNeeded);
  const removeContact = useContactsStore((s) => s.removeContact);

  const current = index < batch.length ? batch[index] : null;

  const saved = useContactsStore((s) =>
    current ? s.savedContacts.some((c) => c.id === current.id) : false
  );

  useEffect(() => {
    resetDaily();
  }, [resetDaily]);

  useEffect(() => {
    if (
      batch.length === 0 &&
      status === "batch_exhausted" &&
      refreshesUsed < 5
    ) {
      refreshBatch();
    }
  }, [batch.length, status, refreshesUsed, refreshBatch]);

  // ── Swipe gesture ──────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const directionRef = useRef<"left" | "right" | null>(null);

  const onSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      if (direction === "left") {
        haptic.selection();
        nextCard();
      } else {
        haptic.selection();
        prevCard();
      }
      // Reset position after state update
      translateX.value = 0;
    },
    [nextCard, prevCard, translateX]
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → next card
        translateX.value = withSpring(
          -SCREEN_WIDTH,
          SPRING_CONFIG,
          () => {
            runOnJS(onSwipeComplete)("left");
          }
        );
      } else if (e.translationX > SWIPE_THRESHOLD && index > 0) {
        // Swipe right → prev card
        translateX.value = withSpring(
          SCREEN_WIDTH,
          SPRING_CONFIG,
          () => {
            runOnJS(onSwipeComplete)("right");
          }
        );
      } else {
        // Snap back
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-8, 0, 8]
        )}deg`,
      },
    ],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH],
      [1, 0.5]
    ),
  }));

  // Reset translateX when index changes
  useEffect(() => {
    translateX.value = 0;
  }, [index, translateX]);

  const handleNext = useCallback(() => {
    haptic.selection();
    translateX.value = withSpring(
      -SCREEN_WIDTH,
      SPRING_CONFIG,
      () => {
        runOnJS(onSwipeComplete)("left");
      }
    );
  }, [translateX, onSwipeComplete]);

  const handleSayHi = useCallback(() => {
    if (!current) return;
    haptic.medium();
    executeContactAction(current.contactAction, current.profile.url);
  }, [current]);

  const handleSave = useCallback(() => {
    if (!current) return;
    if (saved) {
      haptic.light();
      removeContact(current.id);
    } else {
      haptic.success();
      saveContact(current);
    }
  }, [current, saved, saveContact, removeContact]);

  const handleRefresh = useCallback(() => {
    haptic.medium();
    refreshBatch();
  }, [refreshBatch]);

  const remainingRefreshes = 5 - refreshesUsed;

  return (
    <>
      {/* ── Header toolbar ──────────────────────────────────── */}
      <Stack.Screen options={{ title: "Discover", headerLargeTitle: true }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View>
          <Pressable
            onPress={() => {
              haptic.light();
              router.push("/(discover)/collection" as any);
            }}
            style={styles.toolbarBtn}
          >
            <Icon web="wallet" size={20} color={PlatformColor("label") as unknown as string} />
          </Pressable>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.View>
          <Text style={styles.refreshBadge}>{remainingRefreshes} left</Text>
        </Stack.Toolbar.View>
      </Stack.Toolbar>

      {/* ── Body ────────────────────────────────────────────── */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {status === "browsing" && current ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cardWrap, cardAnimatedStyle]}>
              <ProfileCard
                profile={current.profile}
                version={toCardVersion(current)}
              />
              {/* Bookmark — glass chip overlaid on card top-right */}
              <Pressable style={styles.bookmarkBtn} onPress={handleSave}>
                <AdaptiveGlass
                  style={styles.bookmarkGlass}
                  glassEffectStyle="regular"
                  intensity={50}
                  blurTint="light"
                  fallbackColor="rgba(255,255,255,0.75)"
                >
                  <Icon
                    web="bookmark"
                    size={18}
                    color={saved ? "#FF9500" : "#FFFFFF"}
                  />
                </AdaptiveGlass>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        ) : status === "batch_exhausted" ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {remainingRefreshes > 0
                ? "Batch complete!"
                : "All done for today"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {remainingRefreshes > 0
                ? `${remainingRefreshes} refresh${remainingRefreshes === 1 ? "" : "es"} remaining`
                : "Come back tomorrow for more profiles"}
            </Text>
            {remainingRefreshes > 0 ? (
              <Pressable
                style={styles.refreshBtn}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshBtnLabel}>Refresh</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Come back tomorrow</Text>
            <Text style={styles.emptySubtitle}>
              You've used all 5 refreshes for today
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Floating action chips — liquid glass ─────────────── */}
      {status === "browsing" && current ? (
        <View style={styles.floatingBar}>
          <Pressable
            onPress={handleNext}
            style={styles.glassChipWrap}
          >
            <AdaptiveGlass
              style={styles.glassChip}
              glassEffectStyle="regular"
              intensity={50}
              blurTint="light"
              fallbackColor="rgba(245,245,247,0.88)"
            >
              <Text style={styles.glassChipLabel}>Next</Text>
            </AdaptiveGlass>
          </Pressable>
          <View style={styles.btnSpacer} />
          <Pressable
            onPress={handleSayHi}
            style={styles.glassChipWrap}
          >
            <AdaptiveGlass
              style={styles.glassChipPrimary}
              glassEffectStyle="regular"
              tintColor="#007AFFA0"
              intensity={50}
              blurTint="dark"
              fallbackColor="rgba(0,122,255,0.85)"
            >
              <Text style={styles.glassChipPrimaryLabel}>
                {current.contactAction?.label ?? "Say Hi"}
              </Text>
            </AdaptiveGlass>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  floatingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  glassChipWrap: {
    flex: 1,
  },
  glassChip: {
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  glassChipLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: PlatformColor("label") as unknown as string,
  },
  glassChipPrimary: {
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  glassChipPrimaryLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  toolbarBtn: {
    minHeight: 32,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBadge: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
  cardWrap: {
    position: "relative",
  },
  bookmarkBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  bookmarkGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderCurve: "continuous" as any,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSpacer: { width: 12 },
  refreshBtn: {
    marginTop: 24,
    width: 200,
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBlue") as unknown as string,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  refreshBtnLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: PlatformColor("label") as unknown as string,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("secondaryLabel") as unknown as string,
    textAlign: "center",
  },
});
