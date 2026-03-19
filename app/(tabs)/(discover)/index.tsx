/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView/Dimensions,
 *          expo-router Stack/useRouter, react-native-reanimated,
 *          react-native-gesture-handler Gesture/GestureDetector,
 *          @/src/stores/contactsStore, @/src/components/card/profile-card ProfileCard,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics, @/src/lib/icons Icon,
 *          @/src/lib/contact-actions, @/src/types CardVersion
 * [OUTPUT]: DiscoverScreen — discover feed with swipe gestures and saved-card entry
 * [POS]: Discover tab main screen — lightweight browsing loop with clear next actions
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

import { Host, Button as SwiftButton } from "@expo/ui/swift-ui";
import { foregroundStyle, frame, glassEffect } from "@expo/ui/swift-ui/modifiers";

import { useContactsStore } from "@/src/stores/contactsStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { Clipboard } from "react-native";
import { executeContactAction } from "@/src/lib/contact-actions";
import { PillToast } from "@/src/components/shared/pill-toast";
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
  const [toast, setToast] = useState<{ icon: string; message: string; color: string } | null>(null);

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

    const action = current.contactAction;
    if (action?.type === "email") {
      Clipboard.setString(action.value);
      setToast({ icon: "doc.on.doc.fill", message: "Email copied", color: platformColor("systemBlue") });
      return;
    }

    executeContactAction(action, current.profile.url);
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
      {toast && (
        <PillToast
          icon={toast.icon}
          message={toast.message}
          color={toast.color}
          onDismiss={() => setToast(null)}
        />
      )}
      <Stack.Screen options={{ title: "Discover", headerLargeTitle: true }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View>
          <Pressable
            onPress={() => {
              haptic.light();
              router.push("/(discover)/collection" as any);
            }}
            accessibilityLabel="Open saved cards"
            style={styles.toolbarBtn}
          >
            <Icon web="bookmark-outline" size={20} color={platformColor("label")} />
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
                onEmailPress={(email) => {
                  Clipboard.setString(email);
                  setToast({ icon: "doc.on.doc.fill", message: "Email copied", color: platformColor("systemBlue") });
                }}
              />
              <Pressable style={styles.bookmarkBtn} onPress={handleSave}>
                <AdaptiveGlass
                  style={styles.bookmarkGlass}
                  glassEffectStyle="regular"
                  tintColor={saved ? "#FF950030" : "#00000015"}
                  intensity={40}
                  blurTint="default"
                  fallbackColor={saved ? "rgba(255,149,0,0.15)" : "rgba(0,0,0,0.08)"}
                >
                  <Icon
                    web="bookmark"
                    size={18}
                    color={saved ? platformColor("systemOrange") : platformColor("secondaryLabel")}
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
          <Host style={styles.glassHostLeft}>
            <SwiftButton
              onPress={handleNext}
              label="Next"
              modifiers={[
                frame({ maxWidth: 9999, minHeight: 40 }),
                glassEffect({ glass: { variant: "regular" } }),
                foregroundStyle({ type: "hierarchical", style: "primary" }),
              ]}
            />
          </Host>
          <View style={styles.btnSpacer} />
          <Host style={styles.glassHostRight}>
            <SwiftButton
              onPress={handleSayHi}
              label={current.contactAction?.label ?? "Say Hi"}
              modifiers={[
                frame({ maxWidth: 9999, minHeight: 40 }),
                glassEffect({ glass: { variant: "regular", tint: "#007AFF" } }),
                foregroundStyle("#FFFFFF"),
              ]}
            />
          </Host>
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
  glassHostLeft: {
    flex: 1,
    height: 40,
  },
  glassHostRight: {
    flex: 1,
    height: 40,
  },
  btnSpacer: { width: 12 },
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
