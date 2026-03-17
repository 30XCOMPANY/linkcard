# LinkCard iOS 26 Interaction Spec
> UX Designer | 2026-03-17
> Companion to: linkcard-redesign-spec.md

---

## 1. NativeTabs iOS 26 Behavior

### 1.1 Tab Bar Configuration

```tsx
<NativeTabs minimizeBehavior="onScrollDown">
```

| Property | Value | Rationale |
|---|---|---|
| `minimizeBehavior` | `"onScrollDown"` | iOS 26 signature behavior — tab bar shrinks to floating pill on scroll, maximizing content area |
| `tintColor` | `PlatformColor("systemBlue")` via `DynamicColorIOS` | Accent-tinted tab icons on selection |
| Labels | Visible: "Card", "Share", "Settings" | Labels visible in expanded state for discoverability; `minimizeBehavior` auto-hides them in pill mode on scroll. Icon-only risks ambiguity (creditcard vs wallet?). |

### 1.2 Tab Bar State Machine

```
                ┌─────────────┐
                │   EXPANDED   │  ← Default state, full glass bar
                │   (resting)  │     with 3 icon triggers
                └──────┬───────┘
                       │ scroll down > 20pt
                       ▼
                ┌─────────────┐
                │  MINIMIZED   │  ← Floating pill, icons compacted
                │   (pill)     │     iOS 26 system animation
                └──────┬───────┘
                       │ scroll up OR tap tab bar area
                       ▼
                ┌─────────────┐
                │   EXPANDED   │
                └─────────────┘
```

**Key behaviors:**
- Transition is system-managed — no custom animation code needed
- Content underneath the glass bar is always visible (iOS 26 liquid glass translucency)
- `contentInsetAdjustmentBehavior="automatic"` on each tab's ScrollView handles bottom inset automatically — when tab bar shrinks, content adjusts
- Tab switch while minimized: bar stays minimized until user scrolls up on the new tab

### 1.3 Tab Bar + Large Title Coordination

Each tab has its own Stack with `headerLargeTitle: true`. The coordination:

```
User scrolls down on Card tab:
  1. Large title collapses → small title in nav bar  (system UIKit)
  2. Tab bar minimizes → floating pill              (NativeTabs)
  3. Both transitions run simultaneously
  4. Content area gains ~130pt vertical space

User scrolls back to top:
  1. Large title expands                            (system UIKit)
  2. Tab bar expands                                (NativeTabs)
  3. Both happen in one fluid gesture
```

**Constraint:** ScrollView MUST be the first direct child of the screen component. No wrapper Views between the screen root and ScrollView. This is required for both large title collapse AND tab bar minimize to coordinate with scroll position.

---

## 2. Per-Screen Gesture Specifications

### 2.1 Card Tab (Home)

#### Gesture Priority Map

```
Priority 1 (highest): System back gesture (left edge swipe)
Priority 2: ScrollView vertical scroll (large title + tab bar coordination)
Priority 3: Horizontal scroll on version chips (nested ScrollView)
Priority 4: Card tap → QR overlay toggle
Priority 5: Version chip tap → switch version
Priority 6: Long press version chip → context menu
Priority 7: Pull to refresh → LinkedIn re-sync
```

#### Card Tap → QR Overlay

```
Gesture:     Pressable.onPress on card surface
Haptic:      haptic.medium() — fired immediately on press
Animation:   QR overlay enters with ZoomIn.springify()
               .stiffness(600)
               .damping(15)
             This is the "bouncy" spring — fast attack, slight overshoot
Visual:      Frosted overlay — NOT glass, opaque with 97% alpha
             Light: rgba(255,255,255,0.97)  Dark: rgba(28,28,30,0.97)
             Select via useColorScheme() — static colors, not PlatformColor
             Centered QR code + selectable URL below

Dismiss:     Two dismiss paths —
             (a) Tap overlay again → ZoomOut.duration(200)
             (b) Swipe down gesture on overlay → interpolate translateY to dismiss

             On dismiss: haptic.light()
```

**Implementation detail for QR overlay:**
```tsx
// Entering
<Animated.View
  entering={ZoomIn.springify().stiffness(600).damping(15)}
  exiting={ZoomOut.duration(200)}
>
  {/* frosted overlay content */}
</Animated.View>
```

**Note:** The overlay renders as a sibling View on top of the card, NOT as a modal. It participates in the ScrollView layout but is position-absolute over the card.

#### Version Chip Tap → Switch Version

