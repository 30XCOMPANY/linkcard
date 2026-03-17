# LinkCard Redesign Spec
> Designed by the LinkCard Design Team
> Final decisions by Head of Design | 2026-03-17

---

## 1. Product Vision

**LinkCard is a utility, not a social network.** Your LinkedIn, distilled into a card you actually want to share.

The product serves one job: take a LinkedIn profile, turn it into a beautiful card in 30 seconds, and make sharing it effortless. Every design decision in this spec optimizes for that job.

**North Star Metric:** Cards Shared Per Week (per user).

**What we are NOT building:** content feeds, messaging, social graphs, discovery, or community features. These are valid products — they are not LinkCard. If a feature doesn't make the card better or sharing faster, it doesn't ship.

**Competitive positioning:** Bonjour! builds identity FROM SCRATCH for a community. LinkCard builds identity FROM LINKEDIN for the world. Zero creative effort — LinkedIn data is the fuel, the app is the engine.

---

## 2. Design Principles

### 2.1 The Card IS The Product
Not the feed, not the settings, not the editor. The card. Every screen exists to serve the card — to create it, customize it, or share it. The card must be beautiful enough to screenshot, professional enough to print, and fast enough to share in 5 seconds.

### 2.2 System-Native, Not "React Native Pretending"
Feel like iOS, not a cross-platform app. `PlatformColor` for all colors. `NativeTabs` for Liquid Glass tab bar. SF Pro for UI chrome. Springs for all animations. Haptics on every interaction. If Apple's design review team wouldn't approve it, neither do we.

### 2.3 Content-First, Zero Decoration
Typography IS the design. No gradients on card backgrounds. No decorative shadows. No ornamental icons. Color comes from the accent system and the user's identity — not from the app's vanity. Every pixel serves the user's professional identity.

### 2.4 One Job Per Screen
7 screens, 3 tabs, 1 purpose. Each screen does exactly one thing. No screen tries to be two things. If you can't explain what a screen does in 5 words, it has too many responsibilities.

### 2.5 Sharing Is The Feature
Every share is a marketing impression. The shared card web page must be as beautiful as the in-app card. The share flow must be the shortest, most frictionless path in the entire app.

---

## 3. Information Architecture

### 3.1 Tab Structure: 3 Tabs (Final Decision)

```
┌─────────────────────────────────────────────┐
│                  LinkCard                    │
├─────────┬────────────────┬──────────────────┤
│  Card   │     Share      │    Settings      │
│ (Home)  │                │                  │
└─────────┴────────────────┴──────────────────┘
```

**3 tabs is correct and final.** UX proposed replacing Share with a Versions tab. This is rejected for three reasons:

1. **Version management is low-frequency.** Users create 2-3 versions, then rarely return to manage them. A tab for low-frequency activity wastes primary navigation real estate. Apple Wallet manages multiple cards without a dedicated "manage cards" tab.

2. **Share has legitimate complexity.** Sharing isn't just a button — users need to preview the card, choose share method (Share Sheet / QR / Copy Link / Wallet), and see what recipients will see. This warrants a dedicated screen.

3. **North Star alignment.** "Cards Shared Per Week" is the metric. A dedicated Share tab keeps sharing at one tap away, always. Demoting it to an inline action on Card tab adds friction to the primary value action.

**However, UX correctly identified a real problem:** the field toggles on Share tab duplicate the editor's field visibility controls. The fix is not to kill Share tab — it's to **remove field toggles from Share tab entirely.** Field visibility is a version-level setting, configured once in the editor, not adjusted per-share. Share tab becomes purely about the share action itself. (See Section 4.2.)

### 3.2 Screen Inventory: 7 Screens

