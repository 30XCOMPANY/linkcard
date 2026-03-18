/**
 * [INPUT]: react-native-gesture-handler Gesture/GestureDetector,
 *          react-native-reanimated shared values/interpolate/withSpring/withRepeat/withTiming/runOnJS/useReducedMotion,
 *          expo-blur BlurView,
 *          @shopify/react-native-skia Canvas/Fill/Shader/Skia,
 *          react-native View/StyleSheet,
 *          @/src/lib/springs, @/src/lib/haptics
 * [OUTPUT]: SwipeToShare — gesture wrapper that tilts card up on pan and fires onShare on commit,
 *           with blur condensation stack, Skia ripple shader, hint text, and breathing pulse
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
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";

import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COMMIT_OFFSET = -120;
const COMMIT_VELOCITY = -800;
const MAX_TILT = -5;

/* ------------------------------------------------------------------ */
/*  Condensation Stack — 8-layer brand blur mirror                     */
/* ------------------------------------------------------------------ */

// Ordered bottom→top: densest blur at bottom, faintest at top
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
    height: interpolate(progress.value, [0, 1], [0, 160], Extrapolation.CLAMP),
    opacity: interpolate(progress.value, [0, 0.05], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[s.condensation, stackStyle]} pointerEvents="none">
      {BLUR_LAYERS.map((layer, i) => (
        <BlurView
          key={i}
          intensity={layer.intensity}
          tint="default"
          style={[
            s.condLayer,
            {
              bottom: `${(i / 8) * 100}%`,
              height: `${(1 / 8) * 100}%`,
              opacity: layer.opacity,
            },
          ]}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: accentColor,
              opacity: 0.04,
            }}
          />
        </BlurView>
      ))}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Surface Tension Ripple — SkSL shader                               */
/* ------------------------------------------------------------------ */

const RIPPLE_SKSL = `
  uniform float progress;
  uniform float time;
  uniform float2 resolution;
  uniform float3 accent;

  half4 main(float2 pos) {
    float2 uv = pos / resolution;
    float fromBottom = 1.0 - uv.y;
    float maxH = progress * 0.8;
    if (maxH < 0.01 || fromBottom > maxH * 1.2) return half4(0);

    float wave = 0.0;
    for (int r = 0; r < 6; r++) {
      float freq = 12.0 + float(r) * 3.0;
      float phase = time * 4.0 - float(r) * 1.8;
      float w = sin(fromBottom / maxH * freq * 3.14159 - phase);
      float amp = exp(-fromBottom / (maxH * 0.6)) * (0.06 + float(r) * 0.008);
      float hv = 1.0 + 0.2 * sin(uv.x * 6.0 + float(r) * 2.0 + time * 0.7);
      wave += w * amp * hv * progress;
    }

    float base = max(0.0, 1.0 - fromBottom / maxH) * 0.03 * progress;
    float alpha = clamp(base + max(0.0, wave), 0.0, 0.18);
    alpha *= smoothstep(0.0, 0.1, uv.x) * smoothstep(0.0, 0.1, 1.0 - uv.x);

    return half4(accent.r, accent.g, accent.b, alpha);
  }
`;

const RIPPLE_HEIGHT = 180;

function RippleCanvas({
  progress,
  accentColor,
  width,
}: {
  progress: SharedValue<number>;
  accentColor: string;
  width: number;
}) {
  const source = React.useMemo(() => Skia.RuntimeEffect.Make(RIPPLE_SKSL), []);

  const time = useSharedValue(0);
  React.useEffect(() => {
    time.value = 0;
    time.value = withRepeat(withTiming(1000, { duration: 1000000 }), -1, false);
  }, []);

  const r = parseInt(accentColor.slice(1, 3), 16) / 255;
  const g = parseInt(accentColor.slice(3, 5), 16) / 255;
  const b = parseInt(accentColor.slice(5, 7), 16) / 255;

  const uniforms = useDerivedValue(() => ({
    progress: progress.value,
    time: time.value,
    resolution: [width, RIPPLE_HEIGHT],
    accent: [r, g, b],
  }));

  if (!source) return null;

  return (
    <Canvas style={[s.rippleCanvas, { width, height: RIPPLE_HEIGHT }]} pointerEvents="none">
      <Fill>
        <Shader source={source} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Hint Text — three overlapping layers with cross-fade               */
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
    <Animated.View style={[s.hintWrap, wrapStyle]} pointerEvents="none">
      <Animated.Text style={[s.hintText, { color: accentColor, opacity: 0.6 }, swipeStyle]}>
        ↑ swipe up to share
      </Animated.Text>
      <Animated.Text style={[s.hintText, s.hintAbsolute, { color: accentColor }, releaseStyle]}>
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
    opacity: progress.value > 0.02 ? 0 : breathe.value,
  }));

  return (
    <Animated.View
      style={[s.breathLine, { backgroundColor: accentColor }, style]}
      pointerEvents="none"
    />
  );
}

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
  const [cardWidth, setCardWidth] = React.useState(0);

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
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      accessibilityHint="Swipe up to share"
      accessibilityRole="button"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View style={[s.cardWrap, cardStyle]}>{children}</Animated.View>
      </GestureDetector>

      <CondensationStack progress={progress} accentColor={accentColor} />
      {cardWidth > 0 && !reducedMotion && (
        <RippleCanvas progress={progress} accentColor={accentColor} width={cardWidth} />
      )}
      <HintText progress={progress} accentColor={accentColor} />
      <BreathingPulse progress={progress} accentColor={accentColor} />
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
  condensation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 0,
  },
  condLayer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  rippleCanvas: {
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  hintWrap: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
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
    zIndex: 3,
  },
});
