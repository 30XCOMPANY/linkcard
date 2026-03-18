/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/withTiming/runOnJS/useReducedMotion,
 *          expo-linear-gradient LinearGradient,
 *          react-native View/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics, @/src/lib/platform-color
 * [OUTPUT]: SwipeToShare — card tilts up on pan, edge glows, trapezoid accent zone appears below,
 *           committed = card flies out + fades back, cancelled = spring back
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
  withDelay,
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
const TRAPEZOID_HEIGHT = 100;

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
  const translateY = useSharedValue(0);
  const wasCommitted = useSharedValue(0);
  const gestureActive = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  // Fly-out / fade-back state: 0=normal, 1=flying out, 2=fading back
  const flyState = useSharedValue(0);
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
      if (flyState.value !== 0) return;
      if (gestureActive.value === 0) return;

      const committed =
        translateY.value < COMMIT_OFFSET || e.velocityY < COMMIT_VELOCITY;

      if (committed) {
        // === FLY OUT ===
        runOnJS(fireSuccessHaptic)();
        flyState.value = 1;

        // Card flies up and fades out
        translateY.value = withTiming(-800, { duration: 350 });
        cardScale.value = withTiming(0.92, { duration: 350 });
        cardOpacity.value = withTiming(0, { duration: 250 });

        // After fly-out: reset to invisible start position, then fade back
        translateY.value = withDelay(400, withTiming(20, { duration: 0 }));
        cardScale.value = withDelay(400, withTiming(0.96, { duration: 0 }));
        cardOpacity.value = withDelay(400, withTiming(0, { duration: 0 }));

        // Fade back in — new card materializing
        translateY.value = withDelay(450, withSpring(0, springs.gentle));
        cardScale.value = withDelay(450, withSpring(1, springs.gentle));
        cardOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));

        // Fire share + reset state after sequence
        translateY.value = withDelay(1100, withTiming(0, { duration: 0 }, () => {
          "worklet";
          flyState.value = 0;
          runOnJS(fireShare)();
        }));
      } else {
        // === CANCELLED ===
        translateY.value = withSpring(0, springs.share, (finished) => {
          "worklet";
          if (finished) runOnJS(fireCancelHaptic)();
        });
      }
    });

  /* Card transform: translate + tilt + fly-out scale/opacity */
  const cardStyle = useAnimatedStyle(() => {
    const tilt = reducedMotion
      ? 0
      : interpolate(progress.value, [0, 1], [0, MAX_TILT], Extrapolation.CLAMP);
    return {
      transform: [
        { translateY: translateY.value },
        { perspective: 800 },
        { rotateX: flyState.value === 0 ? `${tilt}deg` : "0deg" },
        { scale: cardScale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  /* Edge glow: accent shadow around card */
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

  /* Trapezoid zone opacity */
  const trapStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { opacity: 0, height: 0 };
    return {
      opacity: interpolate(progress.value, [0, 0.08], [0, 1], Extrapolation.CLAMP),
      height: interpolate(progress.value, [0, 1], [0, TRAPEZOID_HEIGHT], Extrapolation.CLAMP),
    };
  });

  /* Hint text */
  const hintWrapStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { opacity: 0 };
    return {
      opacity: interpolate(progress.value, [0, 0.15], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(progress.value, [0, 0.3], [8, 0], Extrapolation.CLAMP) },
      ],
    };
  });

  const swipeTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.1, 0.55, 0.65], [0.5, 0.5, 0], Extrapolation.CLAMP),
  }));

  const releaseTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.55, 0.65, 0.95], [0, 1, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(progress.value, [0.6, 0.7, 0.8], [0.95, 1.05, 1], Extrapolation.CLAMP) },
    ],
  }));

  /* Drag indicator: hidden at idle, fades in when gesture starts */
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.05, 0.15], [0, 0.3, 0.6], Extrapolation.CLAMP),
  }));

  /* Card border color animated */
  const cardBorderStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { borderColor: "rgba(255,255,255,0.40)" };
    const p = progress.value;
    // Interpolate from white 40% to accent
    const alpha = interpolate(p, [0, 1], [0.08, 0.45], Extrapolation.CLAMP);
    return {
      borderColor: p < 0.02
        ? "rgba(255,255,255,0.40)"
        : `rgba(${hexToRgb(accentColor)},${alpha})`,
    };
  });

  return (
    <View style={st.root}>
      {/* Edge glow — behind card */}
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
          {/* Drag indicator — inside card bottom, fades in on gesture */}
          <Animated.View style={[st.dragIndicator, indicatorStyle]} pointerEvents="none" />
        </Animated.View>
      </GestureDetector>


      {/* Trapezoid accent zone — below card */}
      <Animated.View style={[st.trapezoid, trapStyle]} pointerEvents="none">
        <LinearGradient
          colors={[accentColor + "40", accentColor + "15", accentColor + "00"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Hint text — below card in trapezoid area */}
      <Animated.View style={[st.hintWrap, hintWrapStyle]} pointerEvents="none">
        <Animated.Text style={[st.hintText, { color: accentColor, opacity: 0.7 }, swipeTextStyle]}>
          ↑ swipe up to share
        </Animated.Text>
        <Animated.Text style={[st.hintText, st.hintAbsolute, { color: accentColor }, releaseTextStyle]}>
          ↑ Release to share
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const st = StyleSheet.create({
  root: {
    position: "relative",
  },
  glowLayer: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    zIndex: 0,
  },
  cardWrap: {
    zIndex: 1,
    borderRadius: 24,
    borderCurve: "continuous" as any,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.40)",
    overflow: "hidden",
  },
  dragIndicator: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    marginLeft: -18,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: platformColor("separator"),
    zIndex: 12,
  },
  trapezoid: {
    marginTop: 4,
    marginHorizontal: -16, // extend to screen edges (counteract parent padding)
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    zIndex: 0,
  },
  hintWrap: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  hintText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  hintAbsolute: {
    position: "absolute",
  },
});
