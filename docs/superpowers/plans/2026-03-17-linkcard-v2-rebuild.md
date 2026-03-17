# LinkCard v2 Frontend Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the entire frontend layer of LinkCard using Tailwind CSS v4 + NativeWind v5, Expo Router group routes with NativeTabs, and Apple HIG-compliant patterns — while preserving all business logic (stores, services, types, API).

**Architecture:** CSS-first styling via Tailwind, Apple semantic colors via CSS variables + platformColor(), NativeTabs for 3-tab navigation, group routes for shared stacks, all components wrapped via react-native-css useCssElement pattern. Glass surfaces via expo-glass-effect with runtime guards. Springs for user-initiated motion, easing for system transitions.

**Tech Stack:** Expo SDK 55, expo-router (NativeTabs + Stack), Tailwind CSS v4, NativeWind v5, react-native-css, react-native-reanimated 3.x, expo-glass-effect, expo-image (sf: symbols), Zustand (existing), Supabase (existing).

**Spec:** `docs/superpowers/specs/2026-03-17-linkcard-v2-rebuild.md`

---

## File Map

### New Files to Create

```
Infrastructure:
  metro.config.js                         — Metro + NativeWind config
  postcss.config.mjs                      — PostCSS with @tailwindcss/postcss
  src/css/global.css                      — Tailwind imports + platform fonts
  src/css/sf.css                          — Apple semantic colors as CSS vars
  src/css/glass.css                       — Glass material utility classes
  src/tw/index.tsx                        — CSS-wrapped RN components (View, Text, etc.)
  src/tw/image.tsx                        — CSS-wrapped expo-image
  src/tw/animated.tsx                     — CSS-wrapped Animated components
  src/lib/cn.ts                           — clsx + tailwind-merge utility
  src/lib/haptics.ts                      — Conditional haptic helpers
  src/lib/springs.ts                      — Global spring parameter constants
  src/lib/accent-colors.ts               — Accent color palette (extracted from design-system)
  src/lib/icons.tsx                       — Platform-adaptive icon component (SF Symbols iOS / Ionicons web)

Shared Components:
  src/components/shared/adaptive-glass.tsx — Glass wrapper with runtime guards + fallbacks
  src/components/shared/avatar.tsx         — Profile photo with initials fallback
  src/components/shared/qr-code.tsx        — QR code renderer

Card Components:
  src/components/card/card-display.tsx     — Main card renderer
  src/components/card/card-field.tsx       — Individual field renderer

Route Layouts:
  app/_layout.tsx                          — Root layout (onboarding gate + tabs)
  app/(tabs)/_layout.tsx                   — NativeTabs (Card, Share, Settings) — iOS
  app/(tabs)/_layout.web.tsx               — Web tab layout with Ionicons fallback
  app/(tabs)/(index,share)/_layout.tsx     — Shared Stack for card + share tabs
  app/onboarding/_layout.tsx              — Onboarding Stack

Screens:
  app/(tabs)/(index,share)/index.tsx      — Home: card display
  app/(tabs)/(index,share)/share.tsx      — Smart share
  app/(tabs)/(index,share)/editor.tsx     — Card editor (push from home)
  app/(tabs)/settings.tsx                 — Settings
  app/onboarding/index.tsx                — Auth (email + Google)
  app/onboarding/linkedin.tsx             — LinkedIn URL input
  app/onboarding/preview.tsx              — Profile preview + confirm
```

### Files to Modify

```
  package.json                            — Add new deps, add lightningcss resolution
  babel.config.js                         — Remove NativeWind v4 babel preset if present
  tsconfig.json                           — Verify @/ alias covers src/tw, src/css
  src/stores/cardStore.ts                 — Update import paths (colors → CSS vars)
```

### Files to Delete (Phase 3 cleanup)

