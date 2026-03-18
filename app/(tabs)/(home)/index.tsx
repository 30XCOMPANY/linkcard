/**
 * [INPUT]: react/react-native ScrollView/View/Text/Alert/StyleSheet/PlatformColor,
 *          expo-linear-gradient LinearGradient, expo-symbols SymbolView,
 *          react-native-reanimated Animated/FadeIn/FadeOut/interpolate/useAnimatedStyle,
 *          expo-router useRouter, @/src/stores/cardStore,
 *          @/src/components/card/profile-card, @/src/services/share shareCard,
 *          @/src/components/shared/adaptive-glass,
 *          @/src/types CardVersion, local profile-header, local swipe-to-share
 * [OUTPUT]: HomeScreen — card preview with fixed share ritual overlay, direct edit entry in header, and version switching
 * [POS]: (home) module entrypoint, coordinating header, fixed overlay, backdrop, card preview, and share flow
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { platformColor } from "@/src/lib/platform-color";
import { useCardStore } from "@/src/stores/cardStore";
import { ProfileCard } from "@/src/components/card/profile-card";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import type { CardVersion } from "@/src/types";

import { shareCard } from "@/src/services/share";
import { HomeProfileHeader } from "./profile-header";
import { COMMIT_THRESHOLD, SwipeToShare, useShareOverscroll } from "./swipe-to-share";

const SHARE_RITUAL_MS = 520;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const card = useCardStore((state) => state.card);
  const nameFont = useCardStore((state) => state.nameFont) ?? "classic";
  const addVersion = useCardStore((state) => state.addVersion);
  const setNameFont = useCardStore((state) => state.setNameFont);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [restoreTick, setRestoreTick] = useState(0);
  const [shareOverlayVisible, setShareOverlayVisible] = useState(false);

  const defaultVersion = useMemo(
    () => card?.versions.find((version) => version.isDefault) ?? card?.versions[0],
    [card]
  );

  React.useEffect(() => {
    if (!selectedVersionId && defaultVersion?.id) {
      setSelectedVersionId(defaultVersion.id);
    }
  }, [defaultVersion?.id, selectedVersionId]);

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
  }, [addVersion, card, currentVersion?.background]);

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
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    resetShareOverscroll();
    await waitForViewportReset();
  }, [resetShareOverscroll, waitForViewportReset]);

  const handleShareFlightComplete = useCallback(async () => {
    if (!card || !currentVersion) {
      return;
    }

    setShareOverlayVisible(true);
    await resetShareViewport();
    await wait(SHARE_RITUAL_MS);

    try {
      await shareCard(card, currentVersion, currentVersion.visibleFields as string[]);
    } catch (error) {
      Alert.alert("Share failed", "Please try again.");
    } finally {
      setShareOverlayVisible(false);
      await resetShareViewport();
      setRestoreTick((value) => value + 1);
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
          onShareFlightComplete={handleShareFlightComplete}
          overscroll={overscroll}
          releaseTick={releaseTick}
          restoreTick={restoreTick}
        >
          <ProfileCard
            nameFont={nameFont}
            profile={card.profile}
            version={currentVersion}
          />
        </SwipeToShare>
      </ScrollView>

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

      {shareOverlayVisible ? (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          pointerEvents="none"
          style={styles.shareOverlay}
        >
          <AdaptiveGlass
            style={styles.shareBadge}
            glassEffectStyle="clear"
            blurTint="default"
            intensity={58}
            tintColor={`${currentVersion.accentColor}C7`}
            fallbackColor="rgba(255,255,255,0.72)"
          >
            <View style={[styles.shareIconWrap, { backgroundColor: `${currentVersion.accentColor}14` }]}>
              <SymbolView
                name="square.and.arrow.up.fill"
                resizeMode="scaleAspectFit"
                style={styles.shareIcon}
                tintColor={currentVersion.accentColor}
              />
            </View>
            <Text style={[styles.shareTitle, { color: currentVersion.accentColor }]}>Share with...</Text>
          </AdaptiveGlass>
        </Animated.View>
      ) : null}
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
  shareOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 112,
    zIndex: 50,
  },
  shareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderCurve: "continuous" as any,
    overflow: "hidden",
  },
  shareIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  shareIcon: {
    width: 16,
    height: 16,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
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
