# LinkCard Visual Design System Spec
> Owner: UI Designer | Status: v1.0 | Benchmark: Bonjour! + Apple HIG

---

## 1. Design Philosophy

**One principle**: Every pixel serves identity. LinkCard is not a generic card maker — it is a person's professional essence, distilled into a surface you can hold, share, and feel.

**Three pillars**:
1. **Content-first** — Typography IS the design. No decorative noise.
2. **System-native** — Feel like iOS, not "React Native pretending to be iOS."
3. **Tactile confidence** — Every interaction earns trust through haptic + spring + glass.

---

## 2. Color System

### 2.1 Semantic Color Tokens

All colors derive from Apple's semantic color system via `PlatformColor()` on iOS, with `light-dark()` CSS fallbacks for web.

| Token | iOS PlatformColor | Light Fallback | Dark Fallback | Usage |
|---|---|---|---|---|
| `text.primary` | `label` | `#000000` | `#FFFFFF` | Names, headings, primary content |
| `text.secondary` | `secondaryLabel` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Headlines, subtitles, meta |
| `text.tertiary` | `tertiaryLabel` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Timestamps, placeholders |
| `bg.primary` | `systemBackground` | `#FFFFFF` | `#000000` | Page background |
| `bg.secondary` | `secondarySystemBackground` | `#F2F2F7` | `#1C1C1E` | Grouped background |
| `bg.tertiary` | `tertiarySystemBackground` | `#FFFFFF` | `#2C2C2E` | Elevated surfaces |
| `bg.card` | `secondarySystemGroupedBackground` | `#FFFFFF` | `#1C1C1E` | Card surfaces, groups |
| `separator` | `separator` | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.6)` | Hairline dividers |
| `accent` | `systemBlue` | `#007AFF` | `#0A84FF` | CTA, links, active states |
| `success` | `systemGreen` | `#34C759` | `#30D158` | Verification, success |
| `destructive` | `systemRed` | `#FF3B30` | `#FF453A` | Delete, error |
| `warning` | `systemOrange` | `#FF9500` | `#FF9F0A` | Caution states |

### 2.2 Accent Color Palette (Card Theming)

User-selectable card accent colors. Each is an Apple system tint:

```
blue:    #007AFF    (default — systemBlue)
indigo:  #5856D6    (systemIndigo)
violet:  #AF52DE    (systemPurple)
pink:    #FF2D55    (systemPink)
orange:  #FF9500    (systemOrange)
amber:   #FFCC00    (systemYellow)
emerald: #34C759    (systemGreen)
teal:    #5AC8FA    (systemTeal)
slate:   #8E8E93    (systemGray)
black:   #1A1A1A    (for dark card themes)
white:   #FFFFFF    (for light card themes)
```

### 2.3 Accent-Derived Tints

For chips, tags, and subtle backgrounds, derive from accentColor:

- **Chip background**: `accentColor` at 12% opacity (`${accent}1F`)
- **Chip text**: `accentColor` at 100%
- **Hover/Press**: `accentColor` at 8% opacity
- **Card accent strip**: `accentColor` at 100%, 4px wide

---

## 3. Typography Scale

### 3.1 Apple Dynamic Type (Single Source of Truth)

All text uses the SF Pro family via `system-ui` on iOS. No custom fonts for UI chrome — only card content may use editorial typefaces.

| Style | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `largeTitle` | 34px | 41px | Bold (700) | Screen titles (nav bar) |
| `title1` | 28px | 34px | Bold (700) | Card name, hero headings |
| `title2` | 22px | 28px | Bold (700) | Section headings, account name |
| `title3` | 20px | 25px | Semibold (600) | Subsection headings |
| `headline` | 17px | 22px | Semibold (600) | Row titles, emphasized body |
| `body` | 17px | 22px | Regular (400) | Primary body text, list rows |
| `callout` | 16px | 21px | Regular (400) | Secondary body, descriptions |
| `subheadline` | 15px | 20px | Regular (400) | Card headline, meta info |
| `footnote` | 13px | 18px | Regular (400) | Section headers, timestamps |
| `caption1` | 12px | 16px | Regular (400) | Contact details, badges |
| `caption2` | 11px | 13px | Regular (400) | Smallest labels |

### 3.2 Card-Specific Typography

