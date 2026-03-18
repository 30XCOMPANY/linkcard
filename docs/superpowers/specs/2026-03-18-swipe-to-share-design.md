# Swipe-to-Share — Card Gesture Animation Spec

> Owner: Design + Motion Team | Status: Approved | Date: 2026-03-18

---

## 1. Overview

A gesture-driven share interaction on the Home screen. User pushes the card upward to reveal a branded condensation effect and trigger native Share Sheet — no button required.

**North Star:** Reduce friction on the primary value action (share) while reinforcing brand identity through motion.

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trigger | Hybrid (Pan + Velocity) | Slow drag gets full animation; fast swipe skips to share |
| Visual effect | Brand Blur Condensation + Surface Tension Ripple | Mirrors banner blur dissolution (brand signature); wave ripple adds physicality |
| Share trigger | No button — pure gesture + text hint "Release to share" | Minimal UI, gesture-native |
| Idle hint | Breathing pulse — accent line opacity 0.05↔0.12, 3s cycle | Subtle discovery affordance |
| Card physics | Translate + Tilt — perspective rotateX 0°→-5° following gesture | "Lifting to hand off" metaphor |

---

## 3. Interaction Flow

### 3.1 State Machine

```
IDLE → DRAGGING → COMMITTED → SHARE
                → CANCELLED → IDLE
```

### 3.2 States

**IDLE**
- Card at rest
- Breathing pulse: accent color line at card bottom, opacity oscillates 0.05↔0.12, 3s period
- No visible text hint

**DRAGGING** (pan gesture active, below threshold)
- Card: translateY follows finger 1:1, rotateX interpolates 0°→-5° based on progress, perspective(800)
- Condensation: 8-layer brand blur rises from bottom, height proportional to drag progress
- Surface tension ripple: wave bands overlay on blur layers, amplitude grows with progress
- Hint text: "↑ swipe up to share" fades in, opacity = progress × 0.6
- Breathing pulse: paused

**COMMITTED** (past threshold OR velocity exceeded)
- Threshold: translateY < -120pt OR velocityY < -800
- Hint text: changes to "↑ Release to share", opacity 1.0, scale bounce 1.0→1.05→1.0
- Haptic: `medium` impact fires once at threshold crossing
- Condensation: fully expanded, waves at peak amplitude

**SHARE** (finger released while committed)
- Hint text: "✓" briefly
- Haptic: `success`
- Card: spring back to rest (translateY 0, rotateX 0°)
- Condensation: collapses downward (reverse of rise)
- After spring settles: `shareCard()` fires → native Share Sheet opens
- Breathing pulse: resumes after share completes

**CANCELLED** (finger released before threshold)
- Card: spring back to rest
- Condensation: collapses
- Haptic: `light`
- Breathing pulse: resumes

---

## 4. Visual Effect — Brand Blur Condensation + Surface Tension

### 4.1 Brand Blur Base (8 Layers)

Exact mirror of banner blur dissolution. 8 layers of accent-tinted blur rise from card bottom:

| Layer | Position (from bottom) | Blur | Opacity | Effect |
|-------|----------------------|------|---------|--------|
| 1 | 87.5% | 1px | 0.15 | Faintest, covers most area |
| 2 | 75% | 2px | 0.25 | Subtle blur entering |
| 3 | 62.5% | 4px | 0.35 | Details start to soften |
| 4 | 50% | 6px | 0.50 | Mid-level blur |
| 5 | 37.5% | 8px | 0.65 | Strong blur |
| 6 | 25% | 10px | 0.80 | Near-full blur |
| 7 | 12.5% | 12px | 0.90 | Full blur |
| 8 | 0% (bottom) | 14px | 1.00 | Complete blur |

Each layer background: `rgba(accentColor, 0.04)` — the tint is subtle, the blur does the work.

Height of the entire blur stack animates from 0 to ~160pt based on gesture progress.

### 4.2 Surface Tension Ripple Overlay

Rendered via `@shopify/react-native-skia` Canvas overlaid on the blur stack.

