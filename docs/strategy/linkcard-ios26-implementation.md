# LinkCard iOS 26 Implementation Spec
> Addendum to linkcard-redesign-spec.md
> Head of Design — Final decisions | 2026-03-17

This document is the **implementation-ready** technical spec for the LinkCard iOS 26 redesign. It synthesizes proposals from UX, UI, and Engineering, resolves all conflicts, and provides copy-paste code where applicable.

**Authority chain:** Redesign Spec > This Document > Individual Proposals.
Where this document contradicts a team proposal, this document wins.

---

## 1. NativeTabs Configuration

### 1.1 Root Tab Layout

```tsx
// app/(tabs)/_layout.tsx
/**
 * [INPUT]: expo-router NativeTabs SDK 55, Majesticons tab icon PNGs
 * [OUTPUT]: Tab layout — Card, Share, Settings with Liquid Glass on iOS 26+
 * [POS]: Tab navigator root — 3 tabs, minimizeBehavior, existing PNG icons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-creditcard.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label>Card</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(share)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-send.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label>Share</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-settings-cog.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### 1.2 Decisions & Rationale

| Decision | Value | Rationale |
|---|---|---|
| Icons | **Existing Majesticons PNGs** (kept as-is) | Already working, consistent brand. No SF Symbols migration needed. |
| `minimizeBehavior` | `"onScrollDown"` | iOS 26 signature — tab bar shrinks to floating glass pill on scroll |
| Labels | **Visible** (changed from `hidden`) | Redesign spec wireframe shows "Card / Share / Settings" text. iOS 26 minimize hides labels during scroll anyway. HIG: "one-word labels, never hide tabs" |
| Tab tintColor | System default (systemBlue) | Redesign spec does not customize tab tint |

### 1.3 ThemeProvider Requirement (MANDATORY)

`tabs.md` Common Issues #7: "Header buttons flicker when navigating between tabs — wrap in ThemeProvider." The root layout MUST include this:

```tsx
// app/_layout.tsx — root layout must wrap in ThemeProvider
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* existing layout content */}
    </ThemeProvider>
  );
}
```

### 1.4 Tab Stack Configurations (Unchanged)

All three tab stacks retain the exact same `screenOptions` — this is a proven configuration stored in project memory (`feedback_native_stack_large_title.md`):

```tsx
// app/(tabs)/(home|share|settings)/_layout.tsx — ALL THREE use this
<Stack
  screenOptions={{
    headerTransparent: true,
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerLargeStyle: { backgroundColor: "transparent" },
    headerTitleStyle: { color: PlatformColor("label") as unknown as string },
    headerLargeTitle: true,
    headerBlurEffect: "none",
    headerBackButtonDisplayMode: "minimal",
  }}
>
```

**Do not modify ANY property.** Deviation breaks large title collapse.

### 1.5 Tab Bar State Machine

```
             ┌─────────────┐
             │   EXPANDED   │  ← Default: full glass bar, icons + labels
             └──────┬───────┘
                    │ scroll down > 20pt
                    ▼
             ┌─────────────┐
             │  MINIMIZED   │  ← Floating pill, icons only
             └──────┬───────┘
                    │ scroll up OR tap tab area
                    ▼
             ┌─────────────┐
             │   EXPANDED   │
             └─────────────┘
