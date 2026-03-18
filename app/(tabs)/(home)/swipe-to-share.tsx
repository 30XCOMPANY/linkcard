/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/withTiming/withDelay/runOnJS/useReducedMotion,
 *          expo-linear-gradient LinearGradient,
 *          react-native View/Text/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics
 * [OUTPUT]: SwipeToShare — card tilts up on pan, background fills accent gradient,
 *           committed = card flies out + accent bg + "Swipe to Share", then card fades back
 * [POS]: (home) gesture layer — wraps ProfileCard, owns drag state, delegates share action upward
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { haptic } from "@/src/lib/haptics";
import { platformColor } from "@/src/lib/platform-color";
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
  isAtBottom: SharedValue<boolean>;
}

export function SwipeToShare({ children, onShare, accentColor, isAtBottom }: SwipeToShareProps) {
  const accentRgb = React.useMemo(() => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }, [accentColor]);

  const translateY = useSharedValue(0);
  const wasCommitted = useSharedValue(0);
  const gestureActive = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const flyState = useSharedValue(0); // 0=normal, 1=flying
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);

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
      if (flyState.value !== 0) return;
      wasCommitted.value = 0;
      gestureActive.value = 0;
    })
    .onUpdate((e) => {
      "worklet";
      if (flyState.value !== 0) return;
      if (gestureActive.value === 0) {
        if (!isAtBottom.value) return;
        gestureActive.value = 1;
      }
      translateY.value = Math.min(0, e.translationY);
      if (translateY.value < COMMIT_OFFSET && wasCommitted.value === 0) {
        wasCommitted.value = 1;
        runOnJS(fireThresholdHaptic)();
      }
    })
    .onEnd((e) => {
      "worklet";
      if (flyState.value !== 0 || gestureActive.value === 0) return;

      const committed =
        translateY.value < COMMIT_OFFSET || e.velocityY < COMMIT_VELOCITY;

      if (committed) {
        runOnJS(fireSuccessHaptic)();
        flyState.value = 1;

        // Fly out → pause → reset invisible → fade back in
        translateY.value = withSequence(
          withTiming(-800, { duration: 350 }),           // swoosh up
          withDelay(150, withTiming(20, { duration: 0 })), // reset to below
          withSpring(0, springs.gentle, () => {          // fade back settle
            "worklet";
            flyState.value = 0;
            runOnJS(fireShare)();
          })
        );
        cardScale.value = withSequence(
          withTiming(0.92, { duration: 350 }),
          withDelay(150, withTiming(0.96, { duration: 0 })),
          withSpring(1, springs.gentle)
        );
        cardOpacity.value = withSequence(
          withTiming(0, { duration: 250 }),
          withDelay(250, withTiming(0, { duration: 0 })),
          withTiming(1, { duration: 600 })
        );
      } else {
        translateY.value = withSpring(0, springs.share, (finished) => {
          "worklet";
          if (finished) runOnJS(fireCancelHaptic)();
        });
      }
    });

  /* Card: translate + tilt + shadow lift + scale + opacity */
  const cardStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const tilt = reducedMotion
      ? 0
      : interpolate(p, [0, 1], [0, MAX_TILT], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY: translateY.value },
        { perspective: 800 },
        { rotateX: flyState.value === 0 ? `${tilt}deg` : "0deg" },
        { scale: cardScale.value },
      ],
      opacity: cardOpacity.value,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: interpolate(p, [0, 1], [4, 24], Extrapolation.CLAMP) },
      shadowOpacity: interpolate(p, [0, 1], [0.08, 0.25], Extrapolation.CLAMP),
      shadowRadius: interpolate(p, [0, 1], [12, 40], Extrapolation.CLAMP),
    };
  });

  /* Edge glow */
  const glowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (p < 0.02 || flyState.value !== 0) return { opacity: 0 };
    return {
      opacity: 1,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: interpolate(p, [0, 1], [0, 0.4], Extrapolation.CLAMP),
      shadowRadius: interpolate(p, [0, 1], [0, 30], Extrapolation.CLAMP),
    };
  });

  /* Card border → accent */
  const cardBorderStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { borderColor: "rgba(255,255,255,0.40)" };
    const p = progress.value;
    const alpha = interpolate(p, [0, 1], [0.08, 0.45], Extrapolation.CLAMP);
    return {
      borderColor: p < 0.02
        ? "rgba(255,255,255,0.40)"
        : `rgba(${accentRgb},${alpha})`,
    };
  });

  /* Background: accent gradient that fills the whole screen area behind card */
  const bgStyle = useAnimatedStyle(() => {
    const p = progress.value;
    if (flyState.value !== 0) return { opacity: 0 };
    return {
      opacity: interpolate(p, [0, 0.1, 1], [0, 0, 0.6], Extrapolation.CLAMP),
    };
  });

  /* Drag indicator: fades in on gesture, hidden at idle */
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

  return (
    <View style={st.root}>
      {/* Accent gradient background — fills behind card */}
      <Animated.View style={[st.bgFill, bgStyle]} pointerEvents="none">
        <LinearGradient
          colors={[accentColor + "00", accentColor + "00", accentColor + "40", accentColor]}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* "Swipe to Share" text — below card */}
      <Animated.View style={[st.shareTextWrap, textStyle]} pointerEvents="none">
        <Text style={[st.shareText, { color: accentColor }]}>Swipe to Share</Text>
      </Animated.View>

      {/* Edge glow */}
      <Animated.View style={[st.glowLayer, glowStyle]} pointerEvents="none" />

      {/* Card */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[st.cardWrap, cardStyle, cardBorderStyle]}
          accessible
          accessibilityRole="button"
          accessibilityHint="Swipe up to share your card"
        >
          {children}
          {/* Drag indicator — inside card bottom */}
          <Animated.View
            style={[{
              position: "absolute",
              bottom: 8,
              alignSelf: "center",
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: platformColor("separator"),
              zIndex: 12,
            }, indicatorStyle]}
            pointerEvents="none"
          />
        </Animated.View>
      </GestureDetector>
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
  bgFill: {
    position: "absolute",
    top: 0,
    left: -32,
    right: -32,
    bottom: -500,
    zIndex: 0,
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
  glowLayer: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    zIndex: 2,
  },
  cardWrap: {
    zIndex: 3,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.40)",
    overflow: "hidden",
  },
});
