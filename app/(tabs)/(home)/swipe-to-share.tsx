/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/runOnJS/useReducedMotion,
 *          react-native View/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics
 * [OUTPUT]: SwipeToShare — gesture wrapper that tilts card up on pan and fires onShare on commit
 * [POS]: (home) gesture layer — wraps ProfileCard, owns drag state, delegates share action upward
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COMMIT_OFFSET = -120;
const COMMIT_VELOCITY = -800;
const MAX_TILT = -5;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface SwipeToShareProps {
  children: React.ReactNode;
  onShare: () => void;
  accentColor: string;
}

export function SwipeToShare({ children, onShare, accentColor }: SwipeToShareProps) {
  const translateY = useSharedValue(0);
  const wasCommitted = useSharedValue(0); // 0=no, 1=yes — shared value for worklet safety
  const reducedMotion = useReducedMotion();

  const progress = useDerivedValue(() =>
    Math.min(1, Math.abs(translateY.value) / Math.abs(COMMIT_OFFSET))
  );

  /* JS-thread callbacks */
  const fireThresholdHaptic = useCallback(() => haptic.medium(), []);
  const fireShareHaptic = useCallback(() => { haptic.success(); onShare(); }, [onShare]);
  const fireCancelHaptic = useCallback(() => haptic.light(), []);

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10])  // 10px dead zone — lets ScrollView handle small scrolls
    .onStart(() => {
      "worklet";
      wasCommitted.value = 0;
    })
    .onUpdate((e) => {
      "worklet";
      translateY.value = Math.min(0, e.translationY);
      if (translateY.value < COMMIT_OFFSET && wasCommitted.value === 0) {
        wasCommitted.value = 1;
        runOnJS(fireThresholdHaptic)();
      }
    })
    .onEnd((e) => {
      "worklet";
      const committed =
        translateY.value < COMMIT_OFFSET || e.velocityY < COMMIT_VELOCITY;

      // Spring back first, THEN fire share after card settles
      translateY.value = withSpring(0, springs.share, (finished) => {
        "worklet";
        if (finished && committed) {
          runOnJS(fireShareHaptic)();
        } else if (finished && !committed) {
          runOnJS(fireCancelHaptic)();
        }
      });
    });

  const cardStyle = useAnimatedStyle(() => {
    const tilt = reducedMotion
      ? 0
      : interpolate(progress.value, [0, 1], [0, MAX_TILT], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY: translateY.value },
        { perspective: 800 },
        { rotateX: `${tilt}deg` },
      ],
    };
  });

  return (
    <View
      style={s.root}
      accessibilityHint="Swipe up to share"
      accessibilityRole="button"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[s.cardWrap, cardStyle]}>{children}</Animated.View>
      </GestureDetector>

      {/* Condensation zone — Task 4 */}
      {/* Ripple canvas — Task 5 */}
      {/* Hint text — Task 6 */}
      {/* Breathing pulse — Task 6 */}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    position: "relative",
  },
  cardWrap: {
    zIndex: 1,
  },
});