```
Gesture:     Pressable.onPress on chip
Haptic:      haptic.selection() — fired immediately

Chip transition (INSTANT, no animation):
  t=0ms:   haptic 'selection'
  t=0ms:   tapped chip scale → 0.95 (snappy spring start)
  t=0ms:   tapped chip background INSTANT switch → GlassView tinted (iOS 26+) / opaque accent (fallback)
  t=0ms:   tapped chip text → #FFFFFF, fontWeight → 600
  t=0ms:   previous chip background INSTANT switch → tertiarySystemFill
  t=0ms:   previous chip text → PlatformColor('label'), fontWeight → 500
  t=~80ms: tapped chip scale → 1.0 (spring settle)

Card transition (CROSSFADE, separate from chip):
  t=0-300ms: card content crossfade via FadingTransition layout animation

Chip colors/background/weight switch instantly — discrete state, not continuous.
Only the scale spring animates. Card crossfade runs independently.

Press state: NO Pressable opacity change — GlassView isInteractive=true
             provides system-level material darkening on press. Adding opacity
             would triple-stack feedback (material + opacity + scale = too much).
             Only scale spring + system material highlight.
```

**Card crossfade spec:**
```tsx
<Animated.View layout={FadingTransition}>
  <CardDisplay
    profile={card.profile}
    version={currentVersion}
    qrCodeData={card.qrCodeData}
    showQR={showQR}
  />
</Animated.View>
```

#### Long Press Version Chip → Context Menu

```
Gesture:     Pressable.onLongPress (delayLongPress: 500ms default)
Haptic:      haptic.medium() — fired when context menu appears
System:      iOS ContextMenu (via @react-native-menu/menu or expo equivalent)
Items:       "Set as Default" | "Duplicate" | "Delete" (destructive)
Animation:   System-managed UIContextMenu spring (no custom animation)
```

#### Pull to Refresh → LinkedIn Re-sync

```
Gesture:     ScrollView.refreshControl (RefreshControl component)
Haptic:      haptic.light() — fired when pull threshold crossed
Animation:   System UIRefreshControl (native spinner)
Callback:    Triggers LinkedIn profile re-scrape
Duration:    Shows spinner until API response, then dismiss
```

#### Edit Button (Nav Bar)

```
Gesture:     Pressable.onPress on headerRight button
Haptic:      haptic.light()
Transition:  Stack push to editor screen (see Section 3.1)
Visual:      Standard text button, "Edit", systemBlue, 17pt regular
```

### 2.2 Share Tab

#### Gesture Priority Map

```
Priority 1: System back gesture (left edge swipe)
Priority 2: ScrollView vertical scroll (large title + tab bar coordination)
Priority 3: Share button tap → native Share Sheet
Priority 4: Copy Link tap → clipboard
Priority 5: QR button tap → QR overlay on compact card preview
```

#### Share Button → Share Sheet

```
Gesture:     Pressable.onPress on full-width CTA
Haptic:      haptic.success() — fired AFTER Share.share() resolves successfully
             haptic.light() — fired on press-in as feedback
Animation:   Button press: withSpring(0.98, { stiffness: 500, damping: 30 })
             → release: withSpring(1.0, { stiffness: 500, damping: 30 })
             Share Sheet: system-managed presentation (UIActivityViewController)
Visual:      systemBlue Liquid Glass button (GlassView with tintColor)
             On press: opacity 0.85 + scale 0.98
```

#### Copy Link → Clipboard

```
Gesture:     Pressable.onPress
Haptic:      haptic.success() — fired after Clipboard.setString()
Animation:   Text momentarily changes "Copy Link" → "Copied!" (300ms)
             FadeIn on "Copied!", auto-revert after 2000ms
Visual:      Text button, systemBlue, 15pt medium
```

#### QR Button → QR Overlay

Same animation spec as Card tab QR overlay (Section 2.1), but rendered over the compact card preview on Share tab.

### 2.3 Settings Tab

#### Gesture Priority Map

```
Priority 1: System back gesture
Priority 2: ScrollView vertical scroll (large title + tab bar coordination)
Priority 3: Switch toggle (Auto-Sync)
Priority 4: Row tap navigation
Priority 5: SegmentedControl (Theme picker)
Priority 6: Color swatch tap (Accent Color)
```

#### Switch Toggle (Auto-Sync)

```
Gesture:     Switch component (system UISwitch via react-native)
Haptic:      haptic.selection() — fired on value change
Animation:   System-managed UISwitch animation
```

