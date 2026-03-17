# LinkCard v2 — Complete Rebuild PRD

## 1. Product Vision

### What LinkCard Is

LinkCard is a **context-aware digital business card** that transforms your LinkedIn profile into a shareable, customizable identity artifact. It is the first impression you control — a professional networking OS that makes exchanging context effortless.

### What LinkCard Is NOT

- Not a contact manager (no CRM features)
- Not a social network (no feed, no followers)
- Not a resume builder (no long-form content)
- Not a general-purpose card maker (LinkedIn-first, always)

### One-Line Positioning

**"Your LinkedIn, distilled into a card you actually want to share."**

### Core Value Proposition

1. **Import** — Paste your LinkedIn URL, AI extracts and summarizes your professional identity
2. **Customize** — Choose templates, colors, and which fields to show for different contexts
3. **Share** — QR code, link, AirDrop, Apple Wallet — context-appropriate sharing

### Target User

**The Networker** — Attends conferences, meetups, and sales meetings regularly. Has a LinkedIn profile they keep updated. Wants to share their professional identity faster than "let me find your name on LinkedIn." Values design quality and native mobile experience.

- Age: 25-45
- Role: Sales, founder, VC, consultant, developer advocate, recruiter
- Behavior: Uses iPhone primarily, appreciates Apple-quality UX, shares cards 3-10 times per week
- Pain: LinkedIn exchange is slow, paper cards are dead, existing digital card apps feel cheap

---

## 2. UX Principles

### 2.1 Design Philosophy

**Deference.** The UI defers to the user's professional identity. The card IS the content — everything else is chrome that helps you build and share it. No competing visual noise, no decorative elements that don't serve the card.

**Clarity.** Every screen has ONE primary purpose. The user should never wonder "what do I do here?" Navigation is obvious. Actions are labeled with verbs. Empty states guide toward the next step.

**Depth.** Liquid Glass materials, spring-driven motion, and layered sheets create a spatial interface where the card lives center-stage and tools float above it when needed.

### 2.2 Interaction Design

Following Apple HIG + Disney's 12 Principles:

| Interaction | Timing | Animation | Haptic |
|---|---|---|---|
| Button press | 150ms | Spring scale(0.97) | `.selection` |
| Card swipe | Spring | `stiffness: 500, damping: 30` | `.impact(.light)` |
| Modal present | 250ms | `ease-out` (system sheet) | None (system) |
| Modal dismiss | 200ms | `ease-in` (system sheet) | None (system) |
| Tab switch | Instant | System native | `.selection` |
| Pull to refresh | Spring | Follow-through + settle | `.impact(.medium)` on trigger |
| Error state | 200ms | Shake `ease-out` | `.notification(.error)` |
| Success | 250ms | Scale bounce spring | `.notification(.success)` |
| Typing / fast input | 0ms | None | None |
| Toggle switch | 150ms | Spring | System built-in |

**Spring Selection Rule:** If the user's finger initiated the motion → spring. If the system initiated → easing curve. If it happens every keystroke → no animation.

### 2.3 Information Architecture

```
Onboarding (first launch only)
  └── Auth → LinkedIn URL → Profile Preview → Home

Home (tab: Card)
  ├── Card display (primary)
  ├── Version selector (horizontal chips)
  ├── Quick share actions
  └── Edit button → Editor (push)

Editor (push screen)
  ├── Field toggles
  ├── Style controls
  ├── Background picker (sheet)
  └── Add block (sheet)

Share (tab or push)
  ├── Card preview
  ├── Field selector
  ├── Share methods (QR, link, AirDrop, Wallet)
  └── Version selector

Settings (tab)
  ├── Sync controls
  ├── Theme
  └── Account / Reset
```

### 2.4 Screen Count (Minimal Viable)

| Screen | Purpose | Priority |
|---|---|---|
| `_layout.tsx` | Root layout with NativeTabs | P0 |
| `(tabs)/_layout.tsx` | Tab bar layout | P0 |
| `(tabs)/index.tsx` | Home — card display | P0 |
| `(tabs)/share.tsx` | Share screen | P0 |
| `(tabs)/settings.tsx` | Settings | P1 |
| `onboarding/index.tsx` | Auth step | P0 |
| `onboarding/linkedin.tsx` | LinkedIn URL input | P0 |
| `onboarding/preview.tsx` | Profile preview + confirm | P0 |
| `editor.tsx` | Card editor (push from home) | P0 |

**Total: 9 screens.** Current app has 11 screens with unclear boundaries. The rebuild consolidates `auth.tsx`, `onboarding.tsx` (1400 lines), and `preview.tsx` into a 3-step onboarding group route. `glass-home.tsx` and `versions.tsx` merge into the home tab.

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Current | v2 |
|---|---|---|
| Framework | Expo SDK 55 | Expo SDK 55 (keep) |
| Routing | expo-router (flat) | expo-router (group routes + NativeTabs) |
| Styling | StyleSheet.create + manual tokens | **Tailwind CSS v4 + NativeWind v5 + react-native-css** |
| Theme | Custom ThemeProvider + legacy aliases | **CSS variables + platformColor() + light-dark()** |
| Components | 2 duplicate sets (ui/ + design-system/) | **Single `src/tw/` CSS wrapper layer** |
| State | Zustand + AsyncStorage (keep) | Zustand + AsyncStorage (keep) |
| Icons | @expo/vector-icons (Ionicons) | **expo-image sf: symbols** |
| Shadows | RN legacy shadow props | **CSS boxShadow** |
| Glass | expo-blur (manual) | **expo-glass-effect + AdaptiveGlass wrapper** |
| API | Express + Vercel (keep) | Express + Vercel (keep) |