The hero card uses a bespoke editorial type hierarchy for maximum impact:

| Element | Size | Weight | Tracking | Notes |
|---|---|---|---|---|
| Name | 28px | Black (900) or Bold (700) | -0.3px | Largest element. Must dominate. |
| Job Title | 15px | Semibold (600) | 0 | Secondary hierarchy |
| Headline/Bio | 15px | Regular (400) | 0 | Muted (`text.secondary`) |
| Company | 13px | Semibold (600) | 0.2px | Uppercase optional |
| Location | 12px | Regular (400) | 0 | `text.tertiary` |
| Character Tag | 12px | Medium (500) | 0 | Inside accent-tinted pill |
| Version Label | 17px | Semibold (600) | 0 | Top-left card branding |
| Meta/Bottom | 15px | Medium (500) | 0 | Bottom bar labels |

### 3.3 Editorial Typefaces (Card Content Only)

Available for `fieldStyles` customization — never for UI chrome:

- **System** (SF Pro) — default, always correct
- **Cormorant Garamond** — editorial serif for name emphasis
- **JetBrains Mono** — technical/developer identity

Limit: 3 fonts total (System + 1 serif + 1 mono). DM Sans removed — too similar to System, no visual differentiation. Each additional font adds ~200KB to bundle.

---

## 4. Spacing Grid

### 4.1 Base Unit: 4pt

All spacing is a multiple of 4pt. Preferred stops:

```
4    — micro gap (icon-to-text inline)
8    — tight gap (chip gap, tag gap, inline elements)
12   — compact padding (chip internal, small cards)
16   — standard padding (card internal, screen horizontal, group horizontal)
20   — comfortable padding (card surface, screen horizontal on larger screens)
24   — section gap (between related sections)
32   — major gap (between unrelated sections)
40   — hero spacing (above/below card hero)
```

### 4.2 HIG-Derived Layout Constants

| Constant | Value | Usage |
|---|---|---|
| Screen horizontal | 16pt | Page-level horizontal padding |
| Section gap | 35pt | Between settings groups |
| Section header margin | 6pt | Below section title |
| Row min height | 44pt | Minimum tap target (HIG) |
| Row vertical padding | 11pt | Settings row top/bottom |
| Separator inset (plain) | 16pt | Standard separator indent |
| Separator inset (icon) | 56pt | Separator after icon-leading row |

### 4.3 Card Internal Layout

```
Card padding:        20pt horizontal, 20pt top, 16pt bottom
Card padding compact: 16pt all sides
Top row margin-bottom: 18pt
Avatar margin-bottom: 12pt
Name to headline:    4pt
Headline to tag:     12pt
Bottom bar margin-top: 20pt
Bottom bar border-top: 0.5pt (hairline)
```

---

## 5. Radii & Surfaces

### 5.1 Corner Radius Scale

All radii use `borderCurve: "continuous"` (iOS squircle, not CSS circular).

| Element | Radius | Notes |
|---|---|---|
| Card shell | 24pt | Hero card, main surfaces |
| Card shell compact | 22pt | Smaller card variants |
| Settings group | 20pt | Grouped list containers |
| Chip/Tag | full (999) | Pill shape |
| Segmented control | 13pt | Outer container |
| Segmented item | 10pt | Inner selected item |
| Icon tile | 8pt | Settings icon backgrounds |
| Color swatch | full (999) | Circular |
| Button (primary) | 25pt | Full-width CTA |
| Button (secondary) | 14pt | Smaller actions |

### 5.2 Elevation & Shadow

| Surface | Shadow | Usage |
|---|---|---|
| Card hero | `0 12px 32px rgba(0,0,0,0.10)` | Main business card |
| Segmented selected | `0 1px 2px rgba(0,0,0,0.08)` | Active segment |
| Avatar | `0 1px 3px rgba(0,0,0,0.12)` | All avatar sizes |
| Bottom floating bar | `0 -8px 24px rgba(0,0,0,0.08)` | Floating action bar |
| No shadow | none | Settings groups (flat) |

---

## 6. Component Specifications

### 6.1 Hero Business Card

The card is the product. It must look like a physical card you'd be proud to hand over.