#### Theme SegmentedControl

```
Gesture:     Tap segment (System / Light / Dark)
Haptic:      haptic.selection()
Animation:   System UISegmentedControl transition
```

#### Accent Color Swatch Tap

```
Gesture:     Pressable.onPress on color circle
Haptic:      haptic.selection()
Animation:   Selected swatch: scale spring 1.0 → 1.15 → 1.0 (snappy)
             Checkmark appears via FadeIn.duration(150)
             Previous swatch: checkmark FadeOut.duration(150)
```

#### Reset Card (Destructive)

```
Gesture:     Pressable.onPress on destructive row
Haptic:      haptic.warning() — fired on press
System:      Alert.alert() with "Cancel" (cancel style) + "Reset" (destructive style)
             If confirmed: haptic.error() + execute reset
```

### 2.4 Editor (Push from Home)

#### Gesture Priority Map

```
Priority 1: System back gesture (swipe from left edge) → pop to Home
Priority 2: ScrollView vertical scroll (grouped list)
Priority 3: Field visibility Switch toggles
Priority 4: Version name TextInput
Priority 5: Accent color picker
Priority 6: Font weight SegmentedControl
```

#### Keyboard Avoidance

```
Approach:    ScrollView system behavior — NO useAnimatedKeyboard()
Behavior:    When version name TextInput focuses —
             (1) Keyboard opens with system animation
             (2) ScrollView auto-scrolls TextInput into view (iOS system behavior)
             (3) No manual padding adjustment needed

Implementation:
  <ScrollView
    contentInsetAdjustmentBehavior="automatic"
    keyboardDismissMode="interactive"
    keyboardShouldPersistTaps="handled"
  >

Why NOT useAnimatedKeyboard():
  - Editor is a Stack push screen — tab bar is hidden behind it
  - useAnimatedKeyboard().height includes system bottom inset,
    which could double-stack with contentInsetAdjustmentBehavior
  - Editor has only 1 TextInput (version name) — ScrollView's
    native auto-scroll is sufficient, no Reanimated needed
  - Simpler = fewer bugs. Reserve useAnimatedKeyboard() for
    screens with complex multi-input keyboard interactions.
```

#### Field Visibility Toggle

```
Gesture:     Switch.onValueChange
Haptic:      haptic.selection() — on every toggle
Animation:   Live card preview at top updates immediately
             Card field FadingTransition (field appears/disappears with fade)
Debounce:    500ms debounce to Supabase via cardStore.updateVersion()
```

#### Done / Back Button

```
Done:        Pressable.onPress in headerRight → router.back()
             Haptic: haptic.light()
Back:        System back gesture (left edge swipe)
             OR headerLeft back arrow (system-managed)
Transition:  Standard Stack pop (system UINavigationController)
```

---

## 3. Transition Specifications

### 3.1 Home → Editor (Stack Push)

**Decision: Standard Stack push, NOT zoom transition.**

Rationale:
- `Link.AppleZoom` best practice says "avoid skinny full-width list rows as zoom sources" — the Edit button is a nav bar text item, not a visual element that maps to the editor
- The card on Home is full-size; the editor preview is compact. Aspect ratio mismatch makes zoom feel wrong
- Standard iOS push (slide from right) is the correct pattern for "edit this thing" — Apple Settings, Contacts, and every system app uses push for edit screens
- Zoom transitions are for "expand this visual into detail" — not "open editing tools"

```
Trigger:     router.push("/editor") from Edit button OR card display
Transition:  UINavigationController default push (slide from right)
Duration:    System-managed (~350ms)
Haptic:      haptic.light() on Edit button press (before transition starts)
Back:        System interactive pop (swipe from left edge, cancelable)
```

### 3.2 QR Overlay Enter/Exit

```
Enter trigger:   Card tap (Pressable.onPress)
Enter animation: Animated.View with entering={ZoomIn.springify().stiffness(600).damping(15)}
                 The overlay scales from 0 → 1 with a slight bounce overshoot
                 Duration: ~400ms total (spring settles)
Enter haptic:    haptic.medium() — synchronous with press

Exit trigger:    (a) Tap overlay OR (b) Swipe down on overlay
Exit animation:  Animated.View with exiting={ZoomOut.duration(200)}
                 Fast scale-to-zero, no bounce (intentional asymmetry: enter is playful, exit is snappy)
Exit haptic:     haptic.light()
```

**Swipe-down dismiss detail:**

