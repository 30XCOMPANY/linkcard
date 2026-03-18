/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView/Dimensions,
 *          expo-router Stack/useRouter, react-native-reanimated,
 *          react-native-gesture-handler Gesture/GestureDetector,
 *          @/src/stores/contactsStore, @/src/components/card/profile-card ProfileCard,
 *          @/src/components/shared/adaptive-glass AdaptiveGlass,
 *          @/src/lib/haptics, @/src/lib/icons Icon,
 *          @/src/lib/contact-actions, @/src/types CardVersion
 * [OUTPUT]: DiscoverScreenBase — shared discover feed shell exposing pluggable action bar content
 * [POS]: screens/discover core implementation owning swipe state and card feed behavior for route-specific shells
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
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
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { Icon } from "@/src/lib/icons";
import { platformColor } from "@/src/lib/platform-color";
import { useContactsStore } from "@/src/stores/contactsStore";
import type { CardVersion, ContactAction, DiscoverProfile } from "@/src/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

function toCardVersion(profile: DiscoverProfile): CardVersion {
  return {
    accentColor: profile.accentColor,
    background: profile.background,
    id: "discover-preview",
    isDefault: false,
    name: "Discover",
    template: profile.template,
    visibleFields: profile.visibleFields,
  };
}

interface DiscoverActionBarProps {
  actionLabel: string;
  onNext: () => void;
  onSayHi: () => void;
}

interface DiscoverScreenBaseProps {
  renderActionBar: (props: DiscoverActionBarProps) => React.ReactNode;
}

export function DiscoverScreenBase({ renderActionBar }: DiscoverScreenBaseProps) {
  const router = useRouter();
  const batch = useContactsStore((state) => state.discoverBatch);
  const index = useContactsStore((state) => state.discoverIndex);
  const nextCard = useContactsStore((state) => state.nextCard);
  const prevCard = useContactsStore((state) => state.prevCard);
  const refreshBatch = useContactsStore((state) => state.refreshBatch);
  const saveContact = useContactsStore((state) => state.saveContact);
  const resetDaily = useContactsStore((state) => state.resetDailyIfNeeded);
  const removeContact = useContactsStore((state) => state.removeContact);
  const current = index < batch.length ? batch[index] : null;

  const saved = useContactsStore((state) =>
    current ? state.savedContacts.some((contact) => contact.id === current.id) : false
  );

  const translateX = useSharedValue(0);
  const [shownLoopAlert, setShownLoopAlert] = useState(false);
  const lastSwipeDir = useRef<"left" | "right">("left");

  useEffect(() => {
    resetDaily();
  }, [resetDaily]);

  useEffect(() => {
    if (batch.length === 0) {
      refreshBatch();
    }
  }, [batch.length, refreshBatch]);

  const doSwipe = useCallback(
    (direction: "left" | "right") => {
      lastSwipeDir.current = direction;
      haptic.selection();

      if (direction === "left") {
        const completedLoop = nextCard();
        if (completedLoop && !shownLoopAlert) {
          setShownLoopAlert(true);
          Alert.alert(
            "That's all for today!",
            "You've seen all 5 profiles. You can keep browsing them, or come back tomorrow for new ones."
          );
        }
        return;
      }

      prevCard();
    },
    [nextCard, prevCard, shownLoopAlert]
  );

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
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(doSwipe)("left");
        return;
      }

      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(doSwipe)("right");
        return;
      }

      translateX.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-6, 0, 6])}deg`,
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
  }, [doSwipe, translateX]);

  const handleSayHi = useCallback(() => {
    if (!current) {
      return;
    }

    haptic.medium();
    executeContactAction(current.contactAction, current.profile.url);
  }, [current]);

  const handleSave = useCallback(() => {
    if (!current) {
      return;
    }

    if (saved) {
      haptic.light();
      removeContact(current.id);
      return;
    }

    haptic.success();
    saveContact(current);
  }, [current, removeContact, saveContact, saved]);

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
            style={styles.toolbarButton}
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
                contactAction={current.contactAction}
                profile={current.profile}
                version={toCardVersion(current)}
              />
              <Pressable onPress={handleSave} style={styles.bookmarkButton}>
                <AdaptiveGlass
                  blurTint="default"
                  fallbackColor={saved ? "rgba(255,149,0,0.15)" : "rgba(0,0,0,0.08)"}
                  glassEffectStyle="regular"
                  intensity={40}
                  style={styles.bookmarkGlass}
                  tintColor={saved ? "#FF950030" : "#00000015"}
                >
                  <Icon
                    color={saved ? "#FF9500" : "rgba(60,60,67,0.6)"}
                    size={18}
                    web="bookmark"
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

      {current
        ? renderActionBar({
            actionLabel: current.contactAction?.label ?? "Say Hi",
            onNext: handleNext,
            onSayHi: handleSayHi,
          })
        : null}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 160,
    paddingHorizontal: 16,
  },
  toolbarButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 32,
  },
  cardWrap: {
    position: "relative",
  },
  bookmarkButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },
  bookmarkGlass: {
    alignItems: "center",
    borderCurve: "continuous" as any,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    width: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    color: platformColor("label"),
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
});