```
Root Layout
├── onboarding/ (card === null)
│   ├── index.tsx (Auth)          — Sign in / create account
│   ├── linkedin.tsx              — Paste LinkedIn URL
│   └── preview.tsx               — Confirm + create card
│
└── (tabs)/ (card !== null)
    ├── (home)/
    │   ├── index.tsx             — Card hero + version chips + quick actions
    │   └── editor.tsx            — Push: field visibility, accent, style, version meta
    │
    ├── (share)/
    │   └── index.tsx             — Card preview + share actions (NO field toggles)
    │
    └── (settings)/
        └── index.tsx             — Account, sync, theme, data management
```

**7 screens. No more. Any screen added must justify removing another.**

### 3.3 Navigation Rules

- **Tab switch:** NativeTabs, system-managed, no custom transitions (NativeTabs is UIKit native — custom transitions are technically impossible)
- **Stack push:** Editor pushes from Home tab. All push transitions are system default.
- **Modal:** None. This app has no modal scenarios. Keep it simple.
- **Back:** System native back gesture / back button. No custom back behavior.
- **Deep link:** `linkcard://card` → Card tab, `linkcard://share` → Share tab

---

## 4. Screen-by-Screen Spec

### 4.1 Card Tab (Home)

**Job:** Show your card. Let you switch versions. Get to the editor.

```
┌─────────────────────────┐
│  LinkCard          Edit │  ← Large title collapse + nav bar
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   Card Display    │  │  ← Full-size, tap for QR overlay
│  │   (Current Ver.)  │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ┌──────┐┌──────┐┌────┐│
│  │ Pro ✓││ Net  ││Per ││  ← Version chips (horizontal scroll)
│  └──────┘└──────┘└────┘│
│                         │
└─────────────────────────┘
```

**Content hierarchy:**
| Priority | Element | Interaction |
|----------|---------|-------------|
| Primary | Full-size card display (default version) | Tap → toggle QR overlay |
| Secondary | Version chips (horizontal scroll) | Tap → switch displayed version |
| Tertiary | Edit button (nav bar right) | Push → Editor |