### 3.2 Directory Structure (v2)

```
app/
  _layout.tsx                 — Root: NativeTabs (Card, Share, Settings)
  (tabs)/
    _layout.tsx               — Tab group with Stack per tab
    (index,share)/
      _layout.tsx             — Shared Stack for card + share tabs
      index.tsx               — Home: card display
      share.tsx               — Smart share
      editor.tsx              — Card editor (push)
    settings.tsx              — Settings screen
  onboarding/
    _layout.tsx               — Stack for onboarding flow
    index.tsx                 — Auth (email + Google)
    linkedin.tsx              — LinkedIn URL input
    preview.tsx               — Profile preview + confirm

src/
  tw/                         — CSS-wrapped components (View, Text, etc.)
    index.tsx
    image.tsx
    animated.tsx
  css/
    global.css                — Tailwind imports + platform fonts
    sf.css                    — Apple semantic colors as CSS vars
    glass.css                 — Glass material utilities
  components/
    card/                     — Card rendering components
      card-display.tsx        — Main card renderer
      card-field.tsx          — Individual field renderer
      card-carousel.tsx       — Version carousel
    onboarding/
      profile-preview.tsx     — Profile data preview card
      capturing-view.tsx      — "Here's what we found" animation
    editor/
      field-toggle.tsx        — Toggle field visibility
      style-panel.tsx         — Typography/color controls
      background-picker.tsx   — Background selector (sheet)
    shared/
      adaptive-glass.tsx      — Glass wrapper with fallback
      avatar.tsx              — Profile photo with fallback
      qr-code.tsx             — QR code component
  stores/
    card-store.ts             — Zustand card state (migrated)
  services/                   — Keep all existing services
  types/                      — Keep all existing types
  lib/
    haptics.ts                — Conditional haptic helpers
    cn.ts                     — clsx + tailwind-merge utility

api/                          — Untouched
```

### 3.3 What We Keep (Unchanged)

- `api/` — Express + Vercel serverless API (all routes, services, scraper)
- `src/stores/cardStore.ts` — Zustand state (minor import path updates only)
- `src/services/*` — All services (supabase, linkedin, share, wallet, sync, notifications, emoji, offline)
- `src/types/*` — All TypeScript interfaces
- `app.json` — Expo config
- `vercel.json` — Deployment config

### 3.4 What We Delete

- `src/design-system/` — Entire directory (replaced by Tailwind + CSS vars)
- `src/components/ui/` — Duplicate Button, Input, Card, Avatar, AnimatedComponents
- `src/components/modals/` — Rebuilt as sheets in new architecture
- `src/components/cards/` — Rebuilt in `src/components/card/`
- `src/features/editor/` — Merged into new editor screen
- `src/constants/` — Already deleted in Phase 2, verify gone
- All current `app/*.tsx` screens — Replaced by new route structure

### 3.5 Tailwind Configuration

#### `src/css/global.css`
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

