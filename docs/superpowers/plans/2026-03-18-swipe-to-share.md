# Swipe-to-Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add gesture-driven share interaction on Home screen — swipe card up to reveal branded blur condensation with surface tension ripple, then auto-trigger native Share Sheet.

**Architecture:** A `SwipeToShare` wrapper component handles the pan gesture via `react-native-gesture-handler` + `react-native-reanimated`. It composes three visual layers: (1) 8 `BlurView` condensation layers mirroring the banner blur brand signature, (2) a `@shopify/react-native-skia` Canvas rendering the surface tension ripple shader, (3) an animated hint text. The wrapper accepts `children` (the `ProfileCard`) and an `onShare` callback.

**Tech Stack:** react-native-gesture-handler (Gesture.Pan), react-native-reanimated (shared values, interpolate, withSpring, withRepeat, withTiming, useReducedMotion), expo-blur (BlurView), @shopify/react-native-skia (Canvas, Shader, RuntimeEffect), expo-haptics

**Spec:** `docs/superpowers/specs/2026-03-18-swipe-to-share-design.md`

---

## File Structure

```
New:
  app/(tabs)/(home)/swipe-to-share.tsx  — Gesture wrapper + blur stack + ripple canvas + hint text + breathing pulse

Modify:
  src/lib/springs.ts                     — Add `share` spring config
  app/(tabs)/(home)/index.tsx            — Replace ScrollView with SwipeToShare wrapping ProfileCard
  app/(tabs)/(home)/CLAUDE.md            — Add swipe-to-share.tsx to members
  package.json                           — Add @shopify/react-native-skia dependency

Existing (no changes):
  src/services/share.ts                  — shareCard() called from onShare
  src/lib/haptics.ts                     — haptic.medium/success/light used in gesture
  src/components/card/profile-card.tsx    — Rendered as child of SwipeToShare
```

---

### Task 1: Install @shopify/react-native-skia

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

Run:
```bash
npx expo install @shopify/react-native-skia
```

- [ ] **Step 2: Verify it installed**

Run:
```bash
grep "react-native-skia" package.json
```

Expected: `"@shopify/react-native-skia": "..."` appears in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @shopify/react-native-skia for share ripple shader"
```

---

### Task 2: Add `share` spring config

**Files:**
- Modify: `src/lib/springs.ts`

- [ ] **Step 1: Add the spring preset**

Add after the `gentle` entry in `src/lib/springs.ts`:

```typescript
  // Share gesture: card spring-back after release
  share: { stiffness: 400, damping: 28 },
```

The full file becomes:

```typescript
/**
 * [INPUT]: none (pure constants)
 * [OUTPUT]: springs object with named spring parameter presets
 * [POS]: Core utility — single source of truth for all spring animation configs
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const springs = {
  // User-initiated: button press, chip tap (fast settle)
  snappy: { stiffness: 500, damping: 30 },
  // User-initiated: card drag, carousel flick (preserves velocity)
  gesture: { stiffness: 500, damping: 30 },
  // UI feedback: scale bounce on success (more bounce)
  bouncy: { stiffness: 600, damping: 15 },
  // Settle: list items, stagger (gentle ease-in)
  gentle: { stiffness: 300, damping: 25 },
  // Share gesture: card spring-back after release
  share: { stiffness: 400, damping: 28 },
} as const;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | grep springs || echo "OK"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/springs.ts
git commit -m "feat: add share spring config for swipe-to-share gesture"
```

---

### Task 3: Create `SwipeToShare` component — gesture + card physics

**Files:**
- Create: `app/(tabs)/(home)/swipe-to-share.tsx`

Pan gesture tracking, card tilt transform, haptic events, `onShare` callback. Share fires **after spring settles** via the `withSpring` completion callback. Uses `useSharedValue` (not `useRef`) for the committed flag so it's safe to read in worklets. Supports `useReducedMotion` — when enabled, tilt is disabled and share triggers on any upward swipe.

- [ ] **Step 1: Create the component file**

Create `app/(tabs)/(home)/swipe-to-share.tsx`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/swipe-to-share.tsx
git commit -m "feat: SwipeToShare skeleton — pan gesture, card tilt, haptics, a11y"
```

---

### Task 4: Add blur condensation stack

**Files:**
- Modify: `app/(tabs)/(home)/swipe-to-share.tsx`

8-layer `BlurView` condensation mirroring the banner blur. **Layer 0 = densest (intensity 100) at bottom, Layer 7 = faintest (intensity 15) at top** — matching the spec's "strongest blur closest to bottom" ordering.

- [ ] **Step 1: Add BlurView import and condensation layers**

Add to imports:

```typescript
import { BlurView } from "expo-blur";
```

Add `CondensationStack` sub-component before `SwipeToShare`:

```typescript
/* ------------------------------------------------------------------ */
/*  Condensation Stack — 8-layer brand blur mirror                     */
/* ------------------------------------------------------------------ */

