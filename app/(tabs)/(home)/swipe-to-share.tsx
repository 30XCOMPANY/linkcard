/**
 * [INPUT]: react-native-reanimated shared values/interpolate/useAnimatedReaction/withSequence/withSpring/withTiming/withDelay/runOnJS/useReducedMotion,
 *          react-native View/Text/StyleSheet, expo-symbols SymbolView,
 *          @/src/components/shared/adaptive-glass,
 *          @/src/lib/springs, @/src/lib/haptics, @/src/lib/platform-color
 * [OUTPUT]: SwipeToShare — renders card with share-on-overscroll effects (shadow, border, fly-out, share-sheet interstitial)
 *           useShareOverscroll — hook that reads ScrollView overscroll plus release/reset events and drives share progress
 * [POS]: (home) gesture layer — reads overscroll from parent ScrollView, no gesture conflict
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import Animated, {
  Extrapolation,
  type SharedValue,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
import { springs } from "@/src/lib/springs";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const COMMIT_THRESHOLD = 80;  // px of overscroll to commit share

/* ------------------------------------------------------------------ */
/*  useShareOverscroll — hook for parent ScrollView                    */
/* ------------------------------------------------------------------ */

export function useShareOverscroll() {
  const overscroll = useSharedValue(0);
  const releaseTick = useSharedValue(0);

  // Call from ScrollView onScroll — only BOTTOM overscroll counts
  const handleScroll = useCallback((contentOffset: number, contentSize: number, layoutHeight: number) => {
    // How far the user has scrolled past the bottom edge
    // maxScroll = the furthest contentOffset can go before overscrolling
    // If content is shorter than viewport, maxScroll = 0 (no scrolling needed)
    const maxScroll = Math.max(0, contentSize - layoutHeight);

    // Bottom overscroll = contentOffset beyond maxScroll
    // This is ONLY positive when the user drags up past the bottom
    // Top bounce (pulling down) makes contentOffset negative — ignored by Math.max
    const bottomOverscroll = Math.max(0, contentOffset - maxScroll);

    overscroll.value = bottomOverscroll;
  }, []);

  const handleRelease = useCallback(() => {
    releaseTick.value += 1;
  }, []);

  const handleReset = useCallback(() => {
    overscroll.value = 0;
  }, []);

  return { overscroll, releaseTick, handleScroll, handleRelease, handleReset };
}

/* ------------------------------------------------------------------ */
/*  SwipeToShare                                                       */
/* ------------------------------------------------------------------ */

interface SwipeToShareProps {
  children: React.ReactNode;
  onShare: () => void;
  accentColor: string;
  overscroll: SharedValue<number>;
  releaseTick: SharedValue<number>;
}