#### `src/css/sf.css` — Apple Semantic Colors
```css
:root {
  --sf-blue: light-dark(rgb(0 122 255), rgb(10 132 255));
  --sf-green: light-dark(rgb(52 199 89), rgb(48 209 89));
  --sf-red: light-dark(rgb(255 59 48), rgb(255 69 58));
  --sf-orange: light-dark(rgb(255 149 0), rgb(255 159 10));
  --sf-yellow: light-dark(rgb(255 204 0), rgb(255 214 10));
  --sf-gray: light-dark(rgb(142 142 147), rgb(142 142 147));
  --sf-gray-2: light-dark(rgb(174 174 178), rgb(99 99 102));
  --sf-gray-3: light-dark(rgb(199 199 204), rgb(72 72 74));
  --sf-gray-4: light-dark(rgb(209 209 214), rgb(58 58 60));
  --sf-gray-5: light-dark(rgb(229 229 234), rgb(44 44 46));
  --sf-gray-6: light-dark(rgb(242 242 247), rgb(28 28 30));
  --sf-text: light-dark(rgb(0 0 0), rgb(255 255 255));
  --sf-text-2: light-dark(rgb(60 60 67 / 0.6), rgb(235 235 245 / 0.6));
  --sf-text-3: light-dark(rgb(60 60 67 / 0.3), rgb(235 235 245 / 0.3));
  --sf-bg: light-dark(rgb(255 255 255), rgb(0 0 0));
  --sf-bg-2: light-dark(rgb(242 242 247), rgb(28 28 30));
  --sf-bg-3: light-dark(rgb(255 255 255), rgb(44 44 46));
  --sf-separator: light-dark(rgb(60 60 67 / 0.29), rgb(84 84 88 / 0.6));
  --sf-card: light-dark(rgb(255 255 255), rgb(28 28 30));
  --sf-card-border: light-dark(rgb(0 0 0 / 0.06), rgb(255 255 255 / 0.08));
}

@media ios {
  :root {
    --sf-blue: platformColor(systemBlue);
    --sf-green: platformColor(systemGreen);
    --sf-red: platformColor(systemRed);
    --sf-orange: platformColor(systemOrange);
    --sf-yellow: platformColor(systemYellow);
    --sf-gray: platformColor(systemGray);
    --sf-gray-2: platformColor(systemGray2);
    --sf-text: platformColor(label);
    --sf-text-2: platformColor(secondaryLabel);
    --sf-text-3: platformColor(tertiaryLabel);
    --sf-bg: platformColor(systemBackground);
    --sf-bg-2: platformColor(secondarySystemBackground);
    --sf-bg-3: platformColor(tertiarySystemBackground);
    --sf-separator: platformColor(separator);
    --sf-card: platformColor(secondarySystemGroupedBackground);
    --sf-card-border: platformColor(separator);
  }
}

@layer theme {
  @theme {
    --color-sf-blue: var(--sf-blue);
    --color-sf-green: var(--sf-green);
    --color-sf-red: var(--sf-red);
    --color-sf-orange: var(--sf-orange);
    --color-sf-yellow: var(--sf-yellow);
    --color-sf-gray: var(--sf-gray);
    --color-sf-gray-2: var(--sf-gray-2);
    --color-sf-gray-3: var(--sf-gray-3);
    --color-sf-gray-4: var(--sf-gray-4);
    --color-sf-gray-5: var(--sf-gray-5);
    --color-sf-gray-6: var(--sf-gray-6);
    --color-sf-text: var(--sf-text);
    --color-sf-text-2: var(--sf-text-2);
    --color-sf-text-3: var(--sf-text-3);
    --color-sf-bg: var(--sf-bg);
    --color-sf-bg-2: var(--sf-bg-2);
    --color-sf-bg-3: var(--sf-bg-3);
    --color-sf-separator: var(--sf-separator);
    --color-sf-card: var(--sf-card);
    --color-sf-card-border: var(--sf-card-border);
  }
}
```

---

## 4. Screen Specifications

### 4.0 Global Standards (apply to EVERY screen)

#### Accessibility
- Every `Text` displaying data: `selectable` prop enabled
- Every interactive element: minimum `44x44pt` hit target (enforced via `min-w-[44px] min-h-[44px]`)
- All images: `accessibilityLabel` describing content
- Decorative images: `accessibilityElementsHidden={true}`
- Grouped UI elements: `accessibilityElement children="combine"` where appropriate
- Dynamic Type: all text uses system font styles that scale (`text-base` = 17pt body, scales with user preference)
- Reduce Motion: check `useReducedMotion()` from Reanimated — replace springs with instant or `duration: 0` when enabled
- Reduce Transparency: `AccessibilityInfo.isReduceTransparencyEnabled()` — swap glass for opaque backgrounds
- Color contrast: WCAG AA minimum (4.5:1 normal text, 3:1 large text/UI components)

#### Touch Targets
```
Every Pressable, button, chip, toggle, icon-button:
  className="min-w-[44px] min-h-[44px]"
```

#### Spring Parameters (global constants in `src/lib/springs.ts`)
```ts
export const springs = {
  // User-initiated: button press, chip tap
  snappy: { stiffness: 500, damping: 30 },
  // User-initiated: card drag, carousel flick
  gesture: { stiffness: 500, damping: 30 },
  // UI feedback: scale bounce on success
  bouncy: { stiffness: 600, damping: 15 },
  // Settle: list items, stagger
  gentle: { stiffness: 300, damping: 25 },
} as const;
```

#### Platform Handling
- `process.env.EXPO_OS` not `Platform.OS` for all platform checks
- Web: `useWindowDimensions()` for responsive breakpoints, never `Dimensions.get()`
- iOS: haptics enabled, SF Symbols, platformColor(), GlassView
- Web: haptics silent, Ionicons fallback, light-dark() CSS, backdrop-filter fallback

---

### 4.1 Onboarding Flow

**Goal:** LinkedIn URL → AI-extracted profile → Home. Three steps, zero confusion.

**Navigation:** `app/onboarding/_layout.tsx` — Stack navigator, `headerShown: false` on auth, `headerShown: true` with system back on linkedin/preview.

#### Screen: `onboarding/index.tsx` — Auth

**Purpose:** Sign in or sign up. ONE action: enter credentials and continue.

**Layout:**
- iOS: single column, centered vertically, `max-w-[480px]`, `px-6`
- Web (>768px): 50/50 split — form left, visual panel right (Unicorn Studio or gradient bg)
- Web (≤768px): same as iOS, single column

**Elements (top → bottom):**
1. Logo image (`expo-image`, 200×100, centered)
2. Title: "The Professional Networking OS." — `text-3xl font-semibold tracking-tight text-sf-text text-center`
3. Subtitle: one sentence — `text-sm text-sf-text-2 text-center`
4. Spacer: `h-10`
5. "Continue with Google" — `Pressable` with:
   - `className="w-full h-[52px] rounded-full border border-sf-separator flex-row items-center justify-center gap-2"`
   - Icon: Ionicons `logo-google` (web) / SF Symbol `globe` (iOS)
   - Text: `text-xs font-medium tracking-wide text-sf-text`
   - `onPress`: `haptic.light()` + navigate
   - `onPressIn`: spring scale 0.97 (`springs.snappy`)
   - `onPressOut`: spring scale 1.0