The overlay uses a **dual-layer structure** to handle the opacity transition
during interactive dismiss. Without a blur safety net, the underlying card
content flashes through unblurred when overlay opacity drops below ~80%.

```tsx
// Dual-layer overlay structure
{showQR && (
  <View style={StyleSheet.absoluteFill}>
    {/* Layer 1: Blur safety net — always present, invisible under 97% overlay */}
    <BlurView intensity={20} tint="systemMaterial" style={StyleSheet.absoluteFill} />

    {/* Layer 2: Frosted content — animated on pan gesture */}
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.qrOverlay, overlayStyle]}>
        {/* QR code + URL */}
      </Animated.View>
    </GestureDetector>
  </View>
)}
```

When fully visible, the 97% opacity frosted layer completely covers the BlurView.
During swipe-down, as the frosted layer's opacity drops, the BlurView "shows through"
to provide soft content blurring. On dismiss completion, both layers are removed
via conditional render (`showQR` → false).

```tsx
const translateY = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (e.translationY > 0) {
      translateY.value = e.translationY;
    }
  })
  .onEnd((e) => {
    if (e.translationY > 100 || e.velocityY > 500) {
      // Dismiss
      runOnJS(haptic.light)();
      runOnJS(setShowQR)(false);
    } else {
      // Snap back
      translateY.value = withSpring(0, { stiffness: 500, damping: 30 });
    }
  });

// Style — only the frosted content layer animates
const overlayStyle = useAnimatedStyle(() => ({
  transform: [
    { translateY: translateY.value },
    { scale: interpolate(translateY.value, [0, 300], [1, 0.8], 'clamp') },
  ],
  opacity: interpolate(translateY.value, [0, 300], [1, 0], 'clamp'),
}));
```

### 3.3 Version Switch Crossfade

```
Trigger:     Version chip tap
Animation:   Animated.View with layout={FadingTransition}
             wrapping the CardDisplay component
Duration:    FadingTransition default (~300ms)
Haptic:      haptic.selection() — synchronous with chip press
```

The `FadingTransition` layout animation handles the crossfade between old and new card content. No manual opacity management needed.

### 3.4 Tab Switch

```
Transition:  System-managed (NativeTabs / UITabBarController)
Custom:      NONE — NativeTabs does not support custom tab switch transitions
Duration:    System default (instant switch, no animation between tab content)
Haptic:      NONE — tab switches are silent per iOS convention
```

**Important:** Do not attempt to add crossfade or slide animations between tabs. UITabBarController switches content instantly. Any perceived transition comes from the liquid glass tab bar's selection indicator animation, which is system-managed.

### 3.5 Onboarding Flow

```
Step 1 → 2 → 3: Standard Stack push (slide from right)
Step 3 → (tabs): router.replace("/(tabs)") — no back gesture available
                  This is a state transition, not a navigation transition

Transition:  System UINavigationController push/pop
Haptic:      haptic.light() on each "Next" / "Continue" CTA
```

---

## 4. Large Title Collapse Coordination

### 4.1 Required Configuration (All 3 Tab Stacks)

```tsx
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

**This is the EXACT config. Do not modify ANY property.** See memory: `feedback_native_stack_large_title.md`.

### 4.2 ScrollView Requirements

Each tab screen MUST follow these rules for large title + tab bar coordination:

1. **ScrollView is the first direct child** of the screen component (no wrapper Views)
2. **`contentInsetAdjustmentBehavior="automatic"`** — handles both nav bar top inset AND tab bar bottom inset
3. **Pure RN ScrollView** from `react-native` — no tw wrapper, no custom ScrollView
4. **No SwiftUI Host components** inside the ScrollView
5. **`collapsable={false}`** on any View that wraps a ScrollView (if absolutely necessary)

### 4.3 Content Inset Behavior

```
┌──────────────────────────┐
│  Nav Bar (large title)    │  ← auto top inset
│  "LinkCard"               │
├──────────────────────────┤
│                           │
│  ScrollView content       │  ← contentInsetAdjustmentBehavior
│  starts here              │     handles top AND bottom
│                           │
│                           │
│                           │
├──────────────────────────┤
│  Tab Bar (glass)          │  ← auto bottom inset
│  [Card] [Share] [Settings]│
└──────────────────────────┘