**Key interactions:**
- **Tap card** → QR overlay (spring ZoomIn, haptic `medium`). Tap again or swipe down to dismiss (ZoomOut 200ms).
- **Tap version chip** → Switch card version (crossfade animation, haptic `selection`). The chip uses Liquid Glass with `tintColor` on selected state.
- **Tap Edit** → Push editor for the currently displayed version (haptic `light`).
- **Pull to refresh** → Trigger LinkedIn re-sync (PM quality bar #8).
- **Long press version chip** → Context menu: Set as Default, Duplicate, Delete (haptic `medium` on long press).

**What's NOT on this screen:**
- No share buttons. Share tab is one tap away.
- No floating action bar. It conflicts with the NativeTabs glass tab bar (two glass layers stacking at the bottom = visual noise + 17% screen space consumed).
- No version management grid. Version chips with long-press context menu is sufficient for 2-5 versions. Full grid management is over-designed for v1.

**Empty state:** "No card yet. Complete onboarding to get started." — centered, `text.secondary`, `subheadline`.

### 4.2 Share Tab

**Job:** Preview your card as recipients will see it. Share it via any method.

```
┌─────────────────────────┐
│  Share                  │  ← Large title
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   Card Preview    │  │  ← Compact card display
│  │   (Default Ver.)  │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ╔═══════════════════╗  │
│  ║   Share Card      ║  │  ← Primary CTA (systemBlue, Liquid Glass)
│  ╚═══════════════════╝  │
│                         │
│     Copy Link · QR      │  ← Secondary actions
│                         │
└─────────────────────────┘
```

**Critical change from current:** Field toggles are REMOVED from Share tab. They were redundant with the editor's field visibility controls. Field visibility is now a version-level setting — you configure it once in the editor when you create/edit a version, and Share tab simply shows what that version looks like.

**This solves UX's duplication diagnosis without killing the Share tab.**

**Content hierarchy:**
| Priority | Element | Interaction |
|----------|---------|-------------|
| Primary | Compact card preview (default version) | Visual only — shows what recipients see |
| Primary | Share button (full-width CTA) | Tap → native Share.share() |
| Secondary | Copy Link | Tap → Clipboard.setString() + haptic `success` |
| Secondary | QR Code | Tap → expand QR overlay on card preview |
| Tertiary | Add to Wallet (future) | Tap → stub for v1.1 |

**Key interactions:**
- **Share button** — Full-width, systemBlue, Liquid Glass on iOS 26+. Haptic `success`. Calls `Share.share()` with card URL.
- **Copy Link** — Text button, systemBlue. Haptic `success`. Copies `card.qrCodeData` to clipboard. Shows brief "Copied" confirmation.
- **QR** — Text button. Triggers QR overlay on the compact card preview (same ZoomIn animation as Card tab).
- **No field editing.** If you want to change what's shown, go to Card tab → Edit → change field visibility for that version.

**Why this is better:**
- Single source of truth for field visibility (editor/version, not a per-share toggle state)
- Share tab is now 100% about the action of sharing — zero configuration, zero decision fatigue
- Fewer lines of code — no local `selectedFields` state, no `toggleField` callbacks, no field list rendering
- Faster user flow: open Share tab → tap Share → done

### 4.3 Settings Tab

**Job:** Account management, sync controls, app preferences.

```
┌─────────────────────────┐
│  Settings               │  ← Large title
│                         │
│  ┌───────────────────┐  │
│  │ [Avatar] Name     │  │  ← Account card (hero row)
│  │          Role     │  │
│  │          3 ver.   │  │
│  └───────────────────┘  │
│                         │
│  LINKEDIN               │
│  ┌───────────────────┐  │
│  │ Auto-Sync    [ON] │  │
│  │ Last synced: 2h   │  │
│  │ Sync Now      →   │  │
│  └───────────────────┘  │
│                         │
│  APPEARANCE             │
│  ┌───────────────────┐  │
│  │ Theme     System  │  │
│  │ Accent Color  ●   │  │
│  └───────────────────┘  │
│                         │
│  DATA                   │
│  ┌───────────────────┐  │
│  │ Reset Card    ⚠   │  │
│  └───────────────────┘  │
│                         │
│  App Version 1.0.0      │
└─────────────────────────┘
```

**Grouped list style** — Uses existing `SettingsGroup`, `SettingsRow`, `SettingsSectionHeader`, `SettingsSeparator` primitives. No new components needed.

**Sections:**
1. **Account card** — Hero row: 60pt avatar with accent ring, name (title2), headline (body, secondary), version count (subheadline, secondary). Tap → no action for v1 (future: account details).
2. **LinkedIn** — Auto-sync toggle, last synced timestamp, manual sync button.
3. **Appearance** — Theme picker (System / Light / Dark via SegmentedControl), accent color selector (ColorGrid).
4. **Data** — Reset Card (destructive, systemRed, confirmation alert before executing).
5. **Footer** — App version, centered, `text.tertiary`, `caption1`.

### 4.4 Editor (Push from Card Tab)

**Job:** Customize a single version — fields, style, identity.

```
┌─────────────────────────┐
│  ← Edit    Done         │  ← Nav bar with Cancel/Done
│                         │
│  ┌───────────────────┐  │
│  │  Card Preview     │  │  ← Compact, live-updating
│  │  (editing ver.)   │  │
│  └───────────────────┘  │
│                         │
│  VERSION                │
│  ┌───────────────────┐  │
│  │ Name    [Profess] │  │
│  └───────────────────┘  │
│                         │
│  VISIBLE FIELDS         │
│  ┌───────────────────┐  │
│  │ Name        [ON]  │  │
│  │ Headline    [ON]  │  │
│  │ Company     [ON]  │  │
│  │ Location    [ON]  │  │
│  │ Email       [OFF] │  │
│  │ Phone       [OFF] │  │
│  │ Website     [ON]  │  │
│  │ QR Code     [ON]  │  │
│  │ Character   [ON]  │  │
│  └───────────────────┘  │
│                         │
│  STYLE                  │
│  ┌───────────────────┐  │
│  │ Accent Color  ●   │  │
│  │ Name Weight  Bold │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

**Key change:** Field visibility toggles now live HERE, not on Share tab. This is the single source of truth for "what fields does this version show." The existing `CardVersion.visibleFields` array is the backing data — no new data model needed.

**Sections:**
1. **Live preview** — Compact CardDisplay at top, updates in real-time as toggles change.
2. **Version meta** — Version name (text input).
3. **Visible Fields** — Switch toggles for each field. Uses `SettingsGroup` + `SettingsRow` with `Switch` trailing. Haptic `selection` on every toggle.
4. **Style** — Accent color (ColorGrid), name font weight (SegmentedControl: Regular / Bold / Black).

**All changes persist immediately** via `updateVersion()` in cardStore (debounced 500ms sync to Supabase).

### 4.5 Onboarding (3 Screens)

**Job:** Auth → LinkedIn import → Card preview. Under 60 seconds.

**Structure unchanged.** 3-step flow is correct and meets PM's "Time to First Card < 60 seconds" target.

**Copy refinements:**
- Step 2 title: "Add your LinkedIn" → **"Paste your LinkedIn"** (more direct, more actionable)
- Step 2 subtitle: "Link your LinkedIn, we'll do the rest" → **"We'll turn it into a card in seconds"** (promises outcome)
- Step 3 CTA: "Go home" → **"See Your Card"** (stronger action language)
- Step 3 footer: Add "You can customize your card anytime" in `caption1`, `text.tertiary` (reduces perfectionism anxiety)

**No tutorial, no tooltip, no coach marks.** 3 tabs, one job per screen — the app is self-explanatory. If it needs a tutorial, the design has failed.

---

## 5. Visual Design System

### 5.1 Colors

**All colors derive from Apple's semantic system via `PlatformColor()`.** No hardcoded hex in UI chrome. Web fallbacks use `light-dark()` CSS.

#### Semantic Tokens

| Token | iOS PlatformColor | Light | Dark | Usage |
|---|---|---|---|---|
| `text.primary` | `label` | `#000000` | `#FFFFFF` | Names, headings |
| `text.secondary` | `secondaryLabel` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Headlines, meta |
| `text.tertiary` | `tertiaryLabel` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Timestamps, placeholders |
| `bg.primary` | `systemBackground` | `#FFFFFF` | `#000000` | Page background |
| `bg.secondary` | `secondarySystemBackground` | `#F2F2F7` | `#1C1C1E` | Grouped background |
| `bg.card` | `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` | Card surfaces, groups |
| `separator` | `separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` | Hairline dividers |
| `accent` | `systemBlue` | `#007AFF` | `#0A84FF` | CTA, links, active states |
| `destructive` | `systemRed` | `#FF3B30` | `#FF453A` | Delete, error |

#### Accent Color Palette (User-Selectable Card Theming)

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

**Removed from UI's proposal:** `amber` (#FFCC00), `black` (#1A1A1A), `white` (#FFFFFF). Amber has poor contrast as chip text. Black/white are not "accent" colors — they are backgrounds. 8 accent options is sufficient.

#### Accent-Derived Tints
- **Chip background (unselected accent-tinted):** `accentColor` at 12% opacity
- **Chip text:** `accentColor` at 100%
- **Card accent strip:** `accentColor` at 100%, 3pt wide (reduced from UI's 4pt — see 5.5)

### 5.2 Typography

**SF Pro (system-ui) for all UI chrome. No exceptions.** Custom fonts reserved for card content only.

#### UI Type Scale (Apple Dynamic Type)

| Style | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `largeTitle` | 34/41 | Bold | Screen titles (nav bar large title) |
| `title1` | 28/34 | Bold | Card name |
| `title2` | 22/28 | Bold | Section headings, account name |
| `headline` | 17/22 | Semibold | Row titles, emphasized body |
| `body` | 17/22 | Regular | Primary body text, settings rows |
| `subheadline` | 15/20 | Regular | Card headline, meta info |
| `footnote` | 13/18 | Regular | Section headers, timestamps |
| `caption1` | 12/16 | Regular | Contact details, badges |

#### Card-Specific Typography

| Element | Size | Weight | Notes |
|---|---|---|---|
| Name | 28pt | Bold (700) or Black (900) | User-configurable in editor |
| Job Title | 15pt | Semibold (600) | Secondary hierarchy |
| Headline | 15pt | Regular (400) | `text.secondary` |
| Company | 13pt | Semibold (600) | Optional uppercase |
| Location | 12pt | Regular (400) | `text.tertiary` |
| Character | 12pt | Medium (500) | Inside accent-tinted pill |

#### Editorial Typefaces (Card Content Only, v1 Limited)

- **System** (SF Pro) — default
- **DM Sans** — geometric modern alternative
- **JetBrains Mono** — developer/technical identity

**Removed:** Cormorant Garamond. Engineering flagged bundle size (~200KB per font). 3 fonts is the limit for v1. System + 1 sans + 1 mono covers the identity spectrum.

### 5.3 Spacing

**Base unit: 4pt.** All spacing is a multiple of 4.

```
4    — micro (icon-to-text inline)
8    — tight (chip gap, tag gap)
12   — compact (chip internal padding)
16   — standard (screen horizontal padding, card internal, group horizontal)
20   — comfortable (card surface padding)
24   — section gap (between related sections)
32   — major gap (between unrelated sections)
```

#### Layout Constants (HIG-Derived)

| Constant | Value | Usage |
|---|---|---|
| Screen horizontal padding | 16pt | All screens |
| Section gap (settings) | 35pt | Between grouped list sections |
| Row min height | 44pt | Minimum tap target (HIG) |
| Row vertical padding | 11pt | Settings row top/bottom |
| Separator inset (plain) | 16pt | Standard |
| Separator inset (icon) | 56pt | After icon-leading row |

#### Card Internal Layout

```
Padding:              20pt horizontal, 20pt top, 16pt bottom
Padding (compact):    16pt all sides
Avatar margin-bottom: 12pt
Name to headline:     4pt
Headline to tag:      12pt
Bottom bar margin-top: 20pt
Bottom bar border-top: 0.5pt hairline
```

### 5.4 Components

#### Hero Business Card (Redesigned)

**Direction: Editorial asymmetry.** Accepted from UI proposal with modifications.

```
┌─┬──────────────────────────────────────┐
│▌│  VISIONARY · BUILDER                 │  ← character line (caps, caption1, secondary)
│▌│                                      │
│▌│  Henry Zhao            ┌────────┐   │  ← name (28pt bold) + avatar (48pt, right)
│▌│  Founder & CEO         │ avatar │   │  ← job title (15pt semibold)
│▌│  Building the future   └────────┘   │  ← headline (15pt regular, secondary)
│▌│  of professional...                  │
│▌│                                      │
│▌│  henry@linkcard.app                  │  ← contact details (caption1, systemBlue, tappable)
│▌│  +1 (415) 555-0123                   │
│▌│                                      │
│▌│  LinkCard ─────────── ● Professional │  ← bottom bar
└─┴──────────────────────────────────────┘
```

**Key design decisions on the card:**

1. **Left-aligned text, right-aligned avatar.** Centers feel like greeting cards. Left-alignment feels like a masthead. The asymmetric tension between text and avatar creates visual energy.

2. **Accent strip: 3pt (not 4pt).** UI proposed 4pt. In compact card mode (thumbnails, share preview), 4pt is visually disproportionate. 3pt is visible at all sizes without dominating. Uses `accentColor` at 100%.

3. **Character line stays as pill tag (not middot-separated text).** UI proposed switching to `Visionary · Builder · Mentor` as typographic text. I reject this. The pill tag (`[ Visionary Builder ]`) with accent-tinted background is:
   - More scannable (colored background draws the eye)
   - Potentially interactive in future (tap to edit character)
   - Consistent with chip/tag visual language used elsewhere in the app
   - The middot approach looks like a subtitle, not a tag — it loses its identity as a distinct element

4. **Contact details as tappable links.** Email, phone, website rendered in `caption1`, `systemBlue`. Each is tappable (mailto:, tel:, https:). Only shown if field is in `visibleFields`.

5. **Card surface: opaque white.** Never glass, never gradient. Content legibility is paramount. Color comes from accent strip + accent-tinted elements.

6. **Dark mode card: opaque dark** (`bg.card` semantic color). Accent strip and tinted elements remain visible.

7. **Avatar sizing:**
   - Full card: 48pt (UI proposed this — correct balance with 28pt name)
   - Compact card: 36pt
   - If no photo: gradient fallback with initials

8. **QR overlay:** Animated (ZoomIn spring), frosted white (97% opacity), centered QR code + selectable URL below. Dismiss on tap or swipe down.

#### Version Chips

| Property | Value |
|---|---|
| Height | 40pt |
| Horizontal padding | 16pt |
| Gap | 8pt |
| Border radius | full (pill) |
| Background (default) | `#F2F2F7` (systemGray6) |
| Background (selected) | Liquid Glass with `tintColor: accentColor` |
| Text | 15pt, Medium (500); Semibold (600) when selected |
| Text color (selected) | `#FFFFFF` |
| Dot | 10pt circle, `accentColor` (default) / `#FFFFFF` (selected) |

#### Buttons

**Primary CTA** (Share button):
```
Height: 50pt, Radius: 25pt, Background: systemBlue (Liquid Glass on iOS 26+)
Text: 17pt semibold white, Icon: 18pt white leading
Press: opacity 0.85 + spring scale 0.98, Haptic: success
```

**Secondary** (Copy Link, QR):
```
Height: 44pt, Background: transparent
Text: 15pt medium, systemBlue
Press: opacity 0.5, Haptic: light
```

**Tertiary** (nav bar Edit/Done):
```
Height: 44pt (tap target), Text: 17pt regular, systemBlue
Press: opacity 0.5
```

**Destructive** (Reset Card):
```
Same as primary but systemRed background, white text
Requires confirmation alert before action
```

#### Settings Rows

Apple Settings pattern. Uses existing `SettingsGroup`, `SettingsRow`, `SettingsSectionHeader`, `SettingsSeparator` primitives. No changes needed.

- Min height: 50pt (exceeds 44pt tap target)
- Leading icon: 28pt container, 16pt icon
- Title: 17pt body, `text.primary`
- Trailing: chevron / switch / value text
- Account card hero row: 96pt height, 60pt avatar with accent ring

#### Glass Effects

**When to use glass:**
- Tab bar (automatic via NativeTabs)
- Version chips (selected state, tinted)
- Share CTA button (tinted systemBlue)
- NOT on card surfaces (opaque for readability)
- NOT on settings groups (opaque for legibility)
- NOT as a floating bottom bar on Card tab (conflicts with tab bar)

**Glass count limit per screen: 5-6 surfaces maximum.** Each GlassView is a compositing layer. More than 6 causes frame drops.

### 5.5 Corner Radii

All radii use `borderCurve: "continuous"` (iOS squircle).

| Element | Radius |
|---|---|
| Card shell | 24pt |
| Card shell (compact) | 22pt |
| Settings group | 20pt |
| Chip/Tag | full (pill) |
| Button (primary) | 25pt |
| Button (secondary) | 14pt |
| Color swatch | full (circle) |

### 5.6 Shadows

| Surface | Shadow |
|---|---|
| Card hero | `0 12px 32px rgba(0,0,0,0.10)` |
| Avatar | `0 1px 3px rgba(0,0,0,0.12)` |
| No shadow | Settings groups (flat), buttons (color is affordance) |

---

## 6. Motion & Haptics

### 6.1 Spring Configurations

All animations use `react-native-reanimated` springs. No `Animated.timing()`.

| Name | Stiffness | Damping | Usage |
|---|---|---|---|
| `snappy` | 500 | 30 | Button press, chip tap, immediate feedback |
| `gesture` | 400 | 25 | Drag, flick (adjusted from snappy for smoother feel) |
| `bouncy` | 600 | 15 | Success celebrations, scale bounce |
| `gentle` | 300 | 25 | List stagger, layout transitions |

### 6.2 Animation Patterns

| Pattern | Config |
|---|---|
| Card tap → QR | `ZoomIn.springify()` (bouncy) |
| QR dismiss | `ZoomOut.duration(200)` |
| Version switch | Crossfade via `FadingTransition` layout animation |
| Button press | `snappy` scale 0.98 → 1.0 |
| Chip selection | `snappy` scale + background color transition |
| List stagger | `gentle` + 50ms delay per item (FadeInDown) |
| Tab switch | System-managed (NativeTabs — cannot customize) |

### 6.3 Haptic Pairing

Every interaction has a haptic. No silent interactions.

| Action | Haptic |
|---|---|
| Chip tap / toggle | `selection` |
| Button press | `light` |
| Card tap (QR toggle) | `medium` |
| Share success / Copy success | `success` |
| Destructive action | `warning` |
| Error | `error` |
| Long press (context menu) | `medium` |
| Pull to refresh | `light` (on trigger threshold) |

---

## 7. Implementation Plan

### Phase 0: IA + Share Simplification (2-3 days)

**Goal:** Remove field toggles from Share tab. This is the single highest-impact change — it eliminates the duplication UX identified, simplifies Share to its essential purpose, and establishes field visibility as a version-level setting.

**Changes:**
- `app/(tabs)/(share)/index.tsx` — Remove `SHARE_FIELDS`, `FieldRow`, `selectedFields` state, `toggleField`. Keep card preview + share/copy/QR actions.
- `app/(tabs)/(home)/editor.tsx` — Add VISIBLE FIELDS section with field toggles (using `SettingsGroup` + `SettingsRow` + `Switch`). This is where field visibility now lives.
- No data model changes. `CardVersion.visibleFields` already exists and is the correct backing store.
- No tab structure changes. Card / Share / Settings stays.

**Engineering cost:** 1-2 days (confirmed: Easy — deleting code from Share, adding grouped list rows to Editor using existing primitives).

### Phase 1: Card Redesign (1 week)

**Goal:** Implement editorial asymmetry card layout.

**Changes:**
- `src/components/card/card-display.tsx` — Rewrite layout: left-aligned text, right-aligned avatar, accent strip, character pill, contact links. Pure `StyleSheet.create` (no Tailwind on card).
- Dark mode support: replace hardcoded `#FFFFFF` with `PlatformColor` semantic colors.
- `src/components/card/card-field.tsx` — Simplify to pure StyleSheet (remove Tailwind hybrid).
- Extract `VersionChip` from `app/(tabs)/(home)/index.tsx` to `src/components/shared/version-chip.tsx`.

**No TemplateConfig system in v1.** PM explicitly deferred "card templates beyond 3 defaults." The 3 default versions (Professional / Networking / Personal) differ in `visibleFields` and `accentColor`, not in layout structure. A single CardDisplay component with the editorial asymmetry layout is sufficient. Template system is a v1.2 concern.

### Phase 2: Editor Enhancement (1 week)

**Goal:** Make the editor the single source of truth for version customization.

**Changes:**
- Field visibility toggles (migrated from Share in Phase 0)
- Version name editing
- Accent color picker (ColorGrid, already exists)
- Name font weight selector (SegmentedControl: Regular / Bold / Black)
- Live preview at top of editor (compact CardDisplay)
- Long-press context menu on version chips: Set as Default / Duplicate / Delete

### Phase 3: Polish & Ship (1 week)

**Goal:** Quality bar — every item in PM's quality criteria must pass.

**Checklist:**
- [ ] Large title collapse works on all 3 tabs (iOS)
- [ ] Liquid Glass renders on iOS 26+ with non-glass fallback
- [ ] All animations use springs (user-initiated) or easing (system-initiated)
- [ ] All interactive elements ≥ 44pt touch targets
- [ ] Haptic feedback on every user interaction
- [ ] No layout shift on card display
- [ ] Dark mode end-to-end (PlatformColor everywhere)
- [ ] Pull-to-refresh on Card tab triggers LinkedIn re-sync
- [ ] Keyboard avoidance on editor inputs
- [ ] Error states are helpful, not technical
- [ ] Onboarding copy updates (Paste your LinkedIn / See Your Card)
- [ ] Shared card web page (linkcard.app/c/{id}) matches in-app quality

**Each phase is independently shippable. No phase blocks another.**

---

## 8. Data Model

### No structural changes for v1 redesign.

The existing data model is correct:

```typescript
interface BusinessCard {
  id: string;
  profile: LinkedInProfile;
  versions: CardVersion[];      // ← field visibility lives here
  qrCodeData: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CardVersion {
  id: string;
  name: string;
  visibleFields: (keyof LinkedInProfile | 'qrCode')[];
  template: CardTemplate;
  accentColor: string;
  isDefault: boolean;
  fieldStyles?: Record<string, FieldStyle>;
}
```

**One type-safety improvement** (Phase 1):
```typescript
type ProfileField = keyof LinkedInProfile | 'qrCode' | 'character';
// Use ProfileField instead of loose string for fieldStyles keys
fieldStyles?: Partial<Record<ProfileField, FieldStyle>>;
```

**Deferred to v2:** Multi-card support (`cards: BusinessCard[]`), Contact model, TemplateConfig. These are store + route + UI rewrites that would double the v1 timeline.

---

## 9. Open Questions

These are unresolved decisions to be validated through user testing post-launch:

1. **QR overlay trigger:** Should "tap card → QR" remain, or should QR only be accessible via the Share tab's QR button? Currently both exist. If analytics show nobody taps the card for QR, remove the card-tap trigger and use the space for something else.

2. **Version chip positioning:** Currently below the card in a horizontal scroll. Should they be above the card (like a tab bar within the tab)? User testing needed to see which position gets more version switches.

3. **Share tab entry friction:** We chose to keep Share as a tab. If analytics show users rarely visit Share tab and instead screenshot the card to share (bypassing the app's share flow), we should reconsider inlining share actions to Card tab — which is UX's original proposal. The data will tell us.

4. **Accent strip on card:** Is 3pt the right width? Does it read well on all accent colors? Print test needed.

5. **Character pill vs. text line:** We kept the pill. If user testing shows people don't understand what the character tag is, we should test the middot-separated text alternative.

---

## 10. What We Are NOT Building (v1)

Explicitly out of scope. This list is a firewall against scope creep.

- Content feed / discovery
- Messaging / chat
- Social graph / contacts
- NFC sharing (iOS can't write NDEF)
- Apple Wallet pass (needs signing certificate — v1.1)
- AirDrop (needs native module — v1.1)
- Card templates beyond the 3 defaults (v1.2)
- Custom backgrounds / gradients on cards
- Analytics dashboard ("who viewed my card") (v1.1)
- Multiple business cards per user (v2)
- Event mode / proximity discovery (v2)
- Team cards (v3)

---

*"People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas."* — Steve Jobs

*This spec is the single source of truth for the LinkCard v1 redesign. If it's not in this document, it's not in the product.*