6. Divider: `flex-row items-center gap-4 my-6` — line + "OR" + line
7. Email input: `TextInput` from `@/src/tw` with:
   - `textContentType="emailAddress"` (autofill)
   - `autoCapitalize="none"`, `keyboardType="email-address"`
   - Label: "EMAIL ADDRESS" — `text-xs font-medium uppercase tracking-widest text-sf-text-2`
   - Container: `bg-sf-card rounded-xl border border-sf-card-border px-4 py-3.5`
   - Focus: border animates to `border-sf-text` (200ms ease-out, NOT spring — system state change)
   - Error: border `border-sf-red` + error text below
   - **No animation on typing** (high-frequency rule)
8. Password input: same pattern, `textContentType="password"`, `secureTextEntry`
9. "Continue" button — `Pressable`:
   - `className="w-full h-[52px] rounded-full bg-sf-text items-center justify-center"`
   - Text: white/inverted, `text-xs font-medium tracking-wide`
   - Loading: replace text with `ActivityIndicator`
   - Disabled: `opacity-50` when email or password empty
   - `onPressIn`: spring scale 0.97 + `haptic.light()`
   - `onPressOut`: spring scale 1.0
10. Footer: "New to LinkCard?" + "Create Account" link — `text-sm text-sf-text-2`

**Transitions:**
- Form enters: `FadeIn.duration(400)` (system-initiated, NOT spring)
- On success: `router.push('/onboarding/linkedin')` — system Stack push animation

**Error handling:**
- Invalid email: inline error below input, `haptic.error()`, shake animation (200ms ease-out, translateX ±8px)

#### Screen: `onboarding/linkedin.tsx` — LinkedIn URL

**Purpose:** Enter LinkedIn URL. ONE input, ONE action.

**Navigation:** Stack header visible with system back button. Title: "LinkedIn".

**Elements:**
1. Title: "Add your LinkedIn." — `text-3xl font-semibold tracking-tight text-sf-text text-center`
2. Subtitle: "Link your LinkedIn, we'll do the rest." — `text-sm text-sf-text-2 text-center`
3. Spacer: `h-10`
4. LinkedIn URL input:
   - Label: "LINKEDIN URL" — same label style as auth
   - Placeholder: "https://linkedin.com/in/username"
   - `textContentType="URL"`, `autoCapitalize="none"`
   - Same focus/error animation as auth inputs
5. Fixed bottom bar:
   - `AdaptiveGlass` wrapper (position absolute bottom-0, left-0, right-0)
   - Content: `px-6 pt-4 pb-6 max-w-[480px] self-center w-full`
   - "IMPORT PROFILE" button — same style as "Continue" but text uppercase
   - Loading state: ActivityIndicator in button
   - `haptic.medium()` on press (higher impact — this triggers API call)

**Loading flow:**
1. User taps "IMPORT PROFILE"
2. `haptic.medium()`
3. Button shows spinner
4. `fetchLinkedInProfile(url)` API call
5. Success: `haptic.success()` + push to preview
6. Error: `haptic.error()` + inline error on input + shake

#### Screen: `onboarding/preview.tsx` — Profile Preview

**Purpose:** Show extracted data. Confirm and enter app.

**Navigation:** Stack header with back button. Title: "Preview".

**Elements:**
1. Section title: "Here's what we found" — `text-2xl font-semibold text-sf-text text-center`
2. Subtitle: "Your professional information has been captured" — `text-sm text-sf-text-2 text-center`
3. Profile card (`bg-sf-card rounded-2xl p-6 border border-sf-card-border` + `boxShadow`):
   - **Header row:** Avatar (72×72, `rounded-xl`) + Name + Job Title / Company
   - **Character tags section:** border-top separator, "Character" label, pill tags (`bg-sf-bg-2 rounded-full px-3 py-1`)
   - **About section:** border-top separator, "About" label, body text
   - **Contact section:** border-top separator, email text
4. Fixed bottom bar: same `AdaptiveGlass` pattern
   - "Go home" button
   - `haptic.success()` on press

**Animations (staggered entrance):**
```
Title:        FadeInDown.delay(100).springify()    — springs.gentle
Card:         FadeInDown.delay(200).springify()    — springs.gentle
Avatar:       FadeInDown.delay(260).springify()
Name:         FadeInDown.delay(320).springify()
Tags:         FadeInDown.delay(380).springify()
About:        FadeInDown.delay(440).springify()
Bottom bar:   FadeInUp.delay(500).springify()
```
All use `springs.gentle` (stiffness: 300, damping: 25) — these are system-presenting content, gentle settle.

**On "Go home":**
1. `haptic.success()`
2. `createNewCard(profile)` → `setCard()`
3. Smart theme selection (existing logic from current onboarding)
4. `router.replace('/(tabs)')` — root layout gate detects card → shows tabs

---

### 4.2 Home Tab — `(tabs)/(index,share)/index.tsx`

**Primary purpose:** Display and admire your card. The card is the hero.