```

All transitions are system-managed. No custom animation code.

### 1.6 ScrollView Requirements (ALL Tab Screens)

1. ScrollView is the **first direct child** of the screen component — no wrapper Views
2. `contentInsetAdjustmentBehavior="automatic"` — handles nav bar + tab bar insets
3. Pure RN `ScrollView` from `react-native` — no tw wrapper, no custom ScrollView
4. No SwiftUI `Host` components inside ScrollView
5. `contentContainerStyle` for padding, not `style` (prevents clipping)

---

## 2. Glass Material Map

### 2.1 Glass Surface Inventory

| Surface | Screen | glassEffectStyle | tintColor | Fallback (non-iOS 26) |
|---|---|---|---|---|
| Tab bar | All | System-managed | None (system) | System UITabBar blur |
| Version chip (selected) | Card tab | `"regular"` | `accentColor` | Opaque `accentColor` background |
| Share CTA button | Share tab | `"regular"` | `"#007AFF"` (systemBlue) | Opaque systemBlue background |
| Card surface | All | **NEVER** | N/A | Opaque `bg.card` |
| Settings groups | Settings | **NEVER** | N/A | Opaque `bg.card` |

### 2.2 Glass Budget Per Screen

| Screen | Glass Surfaces | Count | Status |
|---|---|---|---|
| Card tab | Tab bar + 1 selected chip | 2 | Well under limit |
| Share tab | Tab bar + Share CTA | 2 | Well under limit |
| Settings tab | Tab bar only | 1 | Minimal |
| Editor | None (pushed, tab bar hidden) | 0 | Clean |

**Limit: 5-6 GlassView compositing layers per screen.** All screens are well within budget.

### 2.3 REJECTED: Bottom Action Bar on Card Tab

UI proposed a floating glass action bar above the tab bar on Card tab. **REJECTED for three reasons:**

1. **Redesign spec explicitly prohibits it** (Section 4.1): "No floating action bar. It conflicts with the NativeTabs glass tab bar (two glass layers stacking at the bottom = visual noise + 17% screen space consumed)."
2. **Apple HIG anti-pattern**: "Prefer one dominant glass layer per region; avoid stacked blur stacks."
3. **Tab bar + action bar = 105pt** consumed at bottom — unacceptable for a card viewing screen.

Share actions live on the Share tab. Card tab has only: card display, version chips, Edit button in nav bar.

### 2.4 AdaptiveGlass Component (Updated)

```tsx
// src/components/shared/adaptive-glass.tsx
/**
 * [INPUT]: expo-glass-effect, expo-blur, react-native AccessibilityInfo
 * [OUTPUT]: AdaptiveGlass — runtime-guarded glass with tintColor + opaque fallback
 * [POS]: Shared wrapper — Liquid Glass iOS 26+, BlurView fallback, opaque Android
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useEffect, useState } from "react";
import { AccessibilityInfo, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

let GlassViewNative: any = null;
let isGlassEffectAPIAvailable: (() => boolean) | null = null;

try {
  const glassModule = require("expo-glass-effect");
  GlassViewNative = glassModule.GlassView;
  isGlassEffectAPIAvailable = glassModule.isGlassEffectAPIAvailable;
} catch {}

const isIOS = process.env.EXPO_OS === "ios";
const isWeb = process.env.EXPO_OS === "web";

interface AdaptiveGlassProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Glass tint color — on iOS 26+ tints glass, on fallback becomes opaque bg */
  tintColor?: string;
  /** Interactive glass surface (buttons, pressables). Mount-time only. */
  isInteractive?: boolean;
  intensity?: number;
}