On scroll down:
┌──────────────────────────┐
│ LinkCard            Edit  │  ← collapsed small title
├──────────────────────────┤
│                           │
│  ScrollView content       │  ← content fills reclaimed space
│  (more visible)           │
│                           │
│                           │
│                           │
│                           │
│         [pill]            │  ← minimized tab bar (floating pill)
└──────────────────────────┘
```

### 4.4 Editor Screen Exception

The editor does NOT use large title:
```tsx
<Stack.Screen
  name="editor"
  options={{
    title: "Edit Card",
    headerLargeTitle: false,  // Standard small title for editor
  }}
/>
```

Rationale: Editor is a utility screen with a compact card preview at top. Large title would push the preview too far down, wasting vertical space. Standard small title with Done button is the Apple pattern for edit screens.

---

## 5. Spring Configuration Reference

All springs are Reanimated `withSpring()` or `.springify()` configs.

| Name | Stiffness | Damping | Mass | Use Case |
|---|---|---|---|---|
| `snappy` | 500 | 30 | 1 | Button press scale, chip tap, immediate tactile feedback |
| `gesture` | 400 | 25 | 1 | Drag/flick responses, swipe dismiss interpolation |
| `bouncy` | 600 | 15 | 1 | QR overlay enter, success celebrations — visible overshoot |
| `gentle` | 300 | 25 | 1 | List stagger, layout reflow, subtle position changes |

### Spring Behavior Characteristics

```
snappy:  Fast settle (~200ms), minimal overshoot, feels "responsive"
gesture: Moderate settle (~250ms), slight overshoot, feels "physical"
bouncy:  Slow settle (~400ms), significant overshoot (10-15%), feels "playful"
gentle:  Slow settle (~350ms), no overshoot, feels "smooth"
```

### When to Use Springs vs Timing

- **Springs** (user-initiated): tap, press, gesture release, toggle
- **Timing** (system-initiated): auto-dismiss, state transition, entering/exiting
- **System-managed**: tab switch, large title collapse, back gesture, Share Sheet

---

## 6. Haptic Mapping (Complete)

Every user-initiated interaction produces haptic feedback. System-managed transitions (tab switch, large title, back gesture) do NOT produce app-level haptics.

| Screen | Action | Haptic Type | Timing |
|---|---|---|---|
| **Card** | Tap card (QR toggle) | `medium` | On press, before animation |
| **Card** | Tap version chip | `selection` | On press, before animation |
| **Card** | Long press chip | `medium` | When context menu appears |
| **Card** | Tap Edit button | `light` | On press, before push |
| **Card** | Pull to refresh | `light` | When pull threshold crossed |
| **Card** | Dismiss QR (tap) | `light` | On press |
| **Card** | Dismiss QR (swipe) | `light` | When dismiss threshold crossed |
| **Share** | Tap Share button | `light` (press) + `success` (complete) | Two haptics: press-in and success |
| **Share** | Tap Copy Link | `success` | After clipboard write |
| **Share** | Tap QR button | `medium` | On press |
| **Settings** | Toggle switch | `selection` | On value change |
| **Settings** | Tap theme segment | `selection` | On segment press |
| **Settings** | Tap accent color | `selection` | On press |
| **Settings** | Tap Reset Card | `warning` | On press |
| **Settings** | Confirm Reset | `error` | After destructive confirmation |
| **Editor** | Toggle field switch | `selection` | On value change |
| **Editor** | Tap font weight | `selection` | On segment press |
| **Editor** | Tap accent color | `selection` | On press |
| **Editor** | Tap Done | `light` | On press, before pop |

---

## 7. Gesture Conflict Resolution

### 7.1 Card Tab: Nested ScrollViews

```
Outer: Vertical ScrollView (full screen, controls large title + tab bar)
Inner: Horizontal ScrollView (version chips, constrained height 40pt)

Resolution: Standard iOS nested scroll view behavior —
  - Vertical drag → outer ScrollView captures
  - Horizontal drag → inner ScrollView captures
  - Diagonal drag → iOS resolves based on initial velocity vector
  - No custom gesture handling needed
```

### 7.2 QR Overlay: Pan vs ScrollView

When QR overlay is visible, the underlying ScrollView should NOT scroll:

```tsx
<ScrollView
  scrollEnabled={!showQR}  // Disable scroll when overlay is shown
  contentInsetAdjustmentBehavior="automatic"
>
```

The overlay's pan-to-dismiss gesture (Section 3.2) takes priority while overlay is visible.

### 7.3 Editor: Keyboard + ScrollView

```
TextInput focus:
  1. Keyboard opens (system animation, ~250ms)
  2. ScrollView auto-scrolls to keep TextInput visible
     (iOS system behavior with contentInsetAdjustmentBehavior="automatic")
  3. keyboardDismissMode="interactive" allows swipe-down to dismiss
  4. Tab bar is NOT visible (editor is pushed Stack screen, covers tabs)
     → no inset conflict
  5. No useAnimatedKeyboard() — system ScrollView behavior is sufficient
     for editor's single TextInput (version name)