**Navigation:** Stack header: "LinkCard" (large title). `headerLargeTitle: true`, `headerTransparent: true`, `headerBlurEffect: "regular"`.

**Layout:**
```
ScrollView (contentInsetAdjustmentBehavior="automatic")
  ├── Card Display (hero, full width with px-4 margin)
  ├── Version Selector (horizontal scroll, gap-2)
  ├── Quick Actions Row (centered, gap-4)
  └── Spacer (bottom safe area via ScrollView)
```

**Card Display:**
- `CardDisplay` component with full current version data
- Tap avatar → toggle QR code overlay
- **Long-press card → `Link.Preview`** (Apple anticipation principle — peek at share view)
- Card has `borderCurve: 'continuous'` for smooth corners
- `boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)"`

**Version Selector:**
- Horizontal `ScrollView` (no indicator), `contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}`
- Each chip: `Pressable` with:
  - `className="h-[40px] px-4 rounded-full flex-row items-center gap-2 min-w-[44px]"`
  - Selected: `bg-sf-card border-2 border-[${accentColor}]` + `boxShadow`
  - Unselected: `bg-sf-bg-2 border border-sf-card-border`
  - Accent dot: `w-2.5 h-2.5 rounded-full bg-[${version.accentColor}]`
  - Text: `text-sm font-medium` / `font-semibold` when selected
  - `onPress`: `haptic.selection()` + update version
  - `onPressIn/Out`: spring scale 0.97/1.0 (`springs.snappy`)

**Quick Actions Row:**
- 3 circular icon buttons (44×44pt each), centered:
  1. **Edit** — pushes to `/editor`
     - Icon: SF `pencil` (iOS) / Ionicons `create-outline` (web)
     - `haptic.light()`
  2. **Share** — switches to share tab (or `router.push('/share')`)
     - Icon: SF `square.and.arrow.up` / Ionicons `share-outline`
     - `haptic.light()`
  3. **QR** — toggles QR overlay on card
     - Icon: SF `qrcode` / Ionicons `qr-code-outline`
     - `haptic.medium()` (bigger action)
- Each button: `bg-sf-card rounded-full items-center justify-center` + `boxShadow: "0 1px 4px rgba(0,0,0,0.08)"`

**QR Toggle Animation:**
- QR appears: `ZoomIn.springify()` with `springs.bouncy` (stiffness: 600, damping: 15)
- QR disappears: `ZoomOut.duration(200)` (200ms ease-in — exit)
- Card content fades: `FadeOut.duration(150)` / `FadeIn.duration(200)`

**Gesture: Card Swipe (version carousel):**
- Wrap card in `PanGestureHandler` from react-native-gesture-handler
- Horizontal swipe → next/previous version
- Spring physics: `springs.gesture` with `velocity: gesture.velocityX`
- Follow-through: card overshoots slightly then settles (Disney follow-through principle)
- `haptic.light()` on version change

---

### 4.3 Share Tab — `(tabs)/(index,share)/share.tsx`

**Primary purpose:** Configure what to share, then share it. Contextual control.

**Navigation:** Stack header: "Smart Share" (large title).

**Layout:**
```
ScrollView (contentInsetAdjustmentBehavior="automatic")
  ├── Section: PREVIEW
  │   └── CardDisplay (compact, respects selected fields)
  ├── Section: CARD STYLE
  │   └── Version chips (horizontal scroll)
  ├── Section: WHAT TO SHARE
  │   └── Field toggle chips (wrapped flex)
  ├── Section: QUICK ACTIONS
  │   └── Icon buttons row
  └── Share Card button (full width)
```

**Section Headers:**
- Pattern: `text-xs font-semibold uppercase tracking-widest text-sf-text-2 mb-2`
- Consistent: every section uses this pattern

**Field Toggle Chips:**
- Wrapped `flex-row flex-wrap gap-2`
- Each chip: `Pressable` min 44pt height:
  - Selected: `bg-[${accentColor}20] border-[1.5px] border-[${accentColor}]`
  - Unselected: `bg-sf-bg-2/50 border border-sf-separator/20`
  - Icon + Label + Checkmark (when selected)
  - `onPress`: `haptic.selection()` + toggle field
  - `onPressIn/Out`: spring scale 0.97/1.0

**Quick Action Buttons:**
- 3 circular buttons centered:
  1. **Copy Link** — `haptic.success()` + clipboard
  2. **AirDrop** — `haptic.light()` (iOS only, hidden on web)
  3. **Wallet** — `haptic.light()` + wallet pass generation
- Each: 56×56pt circle, `bg-sf-card` + `boxShadow`, icon 24pt

**Share Card Button:**
- Full width, `h-[52px] rounded-full bg-sf-text`
- Icon + "Share Card" text
- `onPress`: `haptic.success()` + native `Share.share()` API
- Uses system share sheet (native on iOS, browser API on web)

**Sheet: QR Full-Screen**
- Triggered from card long-press or QR action
- `presentation: "formSheet"`, `sheetAllowedDetents: [0.75, 1.0]`, `sheetGrabberVisible: true`
- Large QR code centered
- Profile name + URL below
- "Copy Link" + "Save Image" actions

