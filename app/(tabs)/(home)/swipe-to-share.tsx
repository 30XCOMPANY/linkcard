/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/withRepeat/withTiming/runOnJS/useReducedMotion,
 *          expo-blur BlurView,
 *          react-native View/StyleSheet/Text,
 *          @/src/lib/springs, @/src/lib/haptics
 * [OUTPUT]: SwipeToShare — gesture wrapper that tilts card up on pan, reveals condensation beneath, fires onShare
 * [POS]: (home) gesture layer — wraps ProfileCard, owns drag state, delegates share action upward
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  type SharedValue,
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
import { BlurView } from "expo-blur";

import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COMMIT_OFFSET = -120;
const COMMIT_VELOCITY = -800;
const MAX_TILT = -5;
const CONDENSATION_HEIGHT = 160;

/* ------------------------------------------------------------------ */
/*  Condensation Stack — 8-layer brand blur mirror                     */
/* ------------------------------------------------------------------ */

const BLUR_LAYERS = [
  { intensity: 100, opacity: 1.00 },
  { intensity: 100, opacity: 0.90 },
  { intensity: 100, opacity: 0.80 },
  { intensity: 85,  opacity: 0.65 },
  { intensity: 70,  opacity: 0.50 },
  { intensity: 50,  opacity: 0.35 },
  { intensity: 30,  opacity: 0.25 },
  { intensity: 15,  opacity: 0.15 },
] as const;

function CondensationStack({
  progress,
  accentColor,
}: {
  progress: SharedValue<number>;
  accentColor: string;
}) {
  const stackStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, CONDENSATION_HEIGHT], Extrapolation.CLAMP),
    opacity: interpolate(progress.value, [0, 0.05], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.condensation, stackStyle]} pointerEvents="none">
      {BLUR_LAYERS.map((layer, i) => (
        <BlurView
          key={i}
          intensity={layer.intensity}
          tint="default"
          style={[
            styles.condLayer,
            {
              bottom: `${(i / 8) * 100}%`,
              height: `${(1 / 8) * 100}%`,
              opacity: layer.opacity,
            },
          ]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: accentColor, opacity: 0.04 },
            ]}
          />
        </BlurView>
      ))}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Hint Text — cross-fade between "swipe up" and "Release to share"   */
/* ------------------------------------------------------------------ */

function HintText({
  progress,
  accentColor,
}: {
  progress: SharedValue<number>;
  accentColor: string;
}) {
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.3], [8, 0], Extrapolation.CLAMP) },
    ],
  }));

  const swipeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.1, 0.55, 0.65], [0.5, 0.5, 0], Extrapolation.CLAMP),
  }));

  const releaseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.55, 0.65, 0.95], [0, 1, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(progress.value, [0.6, 0.7, 0.8], [0.95, 1.05, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.hintWrap, wrapStyle]} pointerEvents="none">
      <Animated.Text style={[styles.hintText, { color: accentColor, opacity: 0.6 }, swipeStyle]}>
        ↑ swipe up to share
      </Animated.Text>
      <Animated.Text style={[styles.hintText, styles.hintAbsolute, { color: accentColor }, releaseStyle]}>
        ↑ Release to share
      </Animated.Text>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Breathing Pulse                                                    */
/* ------------------------------------------------------------------ */

function BreathingPulse({
  progress,
  accentColor,
}: {
  progress: SharedValue<number>;
  accentColor: string;
}) {
  const breathe = useSharedValue(0.05);

  React.useEffect(() => {
    breathe.value = withRepeat(withTiming(0.12, { duration: 1500 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.05], [breathe.value, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[styles.breathLine, { backgroundColor: accentColor }, style]}
      pointerEvents="none"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  SwipeToShare                                                       */
/* ------------------------------------------------------------------ */

interface SwipeToShareProps {
  children: React.ReactNode;
  onShare: () => void;
  accentColor: string;
}

export function SwipeToShare({ children, onShare, accentColor }: SwipeToShareProps) {
  const translateY = useSharedValue(0);
  const wasCommitted = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const progress = useDerivedValue(() =>
    Math.min(1, Math.abs(translateY.value) / Math.abs(COMMIT_OFFSET))
  );

  const fireThresholdHaptic = useCallback(() => haptic.medium(), []);
  const fireSuccessHaptic = useCallback(() => haptic.success(), []);
  const fireShare = useCallback(() => onShare(), [onShare]);
  const fireCancelHaptic = useCallback(() => haptic.light(), []);

  const gesture = Gesture.Pan()
    .activeOffsetY(-10)
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

      if (committed) {
        runOnJS(fireSuccessHaptic)();
      }

      translateY.value = withSpring(0, springs.share, (finished) => {
        "worklet";
        if (finished && committed) {
          runOnJS(fireShare)();
        } else if (finished && !committed) {
          runOnJS(fireCancelHaptic)();
        }
      });
    });

  /* Card: translateY + perspective tilt */
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

  /*
   * Layout architecture:
   * - Root is a static container with overflow visible
   * - Card (Animated.View) translates upward on gesture
   * - Condensation zone sits BEHIND the card at the bottom,
   *   revealed as the card moves up. It's positioned absolutely
   *   at the card's original bottom edge.
   * - Hint text and breathing pulse overlay the condensation zone
   */
  return (
    <View style={styles.root}>
      {/* Condensation zone — stationary, revealed when card lifts */}
      <View style={styles.revealZone} pointerEvents="none">
        <CondensationStack progress={progress} accentColor={accentColor} />
        <HintText progress={progress} accentColor={accentColor} />
        <BreathingPulse progress={progress} accentColor={accentColor} />
      </View>

      {/* Card — moves up on gesture */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.cardWrap, cardStyle]}
          accessible
          accessibilityRole="button"
          accessibilityHint="Swipe up to share your card"
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "visible",
  },
  cardWrap: {
    zIndex: 1,
  },
  /* Reveal zone: positioned at the bottom of the card's resting position.
     When the card translates up, this zone becomes visible beneath it. */
  revealZone: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: CONDENSATION_HEIGHT + 60,
    zIndex: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  condensation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  condLayer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  hintWrap: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  hintText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  hintAbsolute: {
    position: "absolute",
  },
  breathLine: {
    position: "absolute",
    bottom: 6,
    left: "25%",
    right: "25%",
    height: 1.5,
    borderRadius: 1,
    zIndex: 1,
  },
});