export function AdaptiveGlass({
  children,
  style,
  tintColor,
  isInteractive,
  intensity = 40,
}: AdaptiveGlassProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (!isIOS) return;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency
    );
    return () => sub?.remove();
  }, []);

  // Opaque fallback: reduced transparency OR non-glass with tintColor
  if (reduceTransparency) {
    return (
      <View style={[{ backgroundColor: tintColor ?? "rgba(242,242,247,0.95)" }, style]}>
        {children}
      </View>
    );
  }

  // iOS 26+ with Glass API
  if (isIOS && isGlassEffectAPIAvailable?.()) {
    return (
      <GlassViewNative
        glassEffectStyle="regular"
        tintColor={tintColor}
        isInteractive={isInteractive}
        style={[{ borderCurve: "continuous" as any }, style]}
      >
        {children}
      </GlassViewNative>
    );
  }

  // iOS < 26: if tintColor provided, use opaque tint (version chips, CTA buttons)
  if (isIOS && tintColor) {
    return (
      <View style={[{ backgroundColor: tintColor }, style]}>
        {children}
      </View>
    );
  }

  // iOS < 26: no tint — BlurView with systemMaterial (auto dark mode)
  if (isIOS) {
    return (
      <BlurView
        intensity={intensity}
        tint="systemMaterial"
        style={[{ overflow: "hidden" as any }, style]}
      >
        {children}
      </BlurView>
    );
  }

  // Web — CSS backdrop-filter
  if (isWeb) {
    return (
      <View
        style={[
          {
            backgroundColor: tintColor ?? "rgba(255, 255, 255, 0.72)",
            // @ts-expect-error web-only CSS properties
            backdropFilter: tintColor ? "none" : "blur(40px) saturate(180%)",
            WebkitBackdropFilter: tintColor ? "none" : "blur(40px) saturate(180%)",
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android — opaque
  return (
    <View style={[{ backgroundColor: tintColor ?? "rgba(242,242,247,0.92)" }, style]}>
      {children}
    </View>
  );
}
```

**Key design decision:** When `tintColor` is provided but Liquid Glass is unavailable, the fallback is an **opaque background** in `tintColor`. This means:
- iOS 26: Version chip selected = translucent tinted glass (native feel)
- iOS 25: Version chip selected = opaque accent color (still correct, looks like a solid pill)
- Android: Opaque accent color

This is the correct degradation path.

---

## 3. Card Component Spec

### 3.1 Editorial Asymmetry Layout (Final)

```
┌─┬──────────────────────────────────────┐
│▌│  VISIONARY · BUILDER                 │  ← character pill (accent-tinted bg, caps, caption1)
│▌│                                      │
│▌│  Henry Zhao            ┌────────┐   │  ← name (28pt bold/black) + avatar (48pt)
│▌│  Founder & CEO         │ avatar │   │  ← job title (15pt semibold)
│▌│  Building the future   └────────┘   │  ← headline (15pt regular, secondaryLabel)
│▌│  of professional...                  │
│▌│                                      │
│▌│  henry@linkcard.app                  │  ← contact (caption1, systemBlue, tappable)
│▌│  +1 (415) 555-0123                   │
│▌│                                      │
│▌│  LinkCard ─────────── ● Professional │  ← bottom bar (hairline separator)
└─┴──────────────────────────────────────┘
```

### 3.2 Resolved Conflicts

| Conflict | UX Proposal | UI Proposal | Redesign Spec | **Final Decision** |
|---|---|---|---|---|
| Accent strip width | — | 4pt | 3pt | **3pt** — Redesign spec Section 5.4 explicitly overruled 4pt. 3pt reads well at all sizes. |
| Character display | — | Middot text (`V · B · M`) on card, pill tags below card | Pill tag inside card | **Pill tag inside card** — Redesign spec Section 5.4 item 3 explicitly kept the pill. The middot approach "looks like a subtitle, not a tag." |
| Template system | — | Two templates (Editorial + Centered) | Single CardDisplay, no TemplateConfig v1 | **Single template (Editorial)** — Redesign spec Section 7 Phase 1: "A single CardDisplay component with the editorial asymmetry layout is sufficient. Template system is a v1.2 concern." The Centered layout is deferred. |
| Card labels hidden | Labels hidden | — | Wireframe shows labels | **Labels visible** — See Section 1.2 |
| Font: DM Sans vs Cormorant | — | Cormorant Garamond | DM Sans | **DM Sans** — Redesign spec Section 5.2 chose DM Sans. Cormorant adds serif complexity not aligned with "professional identity" brand. |

### 3.3 CardDisplay Structure

```tsx
// src/components/card/card-display.tsx — structural outline

// Shell: flexDirection "row" — accent strip left + content right
<View style={styles.shell}>
  {/* Accent strip — 3pt wide, full height */}
  <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

  {/* Content area */}
  <View style={styles.content}>
    {/* Character pill — top, before name */}
    {vis("character") && profile.character && (
      <View style={[styles.characterPill, { backgroundColor: accentColor + "1F" }]}>
        <Text style={[styles.characterText, { color: accentColor }]}>
          {profile.character.toUpperCase()}
        </Text>
      </View>
    )}

    {/* Main row: text left, avatar right */}
    <View style={styles.mainRow}>
      <View style={styles.textColumn}>
        {vis("name") && <Text style={styles.name}>{profile.name}</Text>}
        {vis("headline") && profile.jobTitle && (
          <Text style={styles.jobTitle}>
            {profile.jobTitle}{profile.company ? ` at ${profile.company}` : ""}
          </Text>
        )}
        {vis("headline") && (
          <Text style={styles.headline} numberOfLines={2}>
            {profile.headline}
          </Text>
        )}
      </View>

      {vis("photoUrl") && (
        <Avatar
          source={profile.photoUrl}
          name={profile.name}
          size={compact ? 36 : 48}
          accentColor={accentColor}
        />
      )}
    </View>

    {/* Contact links — tappable, systemBlue */}
    <View style={styles.contactSection}>
      {vis("email") && profile.email && (
        <Text style={styles.contactLink} onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
          {profile.email}
        </Text>
      )}
      {vis("phone") && profile.phone && (
        <Text style={styles.contactLink} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
          {profile.phone}
        </Text>
      )}
      {vis("website") && profile.website && (
        <Text style={styles.contactLink} onPress={() => Linking.openURL(profile.website)}>
          {profile.website}
        </Text>
      )}
    </View>

    {/* Bottom bar */}
    <View style={styles.bottomBar}>
      <Text style={styles.bottomLabel}>LinkCard</Text>
      <View style={styles.bottomRight}>
        <View style={[styles.bottomDot, { backgroundColor: accentColor }]} />
        <Text style={styles.bottomLabel}>{version.name}</Text>
      </View>
    </View>
  </View>
</View>
```

### 3.4 Card StyleSheet Token Mapping

All colors use `PlatformColor` for automatic dark mode support:

| Element | Light | Dark | PlatformColor |
|---|---|---|---|
| Card surface | `#FFFFFF` | `#1C1C1E` | `secondarySystemGroupedBackground` |
| Name text | `#000000` | `#FFFFFF` | `label` |
| Job title | `#000000` | `#FFFFFF` | `label` |
| Headline | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | `secondaryLabel` |
| Contact links | `#007AFF` | `#0A84FF` | `systemBlue` |
| Bottom bar text | `#000000` | `#FFFFFF` | `label` |
| Separator | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` | `separator` |
| Overlay bg | `rgba(255,255,255,0.97)` | `rgba(255,255,255,0.97)` | Static (not PlatformColor — used in Reanimated Animated.View) |

**Critical constraint:** `PlatformColor` cannot be passed to Reanimated animated styles. The QR overlay uses static `rgba()` colors.

### 3.5 Card Dimensions

| Property | Full | Compact |
|---|---|---|
| Border radius | 24pt | 22pt |
| Padding | 20pt h, 20pt top, 16pt bottom | 16pt all |
| Accent strip | 3pt wide | 3pt wide |
| Avatar | 48pt | 36pt |
| Name size | 28pt Bold | 24pt Bold |
| Shadow | `0 12px 32px rgba(0,0,0,0.10)` | `0 8px 24px rgba(0,0,0,0.08)` |

---

## 4. Animation & Gesture Spec

### 4.1 Spring Configurations

```tsx
// src/lib/springs.ts
import { type WithSpringConfig } from "react-native-reanimated";

export const springs = {
  snappy: { stiffness: 500, damping: 30 } as WithSpringConfig,
  gesture: { stiffness: 400, damping: 25 } as WithSpringConfig,
  bouncy: { stiffness: 600, damping: 15 } as WithSpringConfig,
  gentle: { stiffness: 300, damping: 25 } as WithSpringConfig,
};
```

**Change from current:** `gesture` updated from 500/30 to 400/25 per redesign spec.

### 4.2 Per-Screen Animation Map

#### Card Tab

| Interaction | Animation | Spring | Haptic |
|---|---|---|---|
| Tap card → QR overlay | `ZoomIn.springify().stiffness(600).damping(15)` | bouncy | `medium` |
| Dismiss QR (tap) | `ZoomOut.duration(200)` | timing | `light` |
| Dismiss QR (swipe) | Pan gesture → interpolate scale/opacity | gesture | `light` at threshold |
| Tap version chip | Chip scale 0.95→1.0 + card `FadingTransition` | snappy | `selection` |
| Long press chip | System UIContextMenu | system | `medium` |
| Tap Edit | Stack push (system) | system | `light` |
| Pull to refresh | System UIRefreshControl | system | `light` at threshold |

#### Share Tab

| Interaction | Animation | Spring | Haptic |
|---|---|---|---|
| Tap Share CTA | Scale 0.98→1.0 + Share Sheet | snappy | `light` (press) + `success` (complete) |
| Tap Copy Link | Text swap "Copy Link"→"Copied!" (FadeIn 150ms) | timing | `success` |
| Tap QR | Same as Card tab QR overlay | bouncy | `medium` |

#### Settings Tab

| Interaction | Animation | Spring | Haptic |
|---|---|---|---|
| Toggle switch | System UISwitch | system | `selection` |
| Theme segment | System UISegmentedControl | system | `selection` |
| Accent color swatch | Scale 1.0→1.15→1.0 + checkmark FadeIn | snappy | `selection` |
| Reset Card | Alert.alert confirmation | system | `warning` (press) + `error` (confirm) |

#### Editor

| Interaction | Animation | Spring | Haptic |
|---|---|---|---|
| Field toggle | Live card preview update + FadingTransition | system | `selection` |
| Font weight segment | System UISegmentedControl | system | `selection` |
| Accent color | Same as Settings | snappy | `selection` |
| Done/Back | Stack pop (system) | system | `light` |
| Keyboard | `useAnimatedKeyboard()` paddingBottom | system | none |

### 4.3 QR Overlay Implementation

```tsx
// QR overlay entering/exiting
<Animated.View
  entering={ZoomIn.springify().stiffness(600).damping(15)}
  exiting={ZoomOut.duration(200)}
  style={[styles.overlay, overlayPanStyle]}
>
  <GestureDetector gesture={panGesture}>
    <View>
      <QRCode value={qrCodeData} size={compact ? 140 : 180} />
      <Text style={styles.overlayText} selectable>{qrCodeData}</Text>
    </View>
  </GestureDetector>
</Animated.View>
```

**Swipe-down dismiss gesture:**
```tsx
const translateY = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (e.translationY > 0) translateY.value = e.translationY;
  })
  .onEnd((e) => {
    if (e.translationY > 100 || e.velocityY > 500) {
      runOnJS(haptic.light)();
      runOnJS(setShowQR)(false);
    } else {
      translateY.value = withSpring(0, springs.snappy);
    }
  });

const overlayPanStyle = useAnimatedStyle(() => ({
  transform: [
    { translateY: translateY.value },
    { scale: interpolate(translateY.value, [0, 300], [1, 0.8], "clamp") },
  ],
  opacity: interpolate(translateY.value, [0, 300], [1, 0], "clamp"),
}));
```

**When QR overlay is visible, disable parent ScrollView:**
```tsx
<ScrollView scrollEnabled={!showQR} contentInsetAdjustmentBehavior="automatic">
```

### 4.4 Accessibility: Reduce Motion

| Normal | Reduced Motion |
|---|---|
| `ZoomIn.springify()` | `FadeIn.duration(200)` |
| `ZoomOut.duration(200)` | `FadeOut.duration(200)` |
| Spring scale on press | No scale, opacity only |
| `FadingTransition` | Instant swap |

### 4.5 Transition: Home → Editor

**Standard Stack push. NOT zoom transition.**

Rationale (from UX, approved):
- Edit button is a nav bar text item, not a visual zoom source
- Card is full-size → editor preview is compact (aspect ratio mismatch)
- Apple Settings/Contacts/every system app uses push for edit screens
- Zoom is for "expand this visual" — push is for "edit this thing"

---

## 5. Dark Mode Spec

### 5.1 Full Token Map

Every element has an explicit dark mode value via `PlatformColor`:

| Element | Token | Light | Dark |
|---|---|---|---|
| Screen background | `systemBackground` | `#FFFFFF` | `#000000` |
| Grouped background | `secondarySystemBackground` | `#F2F2F7` | `#1C1C1E` |
| Card surface | `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` |
| Primary text | `label` | `#000000` | `#FFFFFF` |
| Secondary text | `secondaryLabel` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` |
| Tertiary text | `tertiaryLabel` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` |
| Separator | `separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` |
| Accent blue | `systemBlue` | `#007AFF` | `#0A84FF` |
| Destructive red | `systemRed` | `#FF3B30` | `#FF453A` |
| Chip default bg | `systemGray6` | `#F2F2F7` | `#1C1C1E` |

### 5.2 Dark Mode Constraints

1. **Accent strip**: All 8 accent colors are visible on both light (#FFFFFF) and dark (#1C1C1E) card surfaces. No adjustments needed — Apple system tints are designed for both modes.

2. **Character pill**: `accentColor + "1F"` (12% opacity) works on both backgrounds. On dark, the pill is subtly tinted against #1C1C1E. Verified for all 8 accent colors.

3. **Avatar shadow**: Use `rgba(0,0,0,0.12)` on both modes. On dark backgrounds, this shadow is nearly invisible, which is correct — shadows on dark surfaces should be minimal.

4. **QR overlay**: Static `rgba(255,255,255,0.97)` in both modes. The overlay must be light for QR code scanning legibility regardless of app theme.

5. **Card hero shadow**: `0 12px 32px rgba(0,0,0,0.10)` in light, `0 12px 32px rgba(0,0,0,0.30)` in dark (higher opacity needed for visibility on dark backgrounds). Use `useColorScheme()` to select.

### 5.3 Hardcoded Colors That MUST Be Replaced

These exist in the current codebase and must become PlatformColor:

| File | Current | Replace With |
|---|---|---|
| `card-display.tsx` | `#111111` (name) | `PlatformColor("label")` |
| `card-display.tsx` | `#6B7280` (headline) | `PlatformColor("secondaryLabel")` |
| `card-display.tsx` | `#FFFFFF` (surface) | `PlatformColor("secondarySystemGroupedBackground")` |
| `card-display.tsx` | `rgba(0,0,0,0.06)` (separator) | `PlatformColor("separator")` |
| `version-chip.tsx` | `#F2F2F7` (chip bg) | `PlatformColor("systemGray6")` |

---

## 6. Version Chip Component

```tsx
// src/components/shared/version-chip.tsx
/**
 * [INPUT]: AdaptiveGlass, Pressable, PlatformColor, haptics
 * [OUTPUT]: VersionChip — glass pill for version switching
 * [POS]: Shared — horizontal scrollable version selector on Card tab
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { Pressable, Text, View, PlatformColor, StyleSheet } from "react-native";
import { AdaptiveGlass } from "@/src/components/shared/adaptive-glass";
import { haptics } from "@/src/lib/haptics";

interface VersionChipProps {
  name: string;
  accentColor: string;
  isSelected: boolean;
  isDefault: boolean;
  onPress: () => void;
}

export function VersionChip({
  name,
  accentColor,
  isSelected,
  isDefault,
  onPress,
}: VersionChipProps) {
  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  if (isSelected) {
    return (
      <AdaptiveGlass tintColor={accentColor} isInteractive style={styles.chip}>
        <Pressable onPress={handlePress} style={styles.chipInner}>
          {isDefault && <View style={styles.dotWhite} />}
          <Text style={styles.textSelected}>{name}</Text>
        </Pressable>
      </AdaptiveGlass>
    );
  }

  return (
    <Pressable onPress={handlePress} style={[styles.chip, styles.chipDefault]}>
      <View style={styles.chipInner}>
        {isDefault && <View style={[styles.dot, { backgroundColor: accentColor }]} />}
        <Text style={styles.textDefault}>{name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    borderRadius: 999,
    borderCurve: "continuous" as any,
  },
  chipDefault: {
    backgroundColor: PlatformColor("systemGray6") as unknown as string,
  },
  chipInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  dotWhite: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  textDefault: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: PlatformColor("label") as unknown as string,
  },
  textSelected: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
```

**Design decisions:**
- Selected: `AdaptiveGlass` with `tintColor={accentColor}` → Liquid Glass on iOS 26+, opaque accent on fallback
- Default: `PlatformColor("systemGray6")` — auto dark mode (light: #F2F2F7, dark: #1C1C1E)
- No `className` — SKILL.md: "CSS and Tailwind are not supported - use inline styles"
- `isInteractive` on selected chip only — Eng confirmed mount-time only, OK for chips
- Hit target: 40pt height + `hitSlop={{ top: 2, bottom: 2 }}` on Pressable = 44pt effective

---

## 7. Icon System

**No changes.** Existing Majesticons PNG/SVG icon system is retained as-is across all screens (tabs, settings rows, editor, share). No SF Symbols migration in v1.

---

## 8. Accent Color Palette (Final)

8 colors. No more, no less.

```
blue:    #007AFF    (systemBlue — default)
indigo:  #5856D6    (systemIndigo)
violet:  #AF52DE    (systemPurple)
pink:    #FF2D55    (systemPink)
orange:  #FF9500    (systemOrange)
emerald: #34C759    (systemGreen)
teal:    #5AC8FA    (systemTeal)
slate:   #8E8E93    (systemGray)
```

**REJECTED from UI proposal:** `amber` (#FFCC00 — poor contrast as chip text), `black` (#1A1A1A — not an accent), `white` (#FFFFFF — not an accent). Redesign spec Section 5.1 explicitly removed these.

---

## 9. Haptic Mapping (Complete)

Every user interaction produces haptic feedback. System transitions do not.

| Screen | Action | Haptic | Timing |
|---|---|---|---|
| Card | Tap card (QR) | `medium` | On press |
| Card | Tap version chip | `selection` | On press |
| Card | Long press chip | `medium` | On menu appear |
| Card | Tap Edit | `light` | On press |
| Card | Pull to refresh | `light` | At threshold |
| Card | Dismiss QR (tap) | `light` | On press |
| Card | Dismiss QR (swipe) | `light` | At dismiss threshold |
| Share | Tap Share CTA | `light` + `success` | Press-in + completion |
| Share | Tap Copy Link | `success` | After clipboard write |
| Share | Tap QR | `medium` | On press |
| Settings | Toggle switch | `selection` | On value change |
| Settings | Tap segment | `selection` | On press |
| Settings | Tap color swatch | `selection` | On press |
| Settings | Tap Reset | `warning` | On press |
| Settings | Confirm Reset | `error` | After confirmation |
| Editor | Toggle field | `selection` | On value change |
| Editor | Tap segment | `selection` | On press |
| Editor | Tap color | `selection` | On press |
| Editor | Tap Done | `light` | On press |

---

## 10. Migration Checklist

### Current → Target for Each File

| File | Current State | Target State | Phase |
|---|---|---|---|
| `app/(tabs)/_layout.tsx` | Labels hidden, no minimizeBehavior | Labels visible, add minimizeBehavior="onScrollDown" (keep existing PNG icons) | **0** |
| `app/_layout.tsx` | No ThemeProvider | Wrapped in ThemeProvider | **0** |
| `app/(tabs)/(share)/index.tsx` | Field toggles + share actions | Share actions only (remove field toggles) | **0** |
| `app/(tabs)/(home)/editor.tsx` | Basic editor | Add VISIBLE FIELDS section with field toggles | **0** |
| `src/components/card/card-display.tsx` | Center-aligned, hardcoded colors | Editorial asymmetry, PlatformColor, accent strip | **1** |
| `src/components/shared/adaptive-glass.tsx` | No tintColor, className, BlurView tint="light" | tintColor + opaque fallback, no className, tint="systemMaterial" | **1** |
| `src/components/shared/version-chip.tsx` | Does not exist | New file: glass chip with PlatformColor | **1** |
| `src/lib/springs.ts` | gesture = 500/30 | gesture = 400/25, WithSpringConfig types | **1** |
| `src/lib/icons.tsx` | Majesticons | **No change** | — |
| `app/(tabs)/(share)/_layout.tsx` | Title: "Smart Share" | Title: "Share" | **0** |

### Phase 0: IA + Share Simplification (2-3 days)
- Remove field toggles from Share tab
- Add field toggles to Editor
- NativeTabs: show labels + add minimizeBehavior (2 line changes)
- ThemeProvider in root layout

### Phase 1: Card Redesign (1 week)
- CardDisplay editorial asymmetry rewrite
- AdaptiveGlass tintColor update
- VersionChip extraction
- Springs update
- Dark mode PlatformColor migration

### Phase 2: Editor Enhancement (1 week)
- Live preview, version name, accent color, font weight
- Long-press context menu on version chips

### Phase 3: Polish & Ship (1 week)
- Accessibility (Reduce Motion, VoiceOver, touch targets)
- End-to-end dark mode verification
- All haptics mapped
- Quality bar checklist from redesign spec Section 7

---

## 11. Rejected Proposals

For the record — proposals that were submitted and explicitly rejected:

| Proposal | From | Reason |
|---|---|---|
| Bottom floating action bar on Card tab | UI | Violates redesign spec (Section 4.1), stacks glass on glass (HIG anti-pattern) |
| `amber`/`black`/`white` accent colors | UI | Removed in redesign spec (amber: poor contrast, black/white: not accents) |
| Accent strip 4pt | UI | Redesign spec overruled to 3pt (disproportionate at compact sizes) |
| Cormorant Garamond font | UI | Redesign spec chose DM Sans (geometric sans, not serif) |
| Two-template system v1 | UI | Redesign spec defers template system to v1.2 |
| Labels hidden on tabs | UX | Redesign spec wireframe shows labels; HIG says show labels |
| SF Symbols icon migration | Eng | Existing Majesticons PNGs work fine, no user-facing benefit to justify migration cost |
| `SymbolView` from `expo-symbols` | Eng | Not needed — keeping existing icon system |
| Middot character text (not pill) | UI (card internal) | Redesign spec kept pill tag (Section 5.4 item 3) |

---

*This spec is the bridge between design intent and code execution. Every decision is traceable to the redesign spec, Apple HIG, or Expo skill references. If a decision is not in this document, it was not made — ask the Head of Design before implementing.*