**Haptic Matrix for Share:**
| Action | Haptic | Why |
|---|---|---|
| Toggle field on/off | `.selection` | Light feedback for toggle |
| Version chip tap | `.selection` | Light feedback for selection |
| Copy Link | `.success` | Confirmation of copy |
| Share Card | `.success` | Confirmation of share |
| Wallet | `.light` | Initiating process |

---

### 4.4 Settings Tab — `(tabs)/settings.tsx`

**Primary purpose:** Account and sync management. Apple Settings app pattern.

**Navigation:** Stack header: "Settings" (large title). `headerLargeTitle: true`.

**Layout: Native Grouped List Pattern**

This screen must look and feel like Apple's Settings app. Use a `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` and manually construct the grouped list sections using the insetGrouped visual pattern:

```
ScrollView
  ├── Section: SYNC
  │   ├── Row: Auto-sync LinkedIn (with Switch)
  │   ├── Separator (inset, 1px, sf-separator)
  │   └── Row: Sync Now (with chevron)
  ├── Section: DATA
  │   └── Row: Reset Card (destructive red)
  └── Footer: version + attribution
```

**Section Container:**
```
className="bg-sf-card rounded-2xl overflow-hidden mx-4 mb-8"
style={{ borderCurve: 'continuous' }}
```

**Section Header:**
```
className="text-xs font-semibold uppercase tracking-widest text-sf-text-2 px-5 mb-2 mt-8"
```

**Row Pattern:**
```tsx
<Pressable className="flex-row items-center justify-between px-4 min-h-[44px] py-3">
  <View className="flex-1 gap-0.5">
    <Text className="text-base text-sf-text">{title}</Text>
    {subtitle && <Text className="text-sm text-sf-text-2">{subtitle}</Text>}
  </View>
  {/* Right accessory: Switch, chevron, or icon */}
</Pressable>
```

**Row Separator (inset):**
```
className="h-px bg-sf-separator ml-4"
```

**Controls:**
- Auto-sync: System `Switch` from React Native (has built-in spring + haptic)
- Sync Now: chevron right accessory, `haptic.light()` on press
- Reset Card: text `text-sf-red`, icon `trash-outline` in red, `haptic.heavy()` on press

**Reset Card Flow:**
1. Tap "Reset Card" → `haptic.heavy()`
2. `Alert.alert()` with Cancel + "Reset" (destructive)
3. On confirm → `clearCard()` → root layout detects null card → navigates to onboarding

**Footer:**
```
className="items-center gap-1 mt-4 pb-8"
```
- "LinkCard v1.0.0" — `text-xs text-sf-text-3`
- "Made with love" — `text-xs text-sf-text-3`

---

### 4.5 Editor — `(tabs)/(index,share)/editor.tsx`

**Primary purpose:** Customize your card. Native controls, live preview, physical feedback.

**Navigation:** Push from home. Stack header: "Edit Card" (inline, not large). "Done" button in header right → `router.back()`.

```tsx
<Stack.Screen options={{
  title: "Edit Card",
  headerLargeTitle: false,
  headerRight: () => (
    <Pressable onPress={() => { haptic.light(); router.back(); }}>
      <Text className="text-sf-blue text-base font-semibold">Done</Text>
    </Pressable>
  ),
}} />
```

**Layout:**
```
ScrollView (contentInsetAdjustmentBehavior="automatic")
  ├── Live Card Preview (compact, ~60% scale)
  ├── Section: VISIBLE FIELDS
  │   └── Grouped list of field rows with Switch toggles
  ├── Section: FIELD STYLES (per visible field)
  │   └── Grouped list: font picker, size slider, weight, color
  ├── Section: BACKGROUND
  │   └── Row: "Choose Background" → opens sheet
  └── Section: ADD BLOCK
      └── Row: "Add Content Block" → opens sheet
```

**Live Card Preview:**
- `CardDisplay` at ~60% scale within a padded container
- Updates live as toggles/styles change
- `layout` animation on field add/remove: `Layout.springify()` with `springs.gentle`
- Card container: `bg-sf-bg-2 rounded-2xl p-4 mx-4`

**Visible Fields Section:**
- Same grouped list pattern as Settings
- Each row: field name + System `Switch`
- Switch `onValueChange`: `haptic.selection()` + `updateVersion()`
- When a field is toggled on/off, card preview reflows with layout animation

**Field Styles Section (per visible field):**
- Only shows for fields that are toggled on
- Font picker: Segmented control (system `SegmentedControl` if available, else pills)
- Size: Stepper or small slider
- Weight: Segmented (Regular / Medium / Bold)
- Color: Preset circles + custom color picker button
- Every control change: `haptic.selection()` + live preview update

**Background Picker Sheet:**
```tsx
<Stack.Screen
  name="background-picker"
  options={{
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.5, 1.0],
    contentStyle: { backgroundColor: "transparent" },
  }}
/>
```
- Grid of gradient/color/image options
- Tap: `haptic.selection()` + `setCurrentGradient()`
- Selected: checkmark overlay + `border-2 border-sf-blue`
- Sheet drag: system spring physics (built-in)

**Add Block Sheet:**
- Same `formSheet` pattern
- List of addable blocks: Divider, Text, Link, Image
- Tap: `haptic.light()` + add component to card