// Ordered bottom→top: densest blur at bottom, faintest at top
// Mirrors banner blur dissolution but reversed direction
const BLUR_LAYERS = [
  { intensity: 100, opacity: 1.00 }, // bottom — full blur
  { intensity: 100, opacity: 0.90 },
  { intensity: 100, opacity: 0.80 },
  { intensity: 85,  opacity: 0.65 },
  { intensity: 70,  opacity: 0.50 },
  { intensity: 50,  opacity: 0.35 },
  { intensity: 30,  opacity: 0.25 },
  { intensity: 15,  opacity: 0.15 }, // top — faintest
] as const;

function CondensationStack({
  progress,
  accentColor,
}: {
  progress: Animated.SharedValue<number>;
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
```

Add styles to `s`:

```typescript
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
```

Replace `{/* Condensation zone — Task 4 */}` with:

```tsx
      <CondensationStack progress={progress} accentColor={accentColor} />
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/swipe-to-share.tsx
git commit -m "feat: 8-layer brand blur condensation stack (densest at bottom)"
```

---

### Task 5: Add Skia surface tension ripple shader

**Files:**
- Modify: `app/(tabs)/(home)/swipe-to-share.tsx`

Skia Canvas overlaid on the condensation stack. `RuntimeEffect.Make()` called inside `useMemo` to avoid top-level crash. Uniform `accent` passed as `[r, g, b]` array (not `vec()` which is 2D only). Canvas hidden when `reducedMotion` is true.

- [ ] **Step 1: Add Skia imports and ripple component**

Add to imports:

```typescript
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
```

Add `RippleCanvas` before `SwipeToShare`:

```typescript
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
  progress: Animated.SharedValue<number>;
  accentColor: string;
  width: number;
}) {
  // Compile shader inside component to avoid top-level Skia native init crash
  const source = React.useMemo(() => Skia.RuntimeEffect.Make(RIPPLE_SKSL), []);

  const time = useSharedValue(0);
  React.useEffect(() => {
    time.value = 0;
    time.value = withRepeat(withTiming(1000, { duration: 1000000 }), -1, false);
  }, []);

  // Parse hex to 0→1 floats
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
```

Add style:

```typescript
  rippleCanvas: {
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
```

Add to `SwipeToShare`: state for width + onLayout + conditional render:

```typescript
  const [cardWidth, setCardWidth] = React.useState(0);
```

Update root View:
```tsx
    <View
      style={s.root}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      accessibilityHint="Swipe up to share"
      accessibilityRole="button"
    >
```

Replace `{/* Ripple canvas — Task 5 */}` with:

```tsx
      {cardWidth > 0 && !reducedMotion && (
        <RippleCanvas progress={progress} accentColor={accentColor} width={cardWidth} />
      )}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/swipe-to-share.tsx
git commit -m "feat: Skia surface tension ripple shader (useMemo init, a11y guard)"
```

---

### Task 6: Add hint text + breathing pulse

**Files:**
- Modify: `app/(tabs)/(home)/swipe-to-share.tsx`

Three text states with cross-fading: "swipe up to share" → "Release to share" → "✓". Uses `accentColor` prop, not hardcoded blue.

- [ ] **Step 1: Add hint text and breathing pulse sub-components**

```typescript
/* ------------------------------------------------------------------ */
/*  Hint Text — three overlapping layers with cross-fade               */
/* ------------------------------------------------------------------ */

function HintText({
  progress,
  accentColor,
}: {
  progress: Animated.SharedValue<number>;
  accentColor: string;
}) {
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.3], [8, 0], Extrapolation.CLAMP) },
    ],
  }));

  // "swipe up" visible when progress < 0.6
  const swipeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.1, 0.55, 0.65], [0.5, 0.5, 0], Extrapolation.CLAMP),
  }));

  // "Release to share" visible when progress >= 0.6
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
  progress: Animated.SharedValue<number>;
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
```

Add styles:

```typescript
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
```

Replace `{/* Hint text — Task 6 */}` and `{/* Breathing pulse — Task 6 */}` with:

```tsx
      <HintText progress={progress} accentColor={accentColor} />
      <BreathingPulse progress={progress} accentColor={accentColor} />
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/swipe-to-share.tsx
git commit -m "feat: hint text cross-fade + breathing pulse for swipe-to-share"
```

---

### Task 7: Wire into Home screen

**Files:**
- Modify: `app/(tabs)/(home)/index.tsx`

Replace `ScrollView` wrapper with `SwipeToShare`. The pan gesture has `activeOffsetY([-10, 10])` set in Task 3, which prevents conflict with ScrollView's scroll recognizer — small scrolls go to ScrollView, deliberate upward drags go to the pan gesture.

- [ ] **Step 1: Add imports**

```typescript
import { shareCard } from "@/src/services/share";
import { SwipeToShare } from "./swipe-to-share";
```

- [ ] **Step 2: Add share handler**

Add inside `HomeScreen`, after existing callbacks:

```typescript
  const handleShare = useCallback(async () => {
    if (!card || !currentVersion) return;
    try {
      await shareCard(card, currentVersion, currentVersion.visibleFields as string[]);
    } catch (error) {
      Alert.alert("Share failed", "Please try again.");
    }
  }, [card, currentVersion]);
