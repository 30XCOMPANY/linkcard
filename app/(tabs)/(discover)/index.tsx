/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView/Dimensions,
 *          expo-router Stack/useRouter, react-native-reanimated,
 *          react-native-gesture-handler Gesture/GestureDetector,
 *          @/src/stores/contactsStore, @/src/components/card/profile-card ProfileCard,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics, @/src/lib/icons Icon,
 *          @/src/lib/contact-actions, @/src/types CardVersion
 * [OUTPUT]: DiscoverScreen — discover feed with swipe gestures and card browsing
 * [POS]: Discover tab main screen — Tinder-style swipe + Next/Say Hi buttons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useContactsStore } from "@/src/stores/contactsStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { Icon } from "@/src/lib/icons";
import type { CardVersion, DiscoverProfile } from "@/src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

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
    if (batch.length === 0) refreshBatch();
  }, [batch.length, refreshBatch]);

  // ── Swipe state ────────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const [shownLoopAlert, setShownLoopAlert] = useState(false);

  // Track swipe direction for enter animation
  const lastSwipeDir = useRef<"left" | "right">("left");

  const doSwipe = useCallback(
    (direction: "left" | "right") => {
      lastSwipeDir.current = direction;
      haptic.selection();
      if (direction === "left") {
        const justCompletedFirstLoop = nextCard();
        if (justCompletedFirstLoop && !shownLoopAlert) {
          setShownLoopAlert(true);
          Alert.alert(
            "That's all for today!",
            "You've seen all 5 profiles. You can keep browsing them, or come back tomorrow for new ones.",
          );
        }
      } else {
        prevCard();
      }
    },
    [nextCard, prevCard, shownLoopAlert]
  );

  // When index changes, animate the new card entering from the swipe direction
  useEffect(() => {
    const enterFrom = lastSwipeDir.current === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    translateX.value = enterFrom;
    translateX.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, translateX]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(doSwipe)("left");
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(doSwipe)("right");
      } else {
        translateX.value = withTiming(0, {
          duration: 150,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-6, 0, 6]
        )}deg`,
      },
    ],
  }));

  const handleNext = useCallback(() => {
    lastSwipeDir.current = "left";
    haptic.selection();
    translateX.value = withTiming(
      -SCREEN_WIDTH,
      { duration: 200, easing: Easing.out(Easing.cubic) },
      () => runOnJS(doSwipe)("left")
    );
  }, [translateX, doSwipe]);

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

  return (
    <>
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
            <Icon web="wallet" size={20} color={platformColor("label")} />
          </Pressable>
        </Stack.Toolbar.View>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {current ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cardWrap, cardAnimatedStyle]}>
              <ProfileCard
                profile={current.profile}
                version={toCardVersion(current)}
                contactAction={current.contactAction}
              />
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
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading...</Text>
          </View>
        )}
      </ScrollView>

      {current ? (
        <View style={styles.floatingBar}>
          <Pressable onPress={handleNext} style={styles.glassChipWrap}>
            <AdaptiveGlass
              style={styles.glassChip}
              glassEffectStyle="clear"
              intensity={30}
              blurTint="default"
              fallbackColor="rgba(120,120,128,0.16)"
            >
              <Text style={styles.glassChipLabel}>Next</Text>
            </AdaptiveGlass>
          </Pressable>
          <View style={styles.btnSpacer} />
          <Pressable onPress={handleSayHi} style={styles.glassChipWrapPrimary}>
            <AdaptiveGlass
              style={styles.glassChipPrimary}
              glassEffectStyle="clear"
              tintColor="#007AFF60"
              intensity={30}
              blurTint="default"
              fallbackColor="rgba(0,122,255,0.65)"
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
    color: platformColor("label"),
  },
  glassChipWrapPrimary: {
    flex: 1,
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
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: platformColor("label"),
  },
});