```
+--------------------------------------------+
|  Version Name              Company         |  <- top row
|  Location                                  |
|                                            |
|              [ Avatar 80pt ]               |  <- centered
|                                            |
|              Name (28pt bold)              |
|         Job Title at Company               |  <- subheadline, secondary
|                                            |
|           [ character tag pill ]           |  <- accent-tinted
|                                            |
|  LinkCard ─────────── ● Template           |  <- bottom bar, hairline top
+--------------------------------------------+
```

**Surface**: Light: pure white (#FFFFFF). Dark: `PlatformColor("secondarySystemGroupedBackground")` (#1C1C1E). 24pt continuous radius, hero shadow.
**Accent strip** (redesign): 4pt vertical bar on left edge in `accentColor`. Full-size card only — compact mode uses 2pt `borderTopColor: accentColor` instead.
**QR overlay**: Animated (ZoomIn spring), frosted white (97% opacity), centered QR + selectable URL below.

### 6.2 Identity Tags / Chips

Inspired by Bonjour!'s emoji pill tags. Used for character traits, version selection, field toggles.

**Anatomy**: `[ emoji/dot + text ]`

| Property | Value |
|---|---|
| Height | 36-40pt |
| Horizontal padding | 14-16pt |
| Gap (icon to text) | 8pt |
| Border radius | full (pill) |
| Background (default) | `#F2F2F7` (sf-gray-6) |
| Background (selected) | `accentColor` |
| Background (accent-tinted) | `accentColor` at 12% |
| Text size | 15pt |
| Text weight | Medium (500) default, Semibold (600) selected |
| Text color (default) | `text.primary` |
| Text color (selected) | `#FFFFFF` |
| Dot size | 10pt circle |
| Gap between chips | 8pt |

**State transition animation**: Background color change uses `useAnimatedStyle` + `withSpring(snappy)` color interpolation via `interpolateColor`. Haptic `selection` fires on press, not on animation completion.

**Dual-track character system**:
- **Card internal**: Character as middot-separated text (`Visionary · Builder · Mentor`) — compact, editorial
- **Card external (Home page below card)**: Emoji identity tags as pill chips (`[💼 PM] [🏢 Apple]`) — interactive, scannable
- These are separate data sources: middot = `profile.character`, pills = emoji service `{ emoji, label }[]`

### 6.3 Product / Link Cards

For future "links" or "products" section (Bonjour! style):

```
+--[ icon ]--+--[ title + subtitle ]--+--[ CTA ]--+
```

| Property | Value |
|---|---|
| Height | 64-72pt |
| Padding | 16pt |
| Background | `bg.card` |
| Border radius | 16pt continuous |
| Icon size | 40pt with 12pt radius |
| Title | `headline` (17pt semibold) |
| Subtitle | `caption1` (12pt, `text.secondary`) |
| CTA button | 32pt height, 12pt h-padding, 10pt radius, `accent` bg, white text, `caption1` semibold |
| Shadow | none (flat in grouped context) |

### 6.4 Button Hierarchy

**Primary** — Full-width CTA (e.g., "Share Card", "Add to Wallet"):
```
Height:         50pt
Padding:        16pt horizontal
Radius:         25pt (half height)
Background:     accent (systemBlue)
Text:           17pt semibold, white
Icon:           18pt, white, leading
Shadow:         none (the color IS the affordance)
Press state:    opacity 0.85, spring scale 0.98
```

**Secondary** — Outline/ghost (e.g., "Copy Link"):
```
Height:         44pt
Padding:        16pt horizontal
Radius:         14pt
Background:     transparent
Border:         1pt, separator color
Text:           15pt medium, accent
Press state:    bg accent at 8%, spring scale 0.98
```

**Tertiary** — Text only (e.g., nav bar "Edit", "Done"):
```
Height:         44pt (tap target)
Text:           17pt regular, accent
Press state:    opacity 0.5
```

**Destructive** — Same as primary but systemRed:
```
Background:     systemRed
Text:           white
```

### 6.5 Avatar

| Size Preset | Dimensions | Font Size | Usage |
|---|---|---|---|
| `sm` | 32pt | 12pt | Inline mentions, list items |
| `md` | 48pt | 16pt | Settings rows, compact card |
| `lg` | 64pt | 24pt | Card compact mode |
| `xl` | 96pt | 36pt | Profile hero |
| `2xl` | 128pt | 48pt | Onboarding, full-screen profile |
| Custom | any number | size * 0.375 | Flexible |

**Treatments**:
- **Image**: `objectFit: cover`, circular clip, 300ms fade-in transition
- **Fallback**: Linear gradient (accentColor to accentColor-30), white initials centered
- **Shadow**: `0 1px 3px rgba(0,0,0,0.12)` — subtle, always on
- **Border** (optional): 3pt solid in accentColor — for hero card emphasis
- **Ring** (redesign): Optional `ring` prop on Avatar component. 2pt white gap + 2pt accent border = 4pt total padding per side. Component internally compensates: `outerDim = dim + 8`. Consumer uses `<Avatar size={48} ring ringColor={accentColor} />` without manual calculation.

### 6.6 Section Headers

iOS grouped list style — all caps, footnote size, secondary color:

```
fontSize:       13pt
lineHeight:     18pt
fontWeight:     Semibold (600)
letterSpacing:  0.2pt
color:          text.secondary
marginTop:      30pt (after previous group)
marginBottom:   6pt (before group)
marginHorizontal: 20pt
textTransform:  uppercase
```

### 6.7 Settings List Rows

Follows Apple Settings pattern exactly:

```
Min height:     50pt (exceeds 44pt tap target)
Padding:        16pt horizontal, 11pt vertical
Leading icon:   28pt container, 16pt icon, centered, 16pt right margin
Title:          17pt body, text.primary
Subtitle:       14pt, text.secondary, 2pt top margin
Trailing:       chevron (16pt, rgba(60,60,67,0.3)), switch, or value text
Separator:      hairline, indented 16pt (or 56pt with icon)
```

**Account Card** (hero row):
```
Min height:     96pt
Avatar:         60pt with accent ring
Name:           22pt bold (title2)
Subtitle:       17pt body, text.secondary
Detail:         15pt subheadline, text.secondary
Separator:      inset 92pt (past avatar)
Footer row:     68pt min height, icon + label + chevron
```

### 6.8 Bottom Action Bar

Floating bar for primary actions. **Card Tab only** — Versions and Settings tabs do not have this bar.

```
Position:       absolute, bottom: tabBarHeight + 8pt (via useBottomTabBarHeight())
Height:         48pt
Horizontal:     16pt inset
Radius:         24pt (half height, capsule)
Background:     AdaptiveGlass regular
Shadow:         none (glass surface provides visual separation; avoids conflict with tab bar glass)
Layout:         [Share (flex:1, text+icon)] [QR (44pt, icon only)] [Copy (44pt, icon only)]
Inner gap:      8pt between buttons
```

Total bottom occupation: tab bar 49pt + 8pt gap + action bar 48pt = 105pt. Acceptable for a "view card → share card" primary workflow.

### 6.9 Glass Effects

**When to use glass**:
- Tab bar (automatic via NativeTabs)
- Bottom floating action bar (Card Tab only)
- Modal sheet backgrounds
- NOT on card surfaces (cards are opaque for readability)
- NOT on settings groups (they are opaque for legibility)
- NOT on identity tag pills (solid bg for boundary clarity)
- NOT on version thumbnails (solid bg.card for performance)

**Glass budget per screen**: Maximum 5-6 GlassView surfaces. Card Tab has 2 (tab bar + action bar) — well within limits.

**Glass tiers** (from `adaptive-glass.tsx`):

| Tier | iOS 26+ | iOS < 26 | Web | Android |
|---|---|---|---|---|
| Regular | `GlassView regular` | `BlurView 40` | `backdrop-filter blur(40px)` | `rgba(242,242,247,0.92)` |
| Thin | — | `BlurView 30` | `backdrop-filter blur(30px)` | `rgba(242,242,247,0.85)` |
| Reduce transparency | — | — | — | `rgba(242,242,247,0.95)` opaque |

---

## 7. Iconography

### 7.1 Icon System: Majesticons Line

All icons use **Majesticons line style** — 24x24 viewBox, 2pt stroke, round caps/joins. Rendered as inline SVG via `react-native-svg`.

**NOT** SF Symbols in-app (SF Symbols only used by `NativeTabs.Trigger.Icon` for tab bar icons on iOS).

### 7.2 Icon Sizes

| Context | Size | Stroke |
|---|---|---|
| Tab bar (SF Symbols) | system-managed | system |
| Settings icon tile | 16pt (in 28pt tile) | 2pt |
| Inline (row trailing) | 16pt | 2pt |
| Navigation bar | 22pt | 2pt |
| Card actions | 24pt | 2pt |
| Empty state hero | 48pt | 2pt |

### 7.3 Icon Colors

- **Default**: `text.primary`
- **Secondary**: `text.secondary`
- **Interactive**: `accent` (systemBlue)
- **Destructive**: systemRed
- **On accent bg**: `#FFFFFF`
- **Disabled**: `text.tertiary`

---

## 8. Motion & Animation

### 8.1 Spring Configurations

All animations use `react-native-reanimated` springs. No `Animated.timing()` — springs feel alive.

| Name | Stiffness | Damping | Usage |
|---|---|---|---|
| `snappy` | 500 | 30 | Button press, chip tap, immediate feedback |
| `gesture` | 400 | 25 | Card drag, carousel flick, velocity-preserving (softer than snappy for continuous gestures) |
| `bouncy` | 600 | 15 | Scale bounce on success, celebration |
| `gentle` | 300 | 25 | List items, stagger in, layout transitions |

### 8.2 Animation Patterns

| Pattern | Config | Description |
|---|---|---|
| Button press | `snappy` scale 0.98 → 1.0 | Subtle compression on press |
| Card flip to QR | `ZoomIn.springify()` | Spring-based zoom reveal |
| QR dismiss | `ZoomOut.duration(200)` | Quick 200ms fade out |
| Chip selection | `snappy` scale + bg color | Simultaneous scale + color |
| List stagger | `gentle` with 50ms delay per item | Sequential reveal |
| Sheet present | system-managed (expo-router modal) | Native iOS sheet |
| Tab switch | system-managed (NativeTabs) | Native iOS transition |

### 8.3 Haptic Pairing

Every spring animation pairs with a haptic:

| Action | Haptic | Spring |
|---|---|---|
| Chip tap | `selection` | `snappy` |
| Button press | `light` | `snappy` |
| Card tap (QR) | `medium` | `bouncy` |
| Destructive action | `warning` | `snappy` |
| Success completion | `success` | `bouncy` |
| Error | `error` | `snappy` |

---

## 9. Card Redesign Proposal

### 9.1 Current State Assessment

The current card is clean but **generic** — centered avatar, centered text, symmetric layout. It looks like every other "profile card" in every other app. There is no visual tension, no editorial voice, no brand character.

### 9.2 Two-Template System (v1)

PM decision: v1 ships 2 layout templates + accent color palette. Templates differ in **layout**, not just color. Minimal (text-only) deferred to v2.

Each template is an independent renderer component (~80 lines StyleSheet each), not a config-driven conditional branch.

#### Template A: Editorial (Professional / Personal versions)

Inspired by high-end business cards and editorial layouts:

1. **Left-aligned text** — Names and titles left-aligned. Left-alignment feels like a masthead, not a greeting card.
2. **Accent strip** — 4pt vertical bar on left edge in accentColor. Full-size card only; compact uses 2pt borderTop.
3. **Avatar right-aligned** — 48-56pt, right side, creating asymmetric tension. Optional 2pt accent ring.
4. **Character middot line** — `Visionary · Builder · Mentor` — typographic, not decorative.
5. **Contact details** — Email, phone, website as tappable caption-sized links in systemBlue.
6. **Bottom bar** — "LinkCard" left, template dot + name right.

```
┌─┬──────────────────────────────────────┐
│▌│  Visionary · Builder · Mentor        │
│▌│                                      │
│▌│  NAME (28pt, black weight)   [avatar]│
│▌│  Job Title (17pt, semi)      [ 48pt ]│
│▌│  Headline (15pt, secondary)          │
│▌│                                      │
│▌│  email@example.com                   │
│▌│  +1 234 567 8900                     │
│▌│                                      │
│▌│  LinkCard ─────────── ● Editorial    │
└─┴──────────────────────────────────────┘
```

#### Template B: Centered (Networking version)

Social-friendly, approachable, avatar-dominant:

1. **Centered layout** — Avatar and text all centered. Warm, open feel.
2. **Large avatar** — 80pt centered with accent ring.
3. **Emoji tags inline** — Below name, horizontal row of pill tags (from emoji service).
4. **No accent strip** — Color expressed through avatar ring and tag tints.

```
+--------------------------------------------+
|            Version Name                     |
|                                             |
|              [ Avatar 80pt ]                |
|              (accent ring)                  |
|                                             |
|              Name (28pt bold)               |
|         Job Title at Company                |
|                                             |
|   [💼 PM] [🏢 Apple] [📍 SF] [🚀 Builder]  |
|                                             |
|  LinkCard ─────────── ● Centered           |
+--------------------------------------------+
```

#### CardThumbnail (Versions Tab grid)

Independent component — does NOT reuse CardDisplay. Optimized for performance in 2-column grid.

```
Width:          (screenWidth - 48) / 2
Height:         width * 1.2 (5:6 aspect ratio)
Top border:     2pt in accentColor
Center:         version name (headline, semibold, centered)
Bottom:         template label (caption1, text.secondary)
Background:     bg.card
Radius:         16pt continuous
```

### 9.3 Visual Quality Benchmarks

Every card render must pass these tests:
- **Squint test**: Can you read the name from arm's length? (28pt bold minimum)
- **Thumbnail test**: Does it look intentional at 1/4 size? (accent strip is visible)
- **Screenshot test**: Would someone screenshot this to share? (editorial quality)
- **Print test**: Would this look good printed on a physical card? (no screen-only artifacts)

---

## 10. Challenges & Pushback

### 10.1 Visual Feasibility Concerns

**Against over-glassing**: Liquid Glass is gorgeous for chrome (tab bar, chips), but NEVER for content surfaces. The card must be opaque white for text legibility. If UX proposes a glass card surface — reject it.

**Against feature creep on card**: The card surface is a focused identity expression. Social stats, activity feeds do NOT belong on the card. Emoji identity tags and product links appear **below the card** as independent sections (agreed with PM), not inside the card surface. The card internal content is: name, title, headline, character middot line, contact details.

**Against custom fonts for UI**: SF Pro is the correct font for all UI chrome. Custom fonts (DM Sans, Cormorant) are reserved for card content only. Mixing typefaces in UI makes the app feel like a template, not a system.

**Against gradient backgrounds**: Gradients on card backgrounds look cheap and dated. The card surface is pure white (light) or pure dark (dark mode). Color comes from the accent strip and accent-tinted elements, not from background gradients.

### 10.2 Technical Constraints

- `borderCurve: "continuous"` only works on iOS — web/Android get standard CSS `border-radius`
- `PlatformColor()` is iOS-only — every usage needs a web/Android fallback
- `expo-glass-effect` is iOS 26+ only — the `AdaptiveGlass` component handles graceful degradation
- Majesticons SVG icons render identically cross-platform (no SF Symbols dependency in-app)
- NativeWind/Tailwind handles responsive styling, but `StyleSheet.create` is preferred for performance-critical components (card, avatar)

---

## 11. Implementation Notes

### 11.1 Style Strategy

- **Card components** (`card-display.tsx`, `card-field.tsx`): Pure `StyleSheet.create` — no Tailwind. Performance matters here.
- **Settings/Chrome** (`settings.tsx`): Hybrid — `StyleSheet.create` for layout, `className` for color tokens.
- **Screens**: NativeWind `className` for rapid iteration, with `style` overrides for precision.
- **Shared components** (`avatar.tsx`, `adaptive-glass.tsx`): Inline `ViewStyle` objects for dynamic values, `className` for static.

### 11.2 Token Consumption

CSS tokens live in `src/css/sf.css` and are consumed via:
- Tailwind classes: `text-sf-text`, `bg-sf-bg-2`, `text-title-1`
- `PlatformColor()` in StyleSheet: `PlatformColor("systemBlue")`
- Direct reference: `var(--sf-blue)` in web CSS

### 11.3 File Architecture

The design system is already well-structured. No new files needed for tokens — `sf.css` + `accent-colors.ts` + `springs.ts` cover everything. Component specs above should inform implementation in existing files.

---

*This spec is the single source of truth for visual decisions in the LinkCard redesign. Every component, color, and spacing value traces back to this document or to Apple HIG. If it's not here, it's not in the design.*