```

- [ ] **Step 3: Wrap ProfileCard in SwipeToShare**

Replace the `<ScrollView>` block with:

```tsx
      <ScrollView
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SwipeToShare
          accentColor={currentVersion.accentColor}
          onShare={handleShare}
        >
          <ProfileCard
            nameFont={nameFont}
            profile={card.profile}
            version={currentVersion}
          />
        </SwipeToShare>
      </ScrollView>
```

- [ ] **Step 4: Update L3 header**

Update `[INPUT]` in `index.tsx` to add `@/src/services/share shareCard` and `local swipe-to-share SwipeToShare`.

- [ ] **Step 5: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add app/\(tabs\)/\(home\)/index.tsx
git commit -m "feat: wire SwipeToShare into Home screen with shareCard action"
```

---

### Task 8: Update L2 docs

**Files:**
- Modify: `app/(tabs)/(home)/CLAUDE.md`

- [ ] **Step 1: Add swipe-to-share.tsx to members list**

Add after the `profile-card-editor.tsx` entry:

```
swipe-to-share.tsx:   Gesture-driven share — pan up card, blur condensation + Skia ripple, auto-triggers Share Sheet
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/\(home\)/CLAUDE.md
git commit -m "docs: add swipe-to-share to (home) L2 member list"
```

---

### Task 9: Manual device test

**Files:** none (testing only)

- [ ] **Step 1: Start the dev server**

Run:
```bash
npm start
```

- [ ] **Step 2: Test on iOS simulator/device**

Verify each state:
1. **IDLE**: breathing accent line pulses at card bottom
2. **DRAG**: card tilts up with perspective, blur layers rise (densest at bottom), hint "swipe up to share" fades in, ripple waves visible
3. **COMMITTED**: text cross-fades to "Release to share" with scale bounce, haptic medium fires once
4. **RELEASE (committed)**: card springs back first, THEN haptic success + Share Sheet opens after settle
5. **RELEASE (cancelled)**: haptic light after settle, no share
6. **FAST SWIPE**: quick upward flick (velocity < -800) triggers share after spring settle
7. **SCROLL**: small vertical scrolls still work (ScrollView handles them)

- [ ] **Step 3: Accessibility test**

Enable Reduce Motion in iOS Settings → Accessibility → Motion:
- Card should NOT tilt (rotateX stays 0)
- Skia ripple canvas should NOT render
- Condensation blur still shows (static, no waves)
- Share still triggers on swipe

Enable VoiceOver:
- Card wrapper announces "Swipe up to share" as hint

- [ ] **Step 4: Performance check**

Open Xcode Instruments or React DevTools profiler. Verify:
- 60fps during gesture drag (no frame drops)
- Skia canvas renders on GPU
- No JS thread blocking during animation
