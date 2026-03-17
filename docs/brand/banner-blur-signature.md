# Banner Blur — LinkCard Visual Signature

## Overview

The Banner Blur is LinkCard's defining visual element. A user-chosen photo sits at the top of their profile card and dissolves through a progressive gaussian blur into the card's white surface. No other digital business card app uses this pattern.

## Visual Structure

```
┌──────────────────────────────────┐
│          Clear photo             │  100% sharp
│                                  │
│ · · · · · · · · · · · · · · · · ·│  30% — blur begins
│     Light gaussian blur          │
│        Medium blur               │
│          Heavy blur              │
│            Full blur + white     │
├──────────────────────────────────┤  Seamless transition
│  Avatar                          │
│  Name                            │
│  Content...                      │
└──────────────────────────────────┘
```

The photo is not a background. It is a **surface that dissolves**. The user's world bleeds into their identity.

## Technical Implementation

### Architecture

Three layers composited inside a single container with `overflow: hidden` and `borderRadius: 24`:

```
Layer 0 (bottom):  Original photo — Image, position: absolute, 200px tall
Layer 1 (middle):  8× BlurView stack — progressive gaussian blur
Layer 2 (top):     LinearGradient — white fade overlay
```

### Layer 0: Photo

```tsx
<Image
  source={bannerUrl ? { uri: bannerUrl } : require("@/assets/default-banner.jpg")}
  style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200 }}
  resizeMode="cover"
/>
```

- `position: absolute` — does not push content down; content floats over it
- `resizeMode: cover` — fills width, crops height to maintain aspect ratio
- Default: bundled photo (Golden Gate Bridge); user can tap to replace via ImagePicker

### Layer 1: Progressive Blur

8 `BlurView` instances (from `expo-blur`) stacked with increasing `intensity` and `opacity`, each anchored to the bottom of the banner:

| Layer | Starts at | Intensity | Opacity | Effect |
|-------|-----------|-----------|---------|--------|
| 1 | 30% | 15 | 0.15 | Barely perceptible softening |
| 2 | 38% | 30 | 0.25 | Subtle blur entering |
| 3 | 46% | 50 | 0.35 | Details start to dissolve |
| 4 | 54% | 70 | 0.50 | Mid-level blur, shapes visible |
| 5 | 62% | 85 | 0.65 | Strong blur, colors only |
| 6 | 70% | 100 | 0.80 | Near-full blur |
| 7 | 78% | 100 | 0.90 | Full blur, faint color wash |
| 8 | 86% | 100 | 1.00 | Complete blur |

```tsx
<BlurView intensity={15}  tint="default" style={[s.blur, { top: "30%", opacity: 0.15 }]} />
<BlurView intensity={30}  tint="default" style={[s.blur, { top: "38%", opacity: 0.25 }]} />
<BlurView intensity={50}  tint="default" style={[s.blur, { top: "46%", opacity: 0.35 }]} />
<BlurView intensity={70}  tint="default" style={[s.blur, { top: "54%", opacity: 0.50 }]} />
<BlurView intensity={85}  tint="default" style={[s.blur, { top: "62%", opacity: 0.65 }]} />
<BlurView intensity={100} tint="default" style={[s.blur, { top: "70%", opacity: 0.80 }]} />
<BlurView intensity={100} tint="default" style={[s.blur, { top: "78%", opacity: 0.90 }]} />
<BlurView intensity={100} tint="default" style={[s.blur, { top: "86%", opacity: 1.0  }]} />
```

Each BlurView style:

```tsx
blur: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,    // always anchored to bottom
}
```

The `top` percentage determines where each layer begins. Because each layer covers from its start point to the bottom, and intensity/opacity increase monotonically, the visual result is a continuous blur gradient with no visible steps.

**Why 8 layers:** Fewer than 6 produces visible banding. More than 10 has diminishing returns and impacts scroll performance. 8 is the sweet spot.

**Why `tint: "default"`:** Adapts to light/dark mode automatically. In dark mode the blur tints slightly dark; in light mode it stays neutral.

### Layer 2: White Fade

```tsx
<LinearGradient
  colors={["transparent", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.8)", "rgba(255,255,255,1)"]}
  locations={[0, 0.4, 0.7, 1]}
  style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200 }}
/>
```

This sits on top of the blur stack and transitions the blurred colors into pure white. The card background is `secondarySystemGroupedBackground` (white in light mode), so the gradient's final stop matches seamlessly.

### Container

```tsx
card: {
  borderRadius: 24,
  borderCurve: "continuous",   // iOS superellipse
  overflow: "hidden",          // clips all layers to rounded corners
  paddingTop: 24,              // content starts below the blur zone
}
```

`overflow: hidden` is critical — it clips the absolute-positioned photo and blur layers to the card's rounded corners.

## User Interaction

Tapping the banner opens `expo-image-picker`:

```tsx
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
});
```

- 16:9 crop ratio matches the banner's wide aspect
- Stored as `profile.bannerUrl` in the card store
- Persisted via Zustand + AsyncStorage

## Dark Mode Considerations

- `BlurView tint="default"` automatically adjusts blur tint for dark mode
- The white gradient should switch to `rgba(0,0,0,...)` in dark mode (TODO)
- Card background color uses `PlatformColor("secondarySystemGroupedBackground")` which adapts automatically

## Performance

- 8 BlurView instances render as 8 native `UIVisualEffectView` layers on iOS
- Each is GPU-composited, not CPU-blurred
- No measurable impact on 60fps scrolling on iPhone 15 Pro / iPhone 17 Simulator
- The banner is static (no scroll-driven blur changes), so layers are composited once and cached

## Why This Works as a Brand Element

1. **Unique** — No competitor uses progressive blur dissolution on profile cards
2. **Personal** — Every user's card looks different based on their chosen photo
3. **Memorable** — "The app where your photo melts into the card" is instantly recognizable
4. **Native-feeling** — Blur is the foundational material of iOS (Control Center, Notification Center, Spotlight). Users subconsciously associate blur with quality Apple software
5. **Emotional** — A photo of your city, your office, your team creates warmth that a solid color gradient never can

## File Locations

- Implementation: `app/(tabs)/(home)/index.tsx` — `bannerWrap`, `bannerBlur`, `bannerFade` styles
- Default photo: `assets/default-banner.jpg`
- Avatar component: `src/components/shared/avatar.tsx`