export function SwipeToShare({ children, onShare, accentColor, overscroll, releaseTick }: SwipeToShareProps) {
  const reducedMotion = useReducedMotion();
  const flyState = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const sharePulse = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.9);
  const successTranslateY = useSharedValue(8);

  const progress = useDerivedValue(() =>
    flyState.value !== 0 ? 0 : Math.min(1, overscroll.value / COMMIT_THRESHOLD)
  );

  const fireThresholdHaptic = useCallback(() => haptic.medium(), []);
  const fireSuccessHaptic = useCallback(() => haptic.success(), []);
  const fireShare = useCallback(() => onShare(), [onShare]);

  // State machine: idle(0) -> committed(1) -> flying(2)
  const shareState = useSharedValue(0); // 0=idle, 1=committed, 2=flying

  useAnimatedReaction(
    () => ({
      overscroll: overscroll.value,
      releaseTick: releaseTick.value,
      state: shareState.value,
    }),
    ({ overscroll: ov, releaseTick: released, state }, previous) => {
      if (state === 0 && ov >= COMMIT_THRESHOLD) {
        // IDLE -> COMMITTED: user dragged past threshold
        shareState.value = 1;
        runOnJS(fireThresholdHaptic)();
        return;
      }

      if (state === 1 && ov < COMMIT_THRESHOLD * 0.3) {
        // COMMITTED -> IDLE: user pulled back without releasing past threshold
        shareState.value = 0;
        return;
      }

      if (state === 1 && released !== previous?.releaseTick) {
        // COMMITTED -> FLYING: user released after crossing threshold
        shareState.value = 2;
        flyState.value = 1;
        runOnJS(fireSuccessHaptic)();

        successOpacity.value = 0;
        successScale.value = 0.9;
        successTranslateY.value = 8;
        sharePulse.value = 0;

        cardTranslateY.value = withSequence(
          withTiming(-800, { duration: 350 }),
          withDelay(750, withTiming(0, { duration: 0 }))
        );
        cardScale.value = withSequence(
          withTiming(0.92, { duration: 350 }),
          withDelay(750, withTiming(1, { duration: 0 }))
        );
        cardOpacity.value = withSequence(
          withTiming(0, { duration: 250 }),
          withDelay(750, withTiming(1, { duration: 500 }, () => {
            "worklet";
            flyState.value = 0;
            shareState.value = 0;
          }))
        );
        successOpacity.value = withSequence(
          withDelay(260, withTiming(1, { duration: 220 })),
          withDelay(320, withTiming(0, { duration: 220 }))
        );
        successScale.value = withSequence(
          withDelay(260, withSpring(1, springs.gentle)),
          withDelay(320, withTiming(0.96, { duration: 220 }))
        );
        successTranslateY.value = withSequence(
          withDelay(260, withTiming(0, { duration: 220 })),
          withDelay(320, withTiming(-6, { duration: 220 }))
        );
        sharePulse.value = withDelay(760, withTiming(1, { duration: 0 }, () => {
          "worklet";
          runOnJS(fireShare)();
        }));
        return;
      }
    }
  );

  /* Card: tilt + shadow + scale + opacity */
  const cardStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const tilt = reducedMotion ? 0 : interpolate(p, [0, 1], [0, -5], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY: cardTranslateY.value },
        { perspective: 800 },
        { rotateX: flyState.value === 0 ? `${tilt}deg` : "0deg" },
        { scale: cardScale.value },
      ],
      opacity: cardOpacity.value,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: interpolate(p, [0, 1], [4, 16], Extrapolation.CLAMP) },
      shadowOpacity: interpolate(p, [0, 1], [0.08, 0.2], Extrapolation.CLAMP),
      shadowRadius: interpolate(p, [0, 1], [12, 32], Extrapolation.CLAMP),
    };
  });



  /* Drag indicator */
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: flyState.value !== 0
      ? 0
      : interpolate(progress.value, [0, 0.05, 0.15], [0, 0.3, 0.6], Extrapolation.CLAMP),
  }));

  /* "Swipe to Share" text */
  const textStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { opacity: 0 };
    return {
      opacity: interpolate(progress.value, [0, 0.2, 0.5], [0, 0, 0.8], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(progress.value, [0.2, 0.6], [12, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  /* Success interstitial */
  const successStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [
      { scale: successScale.value },
      { translateY: successTranslateY.value },
    ],
  }));

  return (
    <View style={st.root}>
      {/* Card — rendered first, highest z-order */}
      <Animated.View
        style={[st.cardWrap, cardStyle]}
        accessible
        accessibilityRole="button"
        accessibilityHint="Swipe up to share your card"
      >
        {children}
        <Animated.View
          style={[{
            position: "absolute",
            bottom: 8,
            alignSelf: "center",
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: platformColor("separator"),
          }, indicatorStyle]}
          pointerEvents="none"
        />
      </Animated.View>

      {/* "Swipe to Share" text — behind card */}
      <Animated.View style={[st.shareTextWrap, textStyle]} pointerEvents="none">
        <Text style={[st.shareText, { color: accentColor }]}>Swipe to Share</Text>
      </Animated.View>

      <Animated.View style={[st.successWrap, successStyle]} pointerEvents="none">
        <AdaptiveGlass
          style={st.successBadge}
          glassEffectStyle="regular"
          blurTint="default"
          intensity={70}
          tintColor={`${accentColor}D9`}
          fallbackColor="rgba(255,255,255,0.82)"
        >
          <View style={[st.successIconWrap, { backgroundColor: `${accentColor}16` }]}>
            <SymbolView
              name="square.and.arrow.up.fill"
              resizeMode="scaleAspectFit"
              style={st.successIcon}
              tintColor={accentColor}
            />
          </View>
          <Text style={[st.successTitle, { color: accentColor }]}>Preparing Share</Text>
          <Text style={st.successSubtitle}>Opening share sheet</Text>
        </AdaptiveGlass>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const st = StyleSheet.create({
  root: {
    position: "relative",
  },
  shareTextWrap: {
    position: "absolute",
    bottom: -50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  shareText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  successWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  successBadge: {
    minWidth: 180,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 28,
    borderCurve: "continuous" as any,
    overflow: "hidden",
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 28,
    height: 28,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  successSubtitle: {
    color: platformColor("secondaryLabel"),
    fontSize: 14,
    fontWeight: "500",
  },
  cardWrap: {
    zIndex: 10,
    elevation: 10,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.40)",
    overflow: "hidden",
  },
});