```
  src/design-system/                      — Entire directory
  src/components/ui/                      — Duplicate Button, Input, Card, Avatar, AnimatedComponents
  src/components/modals/                  — ShareMenu, BackgroundPicker, AddBlockModal, AddTagModal, AddContactModal
  src/components/cards/                   — BusinessCard, CardCarousel
  src/components/qr/                      — QRCode (rebuilt in shared/)
  src/features/editor/                    — types, helpers, constants (merged into editor screen)
  app/auth.tsx                            — Replaced by onboarding/index.tsx
  app/glass-home.tsx                      — Replaced by (tabs)/index.tsx
  app/preview.tsx                         — Replaced by onboarding/preview.tsx
  app/onboarding.tsx                      — Replaced by onboarding/ directory
  app/share.tsx                           — Replaced by (tabs)/share.tsx
  app/settings.tsx                        — Replaced by (tabs)/settings.tsx
  app/versions.tsx                        — Merged into home tab
  app/editor.tsx                          — Replaced by (tabs)/(index,share)/editor.tsx
  app/+html.tsx                           — Evaluate if needed
  app/index.tsx                           — Replaced by (tabs)/index.tsx
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install NativeWind v5 + Tailwind CSS v4 dependencies**

```bash
npx expo install tailwindcss@^4 nativewind@5.0.0-preview.2 react-native-css@0.0.0-nightly.5ce6396 @tailwindcss/postcss tailwind-merge clsx
```

- [ ] **Step 2: Install expo-glass-effect**

```bash
npx expo install expo-glass-effect
```

- [ ] **Step 3: Add lightningcss resolution to package.json**

Add to `package.json`:
```json
{
  "resolutions": {
    "lightningcss": "1.30.1"
  }
}
```

- [ ] **Step 4: Run npm install to apply resolutions**

```bash
npm install
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install NativeWind v5, Tailwind CSS v4, glass-effect dependencies"
```

---

## Task 2: Create Config Files

**Files:**
- Create: `metro.config.js`
- Create: `postcss.config.mjs`
- Modify: `babel.config.js` (remove old NativeWind presets if present)

- [ ] **Step 1: Create metro.config.js**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
```

- [ ] **Step 2: Create postcss.config.mjs**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 3: Clean babel.config.js**

Read current `babel.config.js`. Remove any NativeWind-related presets. Keep only:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 4: Verify tsconfig.json has @/ alias**

Check that `tsconfig.json` paths include `"@/*": ["./*"]` so `@/src/tw`, `@/src/css` resolve.

- [ ] **Step 5: Commit**

```bash
git add metro.config.js postcss.config.mjs babel.config.js tsconfig.json
git commit -m "feat: configure Metro, PostCSS, and Babel for NativeWind v5"
```

---

## Task 3: Create CSS Foundation

**Files:**
- Create: `src/css/global.css`
- Create: `src/css/sf.css`
- Create: `src/css/glass.css`

- [ ] **Step 1: Create src/css/global.css**

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "./sf.css";
@import "./glass.css";

@media ios {
  :root {
    --font-sans: system-ui;
    --font-rounded: ui-rounded;
    --font-serif: ui-serif;
    --font-mono: ui-monospace;
  }
}

