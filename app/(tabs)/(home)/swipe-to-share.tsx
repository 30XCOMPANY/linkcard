/**
 * [INPUT]: react-native-reanimated shared values/interpolate/useAnimatedReaction/withTiming/runOnJS/useReducedMotion,
 *          react-native View/Text/StyleSheet,
 *          @/src/lib/haptics, @/src/lib/platform-color
 * [OUTPUT]: SwipeToShare — renders card with share-on-overscroll effects (shadow, fly-out)
 *           useShareOverscroll — hook that reads ScrollView overscroll plus release/reset events and drives share progress
 * [POS]: (home) gesture layer — reads overscroll from parent ScrollView, no gesture conflict
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  withTiming,
} from "react-native-reanimated";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const COMMIT_THRESHOLD = 80;  // px of overscroll to commit share
export const SHARE_PREVIEW_ZONE = 140;  // px before bottom to start revealing share affordance

/* ------------------------------------------------------------------ */
/*  useShareOverscroll                                                 */
/* ------------------------------------------------------------------ */

export function useShareOverscroll() {
  const overscroll = useSharedValue(0);
  const releaseTick = useSharedValue(0);

  const handleScroll = useCallback((
    contentOffset: number,
    contentSize: number,
    layoutHeight: number,
    previewZone: number = 0
  ) => {
    const maxScroll = Math.max(0, contentSize - layoutHeight);
    const activationStart = Math.max(0, maxScroll - previewZone);
    overscroll.value = Math.max(0, contentOffset - activationStart);
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
  onShareFlightComplete: () => void;
  accentColor: string;
  overscroll: SharedValue<number>;
  releaseTick: SharedValue<number>;
}

export function SwipeToShare({
  children,
  onShareFlightComplete,
  accentColor,
  overscroll,
  releaseTick,
}: SwipeToShareProps) {
  const reducedMotion = useReducedMotion();
  const flyState = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const shareState = useSharedValue(0); // 0=idle, 1=committed, 2=flying

  const progress = useDerivedValue(() =>
    flyState.value !== 0 ? 0 : Math.min(1, overscroll.value / COMMIT_THRESHOLD)
  );

  const fireThresholdHaptic = useCallback(() => haptic.medium(), []);
  const fireSuccessHaptic = useCallback(() => haptic.success(), []);
  const fireShareFlightComplete = useCallback(
    () => onShareFlightComplete(),
    [onShareFlightComplete]
  );

  useAnimatedReaction(
    () => ({
      overscroll: overscroll.value,
      releaseTick: releaseTick.value,
      state: shareState.value,
    }),
    ({ overscroll: ov, releaseTick: released, state }, previous) => {
      if (state === 0 && ov >= COMMIT_THRESHOLD) {
        shareState.value = 1;
        runOnJS(fireThresholdHaptic)();
        return;
      }

      if (state === 1 && ov < COMMIT_THRESHOLD * 0.3) {
        shareState.value = 0;
        return;
      }

      if (state === 1 && released !== previous?.releaseTick) {
        shareState.value = 2;
        flyState.value = 1;
        runOnJS(fireSuccessHaptic)();

        cardTranslateY.value = withTiming(-800, { duration: 350 }, (finished) => {
          "worklet";
          if (finished) {
            runOnJS(fireShareFlightComplete)();
          }
        });
        cardScale.value = withTiming(0.92, { duration: 350 });
        cardOpacity.value = withTiming(0, { duration: 250 });
      }
    }
  );

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
      shadowColor: p < 0.02 ? "#000" : accentColor,
      shadowOffset: { width: 0, height: interpolate(p, [0, 1], [4, 0], Extrapolation.CLAMP) },
      shadowOpacity: interpolate(p, [0, 1], [0.08, 0.45], Extrapolation.CLAMP),
      shadowRadius: interpolate(p, [0, 1], [12, 35], Extrapolation.CLAMP),
    };
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: flyState.value !== 0
      ? 0
      : interpolate(progress.value, [0, 0.05, 0.15], [0, 0.3, 0.6], Extrapolation.CLAMP),
  }));

  const textStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) {
      return { opacity: 0 };
    }

    return {
      opacity: interpolate(progress.value, [0, 0.2, 0.5], [0, 0, 0.8], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(progress.value, [0.2, 0.6], [12, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={st.root}>
      <Animated.View
        style={[st.cardWrap, cardStyle]}
        accessible
        accessibilityRole="button"
        accessibilityHint="Swipe up to share your card"
      >
        {children}
        <Animated.View
          style={[st.indicator, indicatorStyle]}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.View style={[st.shareTextWrap, textStyle]} pointerEvents="none">
        <Text style={[st.shareText, { color: accentColor }]}>Swipe to Share</Text>
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
  indicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: platformColor("separator"),
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
  cardWrap: {
    zIndex: 10,
    elevation: 10,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    overflow: "hidden",
  },
});