**Animation Budget:**
| Interaction | Type | Config |
|---|---|---|
| Field toggle → card reflow | Layout spring | `springs.gentle` |
| Switch toggle | System | Built-in |
| Background change → card update | `FadeIn.duration(200)` | ease-out (system state change) |
| Sheet present/dismiss | System | expo-router formSheet |
| "Done" button press | Spring scale | `springs.snappy` |

---

### 4.6 Web-Specific Considerations

**File: `app/(tabs)/_layout.web.tsx`**

NativeTabs renders a basic tab bar on web. For a polished web experience, create a web-specific layout:

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

**Responsive breakpoints (all screens):**
- `< 768px`: mobile layout (single column, full width)
- `≥ 768px`: desktop layout (centered max-width container, optional side panels)

**Web-only glass fallback in `adaptive-glass.tsx`:**
```tsx
// Web: CSS backdrop-filter
<View
  className={className}
  style={[
    style,
    {
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    } as any,
  ]}
>
  {children}
</View>
```

**Icons (web fallback):**
- iOS: SF Symbols via `expo-image source="sf:name"`
- Web: `@expo/vector-icons` Ionicons (keep as dependency for web)
- Helper: `src/lib/icons.tsx` that exports a platform-adaptive icon component

---

## 5. Component Specifications

### 5.1 `src/tw/` — CSS Wrapper Layer

Exactly as specified in the expo-tailwind-setup skill. Components: View, Text, ScrollView, Pressable, TextInput, Image, Link, AnimatedScrollView, useCSSVariable.

### 5.2 `src/components/shared/adaptive-glass.tsx`

Liquid Glass wrapper following expo-liquid-glass skill:
- Check `isGlassEffectAPIAvailable()`
- Fallback: `BlurView` on iOS, semi-transparent View on Android
- Check `AccessibilityInfo.isReduceTransparencyEnabled()` for non-glass fallback
- Used for: bottom bars, floating buttons, chip backgrounds

### 5.3 `src/components/shared/avatar.tsx`

- Accepts `source` (URL or null), `name`, `size` (sm/md/lg/xl/2xl or number)
- Photo: `expo-image` with contentFit="cover", transition 300ms
- Fallback: gradient with initials
- Uses Tailwind classes, not StyleSheet

### 5.4 `src/components/card/card-display.tsx`

- Renders a business card from `BusinessCard` + `CardVersion`
- Respects `visibleFields` and `fieldStyles`
- Contains QR code overlay (toggle-able)
- Pure presentational — no state management

### 5.5 `src/lib/haptics.ts`

```typescript
import * as Haptics from 'expo-haptics';

const isIOS = process.env.EXPO_OS === 'ios';

export const haptic = {
  selection: () => isIOS && Haptics.selectionAsync(),
  light: () => isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => isIOS && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => isIOS && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => isIOS && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => isIOS && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

### 5.6 `src/lib/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 6. Animation Spec (to-spring-or-not-to-spring compliance)

### Springs (user-initiated motion)

| Component | Config | Use |
|---|---|---|
| Button press | `stiffness: 500, damping: 30` | Scale to 0.97 on pressIn, 1.0 on pressOut |
| Card drag/swipe | `stiffness: 500, damping: 30, velocity: gesture.velocity` | Card throw, carousel |
| Pull to refresh | Default system spring | ScrollView built-in |
| Toggle animation | System Switch component | Built-in spring |
| Sheet drag | System sheet presentation | Built-in by expo-router |

### Easing (system-initiated motion)

| Component | Duration | Curve | Use |
|---|---|---|---|
| Modal enter | 250ms | `ease-out` | System sheet presentation |
| Modal exit | 200ms | `ease-in` | System sheet dismissal |
| Page transition | 250ms | `ease-in-out` | Stack push/pop (system) |
| Toast enter | 200ms | `ease-out` | Error/success notification |
| Toast exit | 150ms | `ease-in` | Notification dismissal |

### No Animation

| Component | Reason |
|---|---|
| Text input / search | High-frequency — animation adds noise |
| Keyboard navigation focus | Must be instant |
| Tab content switch | System NativeTabs handles this |

---

## 7. Liquid Glass Spec (expo-liquid-glass compliance)

### Where to Use Glass

- **Tab bar** — NativeTabs provides this automatically on iOS 26+
- **Bottom action bars** — Onboarding CTA bars, share sheet actions
- **Floating buttons** — Quick action chips on home screen
- **Version selector chips** — Subtle glass backgrounds

### Where NOT to Use Glass

- **Card surface** — Card IS the content, not chrome
- **Full-screen backgrounds** — Glass needs content behind it to refract
- **Settings list cells** — Use standard grouped list backgrounds
- **Text content areas** — Legibility first

### Implementation

All glass surfaces use `AdaptiveGlass` wrapper:
1. iOS 26+ → `GlassView` with `glassEffectStyle="regular"`
2. iOS < 26 → `BlurView` intensity 40
3. Android → Semi-transparent View with background color

Accessibility gate: check `isReduceTransparencyEnabled()` → fallback to opaque.

---

## 8. Mobile Touch Spec (mobile-touch compliance)

### Disney Principles Applied