**Wave parameters:**
- 6 concentric wave rings originating from bottom edge
- Frequency: 12→27 (increasing per ring)
- Phase: `time × 4 - ringIndex × 1.8` (creates staggered motion)
- Amplitude: exponential decay with distance from bottom × `(0.06 + ring × 0.008)`
- Horizontal variation: `1 + 0.2 × sin(x × 6 + ring × 2 + time × 0.7)` — not uniform like Material ripple
- Max opacity per pixel: 0.18 — thin watercolor layer, not a solid fill

**SkSL shader approach:**
```glsl
uniform float progress;   // 0→1 gesture progress
uniform float time;        // elapsed seconds
uniform float2 resolution;

half4 main(float2 pos) {
    float2 uv = pos / resolution;
    float fromBottom = 1.0 - uv.y;
    float maxH = progress * 0.8;
    if (fromBottom > maxH * 1.2) return half4(0);

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

    // Edge fade
    alpha *= smoothstep(0.0, 0.1, uv.x) * smoothstep(0.0, 0.1, 1.0 - uv.x);

    return half4(0.0, 0.478, 1.0, alpha); // accent blue
}
```

`progress` and `time` are Reanimated shared values passed as shader uniforms on the UI thread.

---

## 5. Breathing Pulse (Idle State)

- Accent color line at card bottom center
- Width: 50% of card width, centered
- Height: 1.5pt, border-radius: full
- Opacity: `withRepeat(withTiming(0.12, {duration: 1500}), -1, true)` — oscillates 0.05↔0.12
- Pauses when gesture begins, resumes when gesture ends
- Implementation: Reanimated `useAnimatedStyle` with repeating timing animation

---

## 6. Card Physics

### 6.1 Gesture Tracking

```typescript
const translateY = useSharedValue(0);
const gesture = Gesture.Pan()
  .onUpdate((e) => {
    translateY.value = Math.min(0, e.translationY); // only upward
  })
  .onEnd((e) => {
    const committed = translateY.value < -120 || e.velocityY < -800;
    if (committed) {
      // trigger share flow
      runOnJS(handleShare)();
    }
    translateY.value = withSpring(0, springs.gesture);
  });
```

### 6.2 Card Transform

```typescript
const cardStyle = useAnimatedStyle(() => {
  const progress = Math.min(1, Math.abs(translateY.value) / 120);
  return {
    transform: [
      { translateY: translateY.value },
      { perspective: 800 },
      { rotateX: `${interpolate(progress, [0, 1], [0, -5])}deg` },
    ],
  };
});
```

### 6.3 Haptic Events

| Event | Haptic | Trigger |
|-------|--------|---------|
| Cross threshold | `medium` | `progress` crosses 0.6 (checked via `runOnJS`) |
| Release → share | `success` | `onEnd` when committed |
| Release → cancel | `light` | `onEnd` when not committed |

---

## 7. Spring Configurations

Add to `src/lib/springs.ts`:

```typescript
// Share gesture: card spring-back after release
share: { stiffness: 400, damping: 28 },
```

---

## 8. File Impact

| File | Change |
|------|--------|
| `+ app/(tabs)/(home)/swipe-to-share.tsx` | New component: gesture handler + blur stack + Skia ripple canvas + hint text |
| `~ app/(tabs)/(home)/index.tsx` | Wrap `ProfileCard` in `SwipeToShare` |
| `~ src/lib/springs.ts` | Add `share` spring config |
| `~ package.json` | Add `@shopify/react-native-skia` |
| `  src/services/share.ts` | Existing — called via `shareCard()` |

---

## 9. Performance Budget

- Skia Canvas: single surface, GPU-rendered, 60fps
- Blur stack: 8 native `backdrop-filter` views (or 8 `BlurView` from expo-blur — already proven performant in banner)
- Gesture tracking: Reanimated UI thread, zero JS bridge calls during drag
- Shader uniforms: 2 floats (`progress`, `time`) updated per frame on UI thread

---

## 10. Accessibility

- VoiceOver: card announces "Swipe up to share" as accessibility hint
- Reduced Motion: skip tilt + ripple animation, just show condensation as static gradient; share triggers on simple swipe
- Haptics respect system haptic settings (already handled by `expo-haptics`)
