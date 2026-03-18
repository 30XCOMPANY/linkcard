/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/withRepeat/withTiming/runOnJS/useReducedMotion,
 *          expo-blur BlurView,
 *          react-native View/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics
 * [OUTPUT]: SwipeToShare — gesture wrapper: card tilts up on pan, accent blur rises inside card, fires onShare
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

      if (committed) runOnJS(fireSuccessHaptic)();

      translateY.value = withSpring(0, springs.share, (finished) => {
        "worklet";
        if (finished && committed) runOnJS(fireShare)();
        else if (finished && !committed) runOnJS(fireCancelHaptic)();
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

  /* Condensation: accent-tinted blur layers inside the card, rising from bottom */
  const condensationStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 180], Extrapolation.CLAMP),
    opacity: interpolate(progress.value, [0, 0.08], [0, 1], Extrapolation.CLAMP),
  }));

  /* Hint text fade */
  const hintWrapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.3], [8, 0], Extrapolation.CLAMP) },
    ],
  }));

  const swipeTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.1, 0.55, 0.65], [0.5, 0.5, 0], Extrapolation.CLAMP),
  }));

  const releaseTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.55, 0.65, 0.95], [0, 1, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, [0.6, 0.7, 0.8], [0.95, 1.05, 1], Extrapolation.CLAMP) },
    ],
  }));

  /* Breathing pulse */
  const breathe = useSharedValue(0.05);
  React.useEffect(() => {
    breathe.value = withRepeat(withTiming(0.12, { duration: 1500 }), -1, true);
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.05], [breathe.value, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[st.root, cardStyle]}
        accessible
        accessibilityRole="button"
        accessibilityHint="Swipe up to share your card"
      >
        {/* Card content */}
        {children}

        {/* Condensation overlay — inside card, anchored to bottom */}
        <Animated.View style={[st.condensation, condensationStyle]} pointerEvents="none">
          {BLUR_LAYERS.map((layer, i) => (
            <BlurView
              key={i}
              intensity={layer.intensity}
              tint="default"
              style={[
                st.blurLayer,
                {
                  bottom: `${(i / 8) * 100}%`,
                  height: `${(1 / 8) * 100}%`,
                  opacity: layer.opacity,
                },
              ]}
            >
              <View style={[StyleSheet.absoluteFill, { backgroundColor: accentColor, opacity: 0.06 }]} />
            </BlurView>
          ))}
        </Animated.View>

        {/* Hint text — inside card at bottom */}
        <Animated.View style={[st.hintWrap, hintWrapStyle]} pointerEvents="none">
          <Animated.Text style={[st.hintText, { color: accentColor, opacity: 0.6 }, swipeTextStyle]}>
            ↑ swipe up to share
          </Animated.Text>
          <Animated.Text style={[st.hintText, st.hintAbsolute, { color: accentColor }, releaseTextStyle]}>
            ↑ Release to share
          </Animated.Text>
        </Animated.View>

        {/* Breathing pulse — accent line at card bottom */}
        <Animated.View
          style={[st.breathLine, { backgroundColor: accentColor }, breathStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </GestureDetector>
  );
}

/* ------------------------------------------------------------------ */
/*  Blur layer config                                                  */
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

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const st = StyleSheet.create({
  root: {
    position: "relative",
  },
  condensation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
  },
  blurLayer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  hintWrap: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 11,
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
    bottom: 8,
    left: "25%",
    right: "25%",
    height: 1.5,
    borderRadius: 1,
    zIndex: 11,
  },
});