```

### 7.4 System Back Gesture Priority

The system left-edge swipe for back navigation always takes priority over any app gesture. This is enforced by UIKit and cannot be overridden.

On the editor screen: back gesture → pops to Home tab (expected behavior).
On tab root screens: back gesture → no-op (no screen to pop to).

---

## 8. Accessibility Interaction Adjustments

### 8.1 Reduce Motion

When `UIAccessibilityIsReduceMotionEnabled()` returns true:

| Normal | Reduced Motion |
|---|---|
| `ZoomIn.springify()` | `FadeIn.duration(200)` |
| `ZoomOut.duration(200)` | `FadeOut.duration(200)` |
| Spring scale on button press | No scale, opacity only |
| `FadingTransition` crossfade | Instant swap (no layout animation) |
| Chip scale spring | No scale |

### 8.2 Touch Targets

All interactive elements meet 44pt minimum:

| Element | Actual Size | Touch Target |
|---|---|---|
| Version chip | 40pt height | 44pt (hitSlop: { top: 2, bottom: 2 }) |
| Edit button | 44pt minWidth/minHeight | 44pt native |
| Settings row | 50pt height | 50pt native |
| Share CTA | 50pt height | 50pt native |
| Color swatch | 28pt visible | 44pt (hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }) |

### 8.3 VoiceOver Announcements

| Action | Announcement |
|---|---|
| Version chip tap | "{version name}, selected" |
| QR overlay open | "QR code displayed. Tap to dismiss." |
| QR overlay close | "QR code hidden." |
| Copy Link | "Link copied to clipboard." |
| Share success | "Card shared." |
| Field toggle | "{field name}, {on/off}" |

---

## 9. Glass Effect Guard Rule (Mandatory)

**Every GlassView must be guarded by `isGlassEffectAPIAvailable()` with a non-glass fallback.**

This applies to:
- Version chips (selected state) — fallback: `View` with solid `accentColor` background
- Share CTA button — fallback: `View` with solid `systemBlue` background
- Any future glass surface

```tsx
const useGlass = isGlassEffectAPIAvailable();

// Pattern: always provide both paths
{useGlass ? (
  <GlassView glassEffectStyle="regular" tintColor={tintColor} style={styles.surface}>
    {children}
  </GlassView>
) : (
  <View style={[styles.surface, { backgroundColor: fallbackColor }]}>
    {children}
  </View>
)}
```

**Glass surfaces per screen (must stay under 6 compositing layers):**

| Screen | Glass Surfaces | Count |
|---|---|---|
| Card tab | Tab bar (system) + 1 selected chip | 2 |
| Share tab | Tab bar (system) + Share CTA | 2 |
| Settings tab | Tab bar (system) | 1 |
| Editor | None (pushed screen, tab bar hidden) | 0 |

---

## 10. Implementation Checklist

- [ ] Add `minimizeBehavior="onScrollDown"` to NativeTabs
- [ ] Verify ScrollView is first child on all 3 tab screens
- [ ] QR overlay: `ZoomIn.springify().stiffness(600).damping(15)` enter
- [ ] QR overlay: `ZoomOut.duration(200)` exit
- [ ] QR overlay: dual-layer structure (BlurView safety net + animated frosted content)
- [ ] QR overlay: pan-to-dismiss gesture with interpolated scale/opacity
- [ ] QR overlay: disable ScrollView scroll when overlay visible
- [ ] Version chip: instant color/bg/weight switch + scale spring (snappy)
- [ ] Version chip: `FadingTransition` layout animation on CardDisplay (separate from chip)
- [ ] Share button: press scale animation (snappy 0.98 → 1.0)
- [ ] Editor: ScrollView keyboard avoidance (keyboardDismissMode="interactive")
- [ ] All haptics mapped per Section 6
- [ ] Reduce Motion alternative animations
- [ ] 44pt touch targets verified on all interactive elements
- [ ] VoiceOver labels on all interactive elements
- [ ] Static colors (not PlatformColor) for all Reanimated animated styles

---

*This spec defines how every pixel moves and every interaction feels. The redesign spec (linkcard-redesign-spec.md) defines what the screens contain. This spec defines how they behave.*
