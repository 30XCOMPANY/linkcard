/**
 * [INPUT]: react-native-reanimated shared values/interpolate/withSequence/withSpring/withTiming/withDelay/runOnJS/useReducedMotion,
 *          expo-linear-gradient LinearGradient,
 *          react-native View/Text/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics, @/src/lib/platform-color
 * [OUTPUT]: SwipeToShare — renders card with share-on-overscroll effects (shadow, border, bg gradient, fly-out)
 *           useShareOverscroll — hook that reads ScrollView overscroll and drives share progress
 * [POS]: (home) gesture layer — reads overscroll from parent ScrollView, no gesture conflict
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
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

const COMMIT_THRESHOLD = 80;  // px of overscroll to commit share

/* ------------------------------------------------------------------ */
/*  useShareOverscroll — hook for parent ScrollView                    */
/* ------------------------------------------------------------------ */

export function useShareOverscroll() {
  const overscroll = useSharedValue(0);

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

  return { overscroll, handleScroll };
}

/* ------------------------------------------------------------------ */
/*  SwipeToShare                                                       */
/* ------------------------------------------------------------------ */

interface SwipeToShareProps {
  children: React.ReactNode;
  onShare: () => void;
  accentColor: string;
  overscroll: SharedValue<number>;
}

export function SwipeToShare({ children, onShare, accentColor, overscroll }: SwipeToShareProps) {
  const accentRgb = React.useMemo(() => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }, [accentColor]);

  const reducedMotion = useReducedMotion();
  const flyState = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);

  const progress = useDerivedValue(() =>
    flyState.value !== 0 ? 0 : Math.min(1, overscroll.value / COMMIT_THRESHOLD)
  );

  const fireThresholdHaptic = useCallback(() => haptic.medium(), []);
  const fireSuccessHaptic = useCallback(() => haptic.success(), []);
  const fireShare = useCallback(() => onShare(), [onShare]);

  // State machine: idle(0) → committed(1) → flying(2)
  // Single useDerivedValue avoids race conditions between watchers
  const shareState = useSharedValue(0); // 0=idle, 1=committed, 2=flying

  useDerivedValue(() => {
    const ov = overscroll.value;
    const state = shareState.value;

    if (state === 0 && ov >= COMMIT_THRESHOLD) {
      // IDLE → COMMITTED: user dragged past threshold
      shareState.value = 1;
      runOnJS(fireThresholdHaptic)();
    } else if (state === 1 && ov < 5) {
      // COMMITTED → FLYING: user released (overscroll bouncing back)
      shareState.value = 2;
      flyState.value = 1;
      runOnJS(fireSuccessHaptic)();

      cardTranslateY.value = withSequence(
        withTiming(-800, { duration: 350 }),
        withDelay(150, withTiming(20, { duration: 0 })),
        withSpring(0, springs.gentle, () => {
          "worklet";
          flyState.value = 0;
          shareState.value = 0;
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
    } else if (state === 1 && ov < COMMIT_THRESHOLD * 0.3) {
      // COMMITTED → IDLE: user pulled back without releasing past threshold
      shareState.value = 0;
    }
  });

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
      shadowColor: p < 0.02 ? "#000" : accentColor,
      shadowOffset: { width: 0, height: interpolate(p, [0, 1], [4, 0], Extrapolation.CLAMP) },
      shadowOpacity: interpolate(p, [0, 1], [0.08, 0.45], Extrapolation.CLAMP),
      shadowRadius: interpolate(p, [0, 1], [12, 35], Extrapolation.CLAMP),
    };
  });

  /* Card border → accent */
  const cardBorderStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { borderColor: "rgba(255,255,255,0.40)" };
    const p = progress.value;
    return {
      borderColor: p < 0.02
        ? "rgba(255,255,255,0.40)"
        : `rgba(${accentRgb},${interpolate(p, [0, 1], [0.08, 0.45], Extrapolation.CLAMP)})`,
    };
  });

  /* Background gradient */
  const bgStyle = useAnimatedStyle(() => {
    if (flyState.value !== 0) return { opacity: 0 };
    return {
      opacity: interpolate(progress.value, [0, 0.1, 1], [0, 0, 0.6], Extrapolation.CLAMP),
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

  return (
    <View style={st.root}>
      {/* Card — rendered first, highest z-order */}
      <Animated.View
        style={[st.cardWrap, cardStyle, cardBorderStyle]}
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

      {/* Accent gradient background — behind card */}
      <Animated.View style={[st.bgFill, bgStyle]} pointerEvents="none">
        <LinearGradient
          colors={[accentColor + "00", accentColor + "00", accentColor + "40", accentColor]}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* "Swipe to Share" text — behind card */}
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