@media android {
  :root {
    --font-sans: normal;
    --font-rounded: normal;
    --font-serif: serif;
    --font-mono: monospace;
  }
}
```

- [ ] **Step 2: Create src/css/sf.css**

Full Apple semantic color system — copy exactly from PRD Section 3.5 `src/css/sf.css`. Includes:
- `light-dark()` fallbacks for web/Android
- `platformColor()` overrides in `@media ios` block
- `@layer theme { @theme { ... } }` for Tailwind integration
- All colors: sf-blue, sf-green, sf-red, sf-orange, sf-yellow, sf-gray (1-6), sf-text (1-3), sf-bg (1-3), sf-separator, sf-card, sf-card-border

- [ ] **Step 3: Create src/css/glass.css**

```css
@layer utilities {
  .glass-regular {
    background-color: rgba(255, 255, 255, 0.72);
  }

  .glass-thin {
    background-color: rgba(255, 255, 255, 0.6);
  }

  .glass-ultra-thin {
    background-color: rgba(255, 255, 255, 0.44);
  }

  @media (prefers-color-scheme: dark) {
    .glass-regular {
      background-color: rgba(30, 30, 30, 0.72);
    }

    .glass-thin {
      background-color: rgba(30, 30, 30, 0.6);
    }

    .glass-ultra-thin {
      background-color: rgba(30, 30, 30, 0.44);
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/css/
git commit -m "feat: create Tailwind CSS foundation with Apple semantic colors"
```

---

## Task 4: Create tw/ Wrapper Components

**Files:**
- Create: `src/tw/index.tsx`
- Create: `src/tw/image.tsx`
- Create: `src/tw/animated.tsx`

- [ ] **Step 1: Create src/tw/index.tsx**

Copy exactly from the expo-tailwind-setup skill. Components: View, Text, ScrollView, Pressable, TextInput, Link (with Trigger/Menu/MenuAction/Preview statics), useCSSVariable, AnimatedScrollView, TouchableHighlight.

All components use `useCssElement` from `react-native-css` to map `className` → `style`.

- [ ] **Step 2: Create src/tw/image.tsx**

Copy exactly from the expo-tailwind-setup skill. Wraps `expo-image` Image as `AnimatedExpoImage`, remaps `objectFit` → `contentFit` and `objectPosition` → `contentPosition`.

- [ ] **Step 3: Create src/tw/animated.tsx**

```tsx
import * as TW from "./index";
import RNAnimated from "react-native-reanimated";

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
};
```

- [ ] **Step 4: Commit**

```bash
git add src/tw/
git commit -m "feat: create CSS-wrapped component layer (tw/)"
```

---

## Task 5: Create Utility Libraries

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/lib/haptics.ts`
- Create: `src/lib/springs.ts`
- Create: `src/lib/accent-colors.ts`
- Create: `src/lib/icons.tsx`

- [ ] **Step 1: Create src/lib/cn.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create src/lib/haptics.ts**

```ts
import * as Haptics from "expo-haptics";

const isIOS = process.env.EXPO_OS === "ios";

export const haptic = {
  selection: () => isIOS && Haptics.selectionAsync(),
  light: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () =>
    isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    isIOS &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

- [ ] **Step 3: Create src/lib/springs.ts**

Global spring constants per to-spring-or-not-to-spring rules:
```ts
export const springs = {
  // User-initiated: button press, chip tap (fast settle)
  snappy: { stiffness: 500, damping: 30 },
  // User-initiated: card drag, carousel flick (preserves velocity)
  gesture: { stiffness: 500, damping: 30 },
  // UI feedback: scale bounce on success (more bounce)
  bouncy: { stiffness: 600, damping: 15 },
  // Settle: list items, stagger (gentle ease-in)
  gentle: { stiffness: 300, damping: 25 },
} as const;
```

- [ ] **Step 4: Create src/lib/accent-colors.ts**

Extract accent color palette (previously in design-system/tokens/colors.ts):
```ts
export const accentColors = {
  white: "#FFFFFF",
  black: "#1A1A1A",
  indigo: "#5856D6",
  violet: "#AF52DE",
  fuchsia: "#FF2D55",
  pink: "#FF2D55",
  rose: "#FF2D55",
  orange: "#FF9500",
  amber: "#FFCC00",
  emerald: "#34C759",
  teal: "#5AC8FA",
  cyan: "#5AC8FA",
  blue: "#007AFF",
  slate: "#8E8E93",
} as const;

export type AccentColorKey = keyof typeof accentColors;
```

- [ ] **Step 5: Create src/lib/icons.tsx**

Platform-adaptive icon component (SF Symbols on iOS, Ionicons on web):
```tsx
import { Image } from "@/src/tw/image";
import { Ionicons } from "@expo/vector-icons";

const isIOS = process.env.EXPO_OS === "ios";

interface IconProps {
  ios: string;       // SF Symbol name, e.g. "pencil"
  web: string;       // Ionicons name, e.g. "create-outline"
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ ios, web, size = 24, color, className }: IconProps) {
  if (isIOS) {
    return (
      <Image
        source={`sf:${ios}`}
        className={className}
        style={{ width: size, height: size, tintColor: color }}
      />
    );
  }
  return <Ionicons name={web as any} size={size} color={color} />;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/
git commit -m "feat: add utility libraries (cn, haptics, springs, accent-colors, icons)"
```

---

## Task 6: Create Shared Components

**Files:**
- Create: `src/components/shared/adaptive-glass.tsx`
- Create: `src/components/shared/avatar.tsx`
- Create: `src/components/shared/qr-code.tsx`

- [ ] **Step 1: Create adaptive-glass.tsx**

Runtime-guarded glass wrapper per expo-liquid-glass skill:
- Check `isGlassEffectAPIAvailable()` → render `GlassView`
- iOS fallback → `BlurView` from `expo-blur` (intensity 40)
- Android fallback → `View` with semi-transparent bg
- Accessibility: check `AccessibilityInfo.isReduceTransparencyEnabled()` → opaque fallback

Props: `className`, `children`, `intensity?` (for BlurView fallback), `style?`

- [ ] **Step 2: Create avatar.tsx**

Port logic from existing `src/components/ui/Avatar.tsx` but use Tailwind classes:
- Props: `source`, `name`, `size` (sm/md/lg/xl/2xl or number), `accentColor?`, `showBorder?`, `className?`
- Photo: `Image` from `@/src/tw/image` with `className="w-full h-full object-cover"`
- Fallback: LinearGradient with initials (keep `adjustColor` helper)
- Container: rounded-full with `boxShadow` (not legacy shadow)

- [ ] **Step 3: Create qr-code.tsx**

Port from existing `src/components/qr/QRCode.tsx`. Minimal wrapper around `react-native-qrcode-svg`. Use Tailwind for container styling.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/
git commit -m "feat: create shared components (AdaptiveGlass, Avatar, QRCode)"
```

---

## Task 7: Create Card Components

**Files:**
- Create: `src/components/card/card-display.tsx`
- Create: `src/components/card/card-field.tsx`

- [ ] **Step 1: Create card-field.tsx**

Renders a single card field (name, headline, company, etc.) with appropriate typography:
- Props: `field: string`, `value: string`, `fieldStyle?: FieldStyle`, `className?`
- Maps field names to Tailwind type classes (name → text-2xl font-bold, headline → text-base, etc.)
- Respects `fieldStyle` overrides from CardVersion

- [ ] **Step 2: Create card-display.tsx**

Port card rendering logic from existing `BusinessCard.tsx` and `glass-home.tsx`:
- Props: `profile: LinkedInProfile`, `version: CardVersion`, `qrCodeData: string`, `showQR?: boolean`, `className?`
- Renders visible fields using `CardField`
- Conditional QR code overlay (animated toggle)
- Avatar at top
- All styling via Tailwind classes
- Pure presentational — no state, no store access

- [ ] **Step 3: Commit**

```bash
git add src/components/card/
git commit -m "feat: create card display components"
```

---

## Task 8: Create Route Layouts

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/(index,share)/_layout.tsx`
- Create: `app/onboarding/_layout.tsx`

- [ ] **Step 1: Create root layout — app/_layout.tsx**

```tsx
import "@/src/css/global.css";

import { Stack } from "expo-router/stack";
import { useCardStore } from "@/src/stores/cardStore";

export default function RootLayout() {
  const card = useCardStore((s) => s.card);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!card ? (
        <Stack.Screen name="onboarding" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}
```

Note: Imports `global.css` at the root to activate Tailwind.

- [ ] **Step 2: Create tabs layout — app/(tabs)/_layout.tsx**

```tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(index,share)" href="/">
        <Icon sf="person.crop.rectangle" />
        <Label>Card</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(index,share)" segment="share" href="/share">
        <Icon sf="square.and.arrow.up" />
        <Label>Share</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

Note: Uses SF Symbols via `sf` prop. Exact NativeTabs API may need adjustment per SDK 55 docs — check `references/native-tabs.md` from expo-liquid-glass skill if build fails.

- [ ] **Step 3: Create shared stack — app/(tabs)/(index,share)/_layout.tsx**

```tsx
import { Stack } from "expo-router/stack";

export default function SharedStackLayout({ segment }: { segment: string }) {
  const screen = segment.match(/\((.*)\)/)?.[1] ?? "index";
  const titles: Record<string, string> = {
    index: "LinkCard",
    share: "Smart Share",
  };

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: "regular",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name={screen} options={{ title: titles[screen] }} />
      <Stack.Screen
        name="editor"
        options={{
          title: "Edit Card",
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
```

- [ ] **Step 4: Create web tab layout — app/(tabs)/_layout.web.tsx**

Web fallback for NativeTabs using `Tabs` from `expo-router/ui` with Ionicons:

```tsx
import { Tabs } from "expo-router/ui";
import { Ionicons } from "@expo/vector-icons";

export default function WebTabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(index,share)"
        options={{
          title: "Card",
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 5: Create onboarding layout — app/onboarding/_layout.tsx**

```tsx
import { Stack } from "expo-router/stack";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="linkedin" options={{ headerShown: true, title: "LinkedIn" }} />
      <Stack.Screen name="preview" options={{ headerShown: true, title: "Preview" }} />
    </Stack>
  );
}
```

- [ ] **Step 6: Verify navigation compiles**

```bash
npx expo start --clear
```

Expected: App starts without crash. If card is null → onboarding renders. If card exists → tabs render.

- [ ] **Step 7: Commit**

```bash
git add app/_layout.tsx app/\(tabs\)/ app/onboarding/
git commit -m "feat: create route layouts with NativeTabs, web fallback, and group routes"
```

---

## Task 9: Build Onboarding Screens

**Files:**
- Create: `app/onboarding/index.tsx` (Auth)
- Create: `app/onboarding/linkedin.tsx` (LinkedIn URL)
- Create: `app/onboarding/preview.tsx` (Profile preview)

- [ ] **Step 1: Build onboarding/index.tsx — Auth screen**

Features:
- Title: "The Professional Networking OS."
- Subtitle
- "Continue with Google" button (secondary, outlined, pill-shaped)
- Divider "OR"
- Email + Password inputs using `TextInput` from `@/src/tw`
- "Continue" primary button
- Footer links

All styled with Tailwind classes. Use `haptic.light()` on button press.
Centered layout, max-w-[480px], KeyboardAvoidingView.
On success: `router.push('/onboarding/linkedin')`.

- [ ] **Step 2: Build onboarding/linkedin.tsx — LinkedIn URL screen**

Features:
- Title: "Add your LinkedIn."
- LinkedIn URL input
- Back navigation via Stack header (show header on this screen)
- Fixed bottom bar with AdaptiveGlass + "IMPORT PROFILE" button
- Loading state: button spinner during API call
- Error state: inline error on input

Uses `fetchLinkedInProfile` from `@/src/services/linkedin`.
On success: `router.push('/onboarding/preview')` with profile data via params or temp store.

- [ ] **Step 3: Build onboarding/preview.tsx — Profile preview**

Features:
- Title: "Here's what we found"
- Profile card: avatar, name, job title + company, character tags, about, email
- Fixed bottom bar with AdaptiveGlass + "Go home" button
- Staggered entrance animations: `FadeInDown.delay(N * 60).springify()`

On "Go home": creates card via `createNewCard()`, sets in store, `router.replace('/(tabs)')`.

- [ ] **Step 4: Test onboarding flow end-to-end**

Clear AsyncStorage (or use fresh simulator). Verify:
1. App launches → onboarding auth screen
2. Enter email → push to linkedin screen
3. Enter LinkedIn URL → API call → push to preview
4. Tap "Go home" → card created → tabs appear

- [ ] **Step 5: Commit**

```bash
git add app/onboarding/
git commit -m "feat: build onboarding flow (auth, linkedin, preview)"
```

---

## Task 10: Build Home Screen

**Files:**
- Create: `app/(tabs)/(index,share)/index.tsx`

- [ ] **Step 1: Build home screen**

Features:
- ScrollView with `contentInsetAdjustmentBehavior="automatic"`
- CardDisplay component (hero, full width)
- Version selector: horizontal ScrollView of pill chips below card
- Quick action row: Edit (push to editor), Share (tab switch), QR toggle
- Avatar tap → toggle QR code overlay on card

All data from `useCardStore`. Version selection updates the displayed version.

Animations:
- Card: `FadeInDown.springify()` on mount
- QR toggle: Spring scale animation
- Version chip: `haptic.selection()` on tap

- [ ] **Step 2: Test home screen**

Verify card renders with profile data. Version switching works. QR toggle works. Edit button pushes to editor.

- [ ] **Step 3: Commit**

```bash
git add "app/(tabs)/(index,share)/index.tsx"
git commit -m "feat: build home screen with card display and version selector"
```

---

## Task 11: Build Share Screen

**Files:**
- Create: `app/(tabs)/(index,share)/share.tsx`

- [ ] **Step 1: Build share screen**

Features:
- ScrollView with `contentInsetAdjustmentBehavior="automatic"`
- Card preview (respects selected fields)
- Version selector chips (horizontal scroll)
- "WHAT TO SHARE" section: field toggle chips (accent bg when active, `haptic.selection()`)
- Quick action row: Copy Link, AirDrop, Wallet (circular icon buttons)
- "Share Card" primary button

Uses `RNShare.share()` for native share. Field toggles update local state.

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/(index,share)/share.tsx"
git commit -m "feat: build smart share screen with field toggles"
```

---

## Task 12: Build Editor Screen

**Files:**
- Create: `app/(tabs)/(index,share)/editor.tsx`

- [ ] **Step 1: Build editor screen**

Features:
- Push screen from home (Stack.Screen with `headerLargeTitle: false`)
- "Done" button in header right → `router.back()`
- Live card preview (compact, top of screen)
- Field visibility toggles (grouped list with Switch components)
- Background picker button → opens sheet

Sheets via Stack.Screen `presentation: "formSheet"`:
- Background picker: detents `[0.5, 1.0]`, grabber visible

Updates go through `useCardStore.updateVersion()`.

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/(index,share)/editor.tsx"
git commit -m "feat: build card editor with field toggles and background picker"
```

---

## Task 13: Build Settings Screen

**Files:**
- Create: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Build settings screen**

Features:
- ScrollView with `contentInsetAdjustmentBehavior="automatic"`
- Grouped sections (styled as insetGrouped list):
  - **SYNC**: Auto-sync toggle (system `Switch`), Sync Now row
  - **DATA**: Reset Card (destructive red text + icon)
- Footer: "LinkCard v1.0.0" + "Made with love"

Reset card: `Alert.alert()` confirmation → `clearCard()` → app navigates to onboarding (handled by root layout gate).

- [ ] **Step 2: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat: build settings screen with sync and reset"
```

---

## Task 14: Update Card Store Imports

**Files:**
- Modify: `src/stores/cardStore.ts`

- [ ] **Step 1: Update cardStore imports**

The store imports `accentColors` from the old design-system. Update to use the new lib file (created in Task 5):

```ts
// Before:
import { accentColors, AccentColorKey } from '@/src/design-system/tokens/colors';
// After:
import { accentColors, AccentColorKey } from '@/src/lib/accent-colors';
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/cardStore.ts
git commit -m "refactor: update cardStore import to use lib/accent-colors"
```

---

## Task 15: Delete Old Files

**Files:**
- Delete: All files listed in "Files to Delete" section above

- [ ] **Step 1: Delete old design system**

```bash
rm -rf src/design-system/
```

- [ ] **Step 2: Delete old UI components**

```bash
rm -rf src/components/ui/
rm -rf src/components/modals/
rm -rf src/components/cards/
rm -rf src/components/qr/
rm -rf src/features/
```

- [ ] **Step 3: Delete old screens**

```bash
rm -f app/auth.tsx app/glass-home.tsx app/preview.tsx app/onboarding.tsx
rm -f app/share.tsx app/settings.tsx app/versions.tsx app/editor.tsx
rm -f app/index.tsx app/+html.tsx
```

- [ ] **Step 4: Verify no broken imports**

```bash
npx tsc --noEmit
```

Fix any remaining import errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete old design system, duplicate components, and legacy screens"
```

---

## Task 16: Polish — Animations, Haptics, Glass

**Files:**
- Modify: All new screen files

- [ ] **Step 1: Audit all button interactions**

Every Pressable must have:
- `onPressIn`: spring scale to 0.97 + `haptic.selection()` or `haptic.light()`
- `onPressOut`: spring scale back to 1.0
- Spring config: `stiffness: 500, damping: 30`

- [ ] **Step 2: Audit all entering/exiting animations**

Per to-spring-or-not-to-spring rules:
- Entrances: `ease-out` (200ms) or spring for gesture-connected content
- Exits: `ease-in` (150ms) or spring
- List items: staggered FadeInDown with springify()
- No animation on typing, fast toggles, keyboard nav

- [ ] **Step 3: Audit all Glass surfaces**

Per expo-liquid-glass rules:
- Bottom action bars: AdaptiveGlass
- Tab bar: system NativeTabs handles this
- NOT on card surface, NOT on full-screen bg, NOT on settings list cells

- [ ] **Step 4: Dark mode verification**

Toggle device appearance. Verify:
- All text readable in both modes
- No hardcoded color values (search for `#` in screen files)
- Glass materials adapt properly
- Card backgrounds look correct

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "polish: add springs, haptics, glass surfaces, and dark mode"
```

---

## Task 17: Update Documentation (GEB Protocol)

**Files:**
- Modify: `CLAUDE.md` (L1)
- Create: New L2 CLAUDE.md files for new directories
- Delete: Old L2 files in deleted directories

- [ ] **Step 1: Update root CLAUDE.md**

Reflect new directory structure:
```
app/               — Expo Router screens (group routes + NativeTabs)
  (tabs)/          — Tab navigation (Card, Share, Settings)
  onboarding/      — 3-step onboarding flow
src/
  tw/              — CSS-wrapped components (View, Text, Image, etc.)
  css/             — Tailwind CSS + Apple semantic colors
  components/      — Shared UI components
    shared/        — AdaptiveGlass, Avatar, QRCode
    card/          — Card rendering (CardDisplay, CardField)
  lib/             — Utilities (cn, haptics, accent-colors)
  stores/          — Zustand stores (cardStore)
  services/        — Supabase, LinkedIn API, share, notifications, etc.
  types/           — TypeScript interfaces
api/               — Express + Vercel serverless API (unchanged)
```

Update tech stack, architecture decisions, dev instructions.

- [ ] **Step 2: Create L2 docs for new directories**

- `src/tw/CLAUDE.md`
- `src/css/CLAUDE.md`
- `src/components/shared/CLAUDE.md`
- `src/components/card/CLAUDE.md`
- `src/lib/CLAUDE.md`
- `app/(tabs)/CLAUDE.md`
- `app/onboarding/CLAUDE.md`

- [ ] **Step 3: Add L3 headers to all new files**

Every new `.tsx` / `.ts` file must have:
```
/**
 * [INPUT]: ...
 * [OUTPUT]: ...
 * [POS]: ...
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: update GEB documentation for v2 architecture"
```

---

## Task 18: Final Verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Start dev server**

```bash
npx expo start --clear
```

Expected: Compiles without error.

- [ ] **Step 3: Test full user flow**

1. Fresh state (clear AsyncStorage) → onboarding appears
2. Auth → LinkedIn URL → Profile preview → "Go home"
3. Home tab: card displays, version selector works, QR toggle works
4. Edit button → editor pushes, fields toggle, back to home
5. Share tab: card preview, field toggles, share button works
6. Settings tab: toggle, reset card → back to onboarding
7. Toggle dark mode → all screens correct

- [ ] **Step 4: No file > 300 lines check**

```bash
find app/ src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

Expected: No file exceeds 300 lines.

- [ ] **Step 5: No hardcoded colors check**

Search for hex colors in screen/component files (excluding css/ and lib/):
```bash
grep -rn '#[0-9A-Fa-f]\{3,6\}' app/ src/components/ src/tw/ --include="*.tsx" --include="*.ts"
```

Expected: Zero matches (all colors from CSS vars or Tailwind).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final verification — LinkCard v2 rebuild complete"
```