1. **Squash & Stretch** — Buttons compress to scale(0.97) on touch, spring back
2. **Anticipation** — Long-press on card shows preview (Link.Preview)
3. **Staging** — Sheets maintain context (home content visible behind)
4. **Follow Through** — Card carousel momentum after flick, stagger settle on lists
5. **Slow In / Slow Out** — All springs use `stiffness: 400-600, damping: 25-35`
6. **Secondary Action** — Every visual feedback paired with haptic (see table in 2.2)
7. **Timing** — Touch response <100ms, transitions 250ms, complex 350ms max
8. **Appeal** — 60fps minimum, gesture-driven animation connected to finger

### Touch Targets

All interactive elements: minimum 44x44pt. This includes:
- All buttons (including icon-only buttons)
- Toggle switches
- Version selector chips
- Field toggle chips
- Back buttons

---

## 9. Apple HIG Compliance (apple-hig-designer)

### Navigation

- **NativeTabs** for top-level (Card, Share, Settings) — 3 tabs, SF Symbols, one-word labels
- **Stack** inside each tab for drill-down
- **Large titles** on top-level views, inline titles on pushed views
- **System back button** — no custom back buttons
- **Sheets** for secondary flows (background picker, add block)

### Typography

- System font (San Francisco) everywhere — no custom fonts in v2
- Use Apple Dynamic Type scale: largeTitle, title, headline, body, subheadline, footnote, caption
- Support Dynamic Type scaling
- Minimum body text: 17pt

### Colors

- 100% semantic colors via CSS variables + platformColor()
- Zero hardcoded color values in component code
- Automatic dark mode via `light-dark()` CSS function
- WCAG AA contrast minimum on all text

### Spacing

- 8pt grid (Tailwind: p-2=8, p-4=16, p-6=24, p-8=32)
- `contentInsetAdjustmentBehavior="automatic"` on all ScrollViews
- Safe area handled by Stack headers + ScrollView insets — no manual padding

### Controls

- `Pressable` not TouchableOpacity (supports `pressed` state styling)
- System `Switch` for toggles
- System sheets via `presentation: "formSheet"` in Stack.Screen options
- `process.env.EXPO_OS` not `Platform.OS`

---

## 10. Migration Checklist

### Phase 0: Infrastructure (Day 1)

- [ ] Install NativeWind v5, react-native-css, tailwindcss v4, @tailwindcss/postcss, tailwind-merge, clsx
- [ ] Add lightningcss resolution to package.json
- [ ] Create metro.config.js with withNativewind
- [ ] Create postcss.config.mjs
- [ ] Create `src/css/global.css`, `src/css/sf.css`, `src/css/glass.css`
- [ ] Create `src/tw/index.tsx`, `src/tw/image.tsx`, `src/tw/animated.tsx`
- [ ] Create `src/lib/cn.ts`, `src/lib/haptics.ts`
- [ ] Create `src/components/shared/adaptive-glass.tsx`
- [ ] Verify Tailwind works: render a test View with className

### Phase 1: Skeleton (Day 1-2)

- [ ] Create new route structure: `app/_layout.tsx` (NativeTabs)
- [ ] Create `app/(tabs)/_layout.tsx` (Stack per tab)
- [ ] Create `app/(tabs)/(index,share)/_layout.tsx` (shared Stack)
- [ ] Create `app/onboarding/_layout.tsx` (Stack)
- [ ] Stub all 9 screens with basic content
- [ ] Verify navigation works: tabs, stack push/pop, onboarding flow

### Phase 2: Core Screens (Day 2-3)

- [ ] Build onboarding/index.tsx (auth)
- [ ] Build onboarding/linkedin.tsx (LinkedIn URL input)
- [ ] Build onboarding/preview.tsx (profile preview)
- [ ] Build (tabs)/index.tsx (home — card display)
- [ ] Build (tabs)/share.tsx (smart share)
- [ ] Build (tabs)/settings.tsx (settings)
- [ ] Build editor.tsx (card editor)
- [ ] Build shared components: avatar, card-display, card-field, qr-code

### Phase 3: Polish (Day 3-4)

- [ ] Add all animations (springs, entering, exiting)
- [ ] Add all haptics
- [ ] Implement Liquid Glass surfaces
- [ ] Dark mode verification (both appearances)
- [ ] Accessibility pass (VoiceOver, Dynamic Type, contrast)
- [ ] Delete old files: src/design-system/, src/components/ui/, src/components/modals/, old app screens

### Phase 4: Verify (Day 4)

- [ ] All screens render correctly
- [ ] Navigation flow: onboarding → home → editor → back
- [ ] Share flow works
- [ ] Card store persists across app restart
- [ ] LinkedIn API integration works
- [ ] No TypeScript errors
- [ ] Update CLAUDE.md (L1 + all L2s)

---

## 11. Success Criteria

1. **Zero duplicate components** — One implementation per pattern
2. **Zero hardcoded colors** — All colors from CSS vars / Tailwind theme
3. **Zero StyleSheet.create** — All styles via Tailwind className
4. **No file > 300 lines** — Enforced by architecture
5. **3-tab native navigation** — System NativeTabs with SF Symbols
6. **< 100ms touch response** — Spring animations, no layout thrashing
7. **Full dark mode** — Automatic via semantic colors
8. **Accessibility baseline** — VoiceOver navigable, Dynamic Type, WCAG AA contrast
