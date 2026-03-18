/**
 * [INPUT]: react/react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          expo-linear-gradient LinearGradient, react-native-reanimated Animated/interpolate/useAnimatedStyle,
 *          expo-router useRouter, @/src/stores/cardStore,
 *          @/src/components/card/profile-card, @/src/services/share shareCard,
 *          @/src/types CardVersion, local profile-header, local swipe-to-share
 * [OUTPUT]: HomeScreen — card preview with overscroll share backdrop, direct edit entry in header, and version switching
 * [POS]: (home) module entrypoint, coordinating header, backdrop, card preview, and share flow
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import type { CardVersion } from "@/src/types";

import { shareCard } from "@/src/services/share";
import { HomeProfileHeader } from "./profile-header";
import { COMMIT_THRESHOLD, SwipeToShare, useShareOverscroll } from "./swipe-to-share";

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [shareViewportKey, setShareViewportKey] = useState(0);
  const card = useCardStore((state) => state.card);
  const nameFont = useCardStore((state) => state.nameFont) ?? "classic";
  const addVersion = useCardStore((state) => state.addVersion);
  const setNameFont = useCardStore((state) => state.setNameFont);

  const defaultVersion = useMemo(
    () => card?.versions.find((version) => version.isDefault) ?? card?.versions[0],
    [card]
  );
  const [selectedVersionId, setSelectedVersionId] = useState(defaultVersion?.id ?? "");

  const currentVersion = useMemo(
    () => card?.versions.find((version) => version.id === selectedVersionId) ?? defaultVersion,
    [card, defaultVersion, selectedVersionId]
  );

  const handleFontCycle = useCallback(() => {
    const keys = ["classic", "modern", "mono", "system"] as const;
    const currentIndex = keys.indexOf(nameFont);
    const nextFont = keys[(currentIndex + 1) % keys.length];
    setNameFont(nextFont);
  }, [nameFont, setNameFont]);

  const handleCreateVersion = useCallback(() => {
    if (!card) {
      return;
    }

    const count = card.versions.length + 1;
    const nextVersion: CardVersion = {
      accentColor: "#007AFF",
      background: currentVersion?.background ?? "lightGlass",
      id: `v-${Date.now()}`,
      isDefault: false,
      name: `Card ${count}`,
      template: "modern",
      visibleFields: [
        "photoUrl",
        "name",
        "jobTitle",
        "headline",
        "company",
        "location",
        "qrCode",
      ],
    };

    addVersion(nextVersion);
    setSelectedVersionId(nextVersion.id);
  }, [addVersion, card]);

  const {
    overscroll,
    releaseTick,
    handleScroll: handleShareScroll,
    handleRelease: handleShareRelease,
    handleReset: resetShareOverscroll,
  } = useShareOverscroll();
  const backdropStyle = useAnimatedStyle(() => {
    const progress = Math.min(1, overscroll.value / COMMIT_THRESHOLD);
    return {
      opacity: interpolate(progress, [0, 0.1, 1], [0, 0, 0.6], Extrapolation.CLAMP),
    };
  });

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    handleShareScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
  }, [handleShareScroll]);

  const waitForViewportReset = useCallback(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }, []);

  const resetShareViewport = useCallback(async () => {
    setShareViewportKey((value) => value + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    resetShareOverscroll();
    await waitForViewportReset();
  }, [resetShareOverscroll, waitForViewportReset]);

  const handleShare = useCallback(async () => {
    if (!card || !currentVersion) return;

    await resetShareViewport();

    try {
      await shareCard(card, currentVersion, currentVersion.visibleFields as string[]);
    } catch (error) {
      Alert.alert("Share failed", "Please try again.");
    } finally {
      await resetShareViewport();
    }
  }, [card, currentVersion, resetShareViewport]);

  if (!card || !currentVersion) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          No card yet. Complete onboarding to get started.
        </Text>
      </View>
    );
  }

  return (
    <>
      <HomeProfileHeader
        currentVersion={currentVersion}
        onCreateVersion={handleCreateVersion}
        onEdit={() =>
          router.push({
            pathname: "/(tabs)/(home)/editor" as any,
            params: { versionId: selectedVersionId },
          })
        }
        onFontCycle={handleFontCycle}
        onSelectVersion={setSelectedVersionId}
        onSync={() =>
          Alert.alert(
            "LinkedIn refresh is coming soon",
            "Auto-sync preferences are ready. Manual refresh will land in a later build."
          )
        }
        profile={card.profile}
        versions={card.versions}
      />

      <ScrollView
        key={shareViewportKey}
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleShareRelease}
        onScroll={handleScroll}
        onScrollEndDrag={handleShareRelease}
        scrollEventThrottle={16}
      >
        <SwipeToShare
          accentColor={currentVersion.accentColor}
          onShare={handleShare}
          overscroll={overscroll}
          releaseTick={releaseTick}
        >
          <ProfileCard
            nameFont={nameFont}
            profile={card.profile}
            version={currentVersion}
          />
        </SwipeToShare>
      </ScrollView>

      {/* Backdrop AFTER ScrollView — absolute positioned, doesn't block native header connection */}
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none">
        <LinearGradient
          colors={[
            currentVersion.accentColor + "00",
            currentVersion.accentColor + "00",
            currentVersion.accentColor + "40",
            currentVersion.accentColor,
          ]}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    left: -16,
    right: -16,
    bottom: -500,
  },
  scroll: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: platformColor("secondaryLabel"),
    fontSize: 15,
  },
});
