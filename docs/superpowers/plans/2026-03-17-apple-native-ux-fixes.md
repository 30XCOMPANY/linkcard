# Apple Native UX Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six UX deficiencies that prevent the app from feeling Apple-native (font fixes excluded — handled separately).

**Architecture:** Minimal-diff fixes to existing screens. No new files except where deleting the old design-system leaves import gaps. Every fix targets a specific HIG violation identified in the audit.

**Tech Stack:** Tailwind v4 via `@/src/tw`, `react-native-reanimated` springs, `expo-haptics`, `react-native-css` platformColor

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/shared/striped-background.tsx` | Modify | Fix dark mode hardcode |
| `app/(tabs)/(home)/index.tsx` | Modify | Add entrance animations + CardDisplay press feedback |
| `src/components/card/card-display.tsx` | Modify | Add press scale + haptic on tap |
| `app/(tabs)/(settings)/index.tsx` | Modify | Fix ColorDot 44pt touch target |
| `app/onboarding/_layout.tsx` | Modify | Enable native headers for back navigation hint |
| `app/(tabs)/(home)/index.tsx` | Modify | Apple-style empty state |
| `app/(tabs)/(share)/index.tsx` | Modify | Apple-style empty state |
| `app/(tabs)/(home)/editor.tsx` | Modify | Apple-style empty state |
| `src/design-system/` | Delete (entire directory) | Remove ghost layer |
| `DESIGN_SYSTEM.md` | Delete | Remove stale documentation for deleted system |
| `src/stores/cardStore.ts` | Modify | Remove design-system import, use `src/lib/accent-colors` |

---

## Task 1: Fix StripedBackground Dark Mode (P0)

**Why:** Bottom 70% of home screen hardcodes `#F2F2F7` — dark mode renders a glaring light-grey slab.

**Files:**
- Modify: `src/components/shared/striped-background.tsx`

- [ ] **Step 1: Fix the hardcoded system background color**

Replace the hardcoded `#F2F2F7` with the `sf-bg` CSS variable so it resolves to the correct color in both light and dark modes. Also fix the gradient fade endpoint.

In `src/components/shared/striped-background.tsx`, change the `StripedBackground` component:

```tsx
// Before (lines 83-91):
<LinearGradient
  colors={["transparent", "rgba(255,255,255,0.85)", "#F2F2F7"]}
  locations={[0.2, 0.75, 1]}
  style={StyleSheet.absoluteFill}
/>
// ...
<View style={{ flex: 1, backgroundColor: "#F2F2F7" }} />

// After:
<LinearGradient
  colors={["transparent", "rgba(255,255,255,0.85)", sfBg]}
  locations={[0.2, 0.75, 1]}
  style={StyleSheet.absoluteFill}
/>
// ...
<View style={{ flex: 1, backgroundColor: sfBg }} />
```

Where `sfBg` comes from the CSS variable system. Add this import and constant at the top of the component:

```tsx
import { useCSSVariable } from "@/src/tw";

// Inside StripedBackground component, before the return:
const sfBg = useCSSVariable("--sf-bg");
```

Note: If `useCSSVariable` doesn't work inside this component (it uses raw RN `View` not `@/src/tw` View), fall back to `useColorScheme()`:

```tsx
import { useColorScheme } from "react-native";

// Inside component:
const colorScheme = useColorScheme();
const sfBg = colorScheme === "dark" ? "#000000" : "#F2F2F7";
const fadeMid = colorScheme === "dark" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)";
```

And update the gradient colors to use `fadeMid` instead of the hardcoded white-ish value:
```tsx
<LinearGradient
  colors={["transparent", fadeMid, sfBg]}
  locations={[0.2, 0.75, 1]}
  style={StyleSheet.absoluteFill}
/>
```

- [ ] **Step 2: Verify on device/simulator**

Run: `npx expo start` and toggle dark mode in iOS simulator (Cmd+Shift+A).
Expected: Background color smoothly transitions between light (#F2F2F7) and dark (#000000).

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/striped-background.tsx
git commit -m "fix: StripedBackground respects dark mode color scheme"
```

---

## Task 2: Delete Ghost Design System (P0)

**Why:** `src/design-system/` is an orphaned layer — zero live `.tsx`/`.ts` imports. Its tokens (`colors.ts`, `animation.ts`) conflict with the current `src/css/sf.css` and `src/lib/springs.ts`. Keeping it causes developer confusion about which source of truth to use.

**Files:**
- Delete: `src/design-system/` (entire directory)
- Delete: `DESIGN_SYSTEM.md`
- Modify: `src/stores/cardStore.ts` — remove `accentColors` import from design-system, use `src/lib/accent-colors.ts`

- [ ] **Step 1: Verify no live imports exist**

Run:
```bash
grep -r "@/src/design-system" --include="*.tsx" --include="*.ts" src/ app/
```
Expected: Zero results. (Only `DESIGN_SYSTEM.md` and `docs/` may reference it in prose.)

- [ ] **Step 2: Update cardStore import**

`src/stores/cardStore.ts` imports `accentColors` and `AccentColorKey` from the old system. Check `src/lib/accent-colors.ts` — it should already export these. If it does, update the import:

```tsx
// Before:
import { accentColors, AccentColorKey } from '@/src/design-system/tokens/colors';

// After:
import { accentColors, type AccentColorKey } from '@/src/lib/accent-colors';
```

If `src/lib/accent-colors.ts` doesn't have the exact same exports, copy the `accentColors` object and `AccentColorKey` type from `src/design-system/tokens/colors.ts` into `src/lib/accent-colors.ts` before deleting.

- [ ] **Step 3: Read accent-colors.ts to verify exports match**

Read `src/lib/accent-colors.ts` and compare its `accentColors` object with the one in `src/design-system/tokens/colors.ts`. They must have the same keys and values.

- [ ] **Step 4: Delete the design-system directory**

```bash
rm -rf src/design-system/
rm DESIGN_SYSTEM.md
```

- [ ] **Step 5: Verify app still compiles**

Run: `npx expo start` — confirm no import errors in the terminal.

- [ ] **Step 6: Update CLAUDE.md**

Remove the `design-system/` entry from the directory structure in `/CLAUDE.md`. The tree should no longer reference `src/design-system/` or its subdirectories.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: delete orphaned design-system layer, migrate last import to lib/accent-colors"
```

---

## Task 3: Home Screen Entrance Animations (P1)

**Why:** Home is the most-seen screen. Card, version chips, and quick actions render instantly with zero motion — feels static and lifeless. Apple Wallet, Music, and Photos all use staggered entrance animations.

**Files:**
- Modify: `app/(tabs)/(home)/index.tsx`

- [ ] **Step 1: Add staggered FadeInDown to Home sections**

Import `FadeInDown` from reanimated and wrap the three sections (card, version selector, quick actions) with `Animated.View` using staggered delays. Use the existing `springs` constants.

At the top, add the import:
```tsx
import { FadeInDown } from "react-native-reanimated";
```

Wrap the Card Display section (around line 159):
```tsx
<Animated.View
  entering={FadeInDown.delay(0)
    .springify()
    .stiffness(springs.gentle.stiffness)
    .damping(springs.gentle.damping)}
>
  <View className="px-4 pt-4">
    <CardDisplay ... />
  </View>
</Animated.View>
```

Wrap the Version Selector (around line 169):
```tsx
<Animated.View
  entering={FadeInDown.delay(80)
    .springify()
    .stiffness(springs.gentle.stiffness)
    .damping(springs.gentle.damping)}
>
  <ScrollView horizontal ...>
    ...
  </ScrollView>
</Animated.View>
```

Wrap the Quick Actions (around line 186):
```tsx
<Animated.View
  entering={FadeInDown.delay(160)
    .springify()
    .stiffness(springs.gentle.stiffness)
    .damping(springs.gentle.damping)}
>
  <View className="flex-row items-center justify-center gap-3 mt-1">
    ...
  </View>
</Animated.View>
```

Note: `Animated` is already imported via `@/src/tw/animated`. Use `Animated.View` from that import, which supports `className`. If `entering` doesn't work on the tw-wrapped version, use `RNAnimated.View` directly from `react-native-reanimated` for the entrance wrappers (they don't need className).

- [ ] **Step 2: Verify visually**

Run: Navigate away from Home tab and back. The card, chips, and actions should stagger in with a gentle spring.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/index.tsx
git commit -m "feat: add staggered entrance animations to Home screen"
```

---

## Task 4: CardDisplay Press Feedback (P1)

**Why:** The card is the main interactive element on Home — tapping it toggles QR. But there's no visual feedback (no scale, no haptic). Users don't discover it's tappable.

**Files:**
- Modify: `app/(tabs)/(home)/index.tsx` — wrap CardDisplay in pressable with scale animation
- Modify: `src/components/card/card-display.tsx` — make it accept `onPress` prop (optional)

- [ ] **Step 1: Add press feedback wrapper in Home**

In `app/(tabs)/(home)/index.tsx`, wrap CardDisplay with a Pressable that has spring scale feedback:

```tsx
// Add near the top of HomeScreen component:
const cardScale = useSharedValue(1);

// In the JSX, replace the bare CardDisplay with:
<Pressable
  onPress={() => {
    haptic.medium();
    setShowQR((p) => !p);
  }}
  onPressIn={() => {
    cardScale.value = withSpring(0.97, springs.snappy);
  }}
  onPressOut={() => {
    cardScale.value = withSpring(1, springs.snappy);
  }}
  accessibilityLabel={showQR ? "Hide QR code" : "Show QR code"}
  accessibilityRole="button"
>
  <Animated.View style={{ transform: [{ scale: cardScale }] }}>
    <CardDisplay
      profile={card.profile}
      version={currentVersion}
      qrCodeData={card.qrCodeData}
      showQR={showQR}
    />
  </Animated.View>
</Pressable>
```

Make sure `useAnimatedStyle` is not needed — the inline `style={{ transform }}` with shared value works directly on `Animated.View`.

- [ ] **Step 2: Verify**

Run: Tap the card on Home. It should scale down slightly on press, spring back on release, and toggle QR with a medium haptic.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/index.tsx
git commit -m "feat: add press scale + haptic feedback to CardDisplay on Home"
```

---

## Task 5: Fix ColorDot 44pt Touch Target (P2)

**Why:** Settings color picker dots are 36x36px — below Apple's 44pt minimum touch target. Users will mis-tap on smaller devices.

**Files:**
- Modify: `app/(tabs)/(settings)/index.tsx`

- [ ] **Step 1: Increase touch target to 44pt**

In the `ColorDot` component, change the outer `Pressable` style to have a 44x44 minimum area while keeping the visual dot at 36px. The simplest approach: set `minWidth: 44` and `minHeight: 44` on the Pressable, center the dot visually:

```tsx
// In ColorDot component, change the Pressable style:
<Pressable
  onPress={() => { ... }}
  onPressIn={() => { ... }}
  onPressOut={() => { ... }}
  accessibilityLabel={`${colorKey} background`}
  accessibilityRole="button"
  style={{
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <View
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: hex,
      borderWidth: selected ? 3 : 1,
      borderColor: selected ? "#000000" : "rgba(0,0,0,0.08)",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {selected && <Icon web="check" size={16} color="#FFFFFF" />}
  </View>
</Pressable>
```

Note: Import `View` from react-native (or use the inner view pattern) — the inner View is the visual dot, the outer Pressable is the touch target.

- [ ] **Step 2: Adjust gap for new size**

The parent container uses `gap-3` (12px). With 44px dots the grid may feel too tight. Test visually — if it does, change `gap-3` to `gap-2` (8px) since the dots themselves now have 4px of built-in padding.

- [ ] **Step 3: Verify**

Run: Open Settings > Appearance. Dots should be the same visual size (36px circles) but easier to tap. No overlap between adjacent dots.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(settings\)/index.tsx
git commit -m "fix: ColorDot touch target meets 44pt HIG minimum"
```

---

## Task 6: Onboarding Navigation Back Hints (P2)

**Why:** Onboarding Stack has `headerShown: false` on auth (index), then `headerShown: true` on linkedin/preview. But the auth → linkedin transition gives no swipe-back affordance because the auth screen has no header. Users pushed into linkedin can't visually discover "swipe from left edge to go back".

**Files:**
- Modify: `app/onboarding/_layout.tsx`

- [ ] **Step 1: Enable transparent header for back gesture hint**

Change the onboarding layout to show the native header on linkedin and preview with a transparent background, so the system back button/swipe gesture is discoverable:

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
      <Stack.Screen
        name="linkedin"
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerBlurEffect: "regular",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
```

This gives:
- A native back chevron on linkedin/preview (iOS renders `<` by default)
- Transparent header so it doesn't add a colored bar
- Blur effect so content scrolling under looks correct
- Empty title to keep it minimal

- [ ] **Step 2: Adjust content padding in linkedin.tsx**

The linkedin screen currently has `pt-8` on its content container. With the transparent header now visible, content may overlap the back button. Either keep as-is (the `contentContainerClassName="flex-grow pt-8 pb-32"` should be fine since ScrollView pushes content down) or increase to `pt-16` if the back button overlaps the title.

Test visually and adjust if needed.

- [ ] **Step 3: Verify**

Run: Go through onboarding flow. On the linkedin and preview screens, a native back chevron should appear in the top-left. Swiping from the left edge should navigate back.

- [ ] **Step 4: Commit**

```bash
git add app/onboarding/_layout.tsx
git commit -m "feat: add transparent header with back gesture hint to onboarding flow"
```

---

## Task 7: Apple-Style Empty States (P2)

**Why:** Empty states are a single line of grey text. Apple's standard (Files, Notes, Reminders) uses icon + title + description + action button.

**Files:**
- Modify: `app/(tabs)/(home)/index.tsx`
- Modify: `app/(tabs)/(share)/index.tsx`
- Modify: `app/(tabs)/(home)/editor.tsx`

- [ ] **Step 1: Create empty state pattern**

All three screens have the same pattern. Replace each empty state with a centered column: icon, title, subtitle.

In `app/(tabs)/(home)/index.tsx`, replace the empty guard (around line 139):

```tsx
if (!card || !currentVersion) {
  return (
    <View className="flex-1 items-center justify-center bg-sf-bg px-8">
      <Icon web="creditcard" size={48} color="rgba(60,60,67,0.3)" />
      <Text className="text-title-3 font-semibold text-sf-text mt-4 text-center">
        No Card Yet
      </Text>
      <Text className="text-subheadline text-sf-text-2 mt-1 text-center">
        Complete onboarding to create your digital business card.
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Update Share empty state**

In `app/(tabs)/(share)/index.tsx`, replace the empty guard (around line 131):

```tsx
if (!card || !currentVersion || !previewVersion) {
  return (
    <View className="flex-1 items-center justify-center bg-sf-bg px-8">
      <Icon web="send" size={48} color="rgba(60,60,67,0.3)" />
      <Text className="text-title-3 font-semibold text-sf-text mt-4 text-center">
        Nothing to Share
      </Text>
      <Text className="text-subheadline text-sf-text-2 mt-1 text-center">
        Create your card first, then share it with anyone.
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Update Editor empty state**

In `app/(tabs)/(home)/editor.tsx`, replace the empty guard (around line 119):

```tsx
if (!card || !version) {
  return (
    <View className="flex-1 items-center justify-center bg-sf-bg px-8">
      <Icon web="edit-pen" size={48} color="rgba(60,60,67,0.3)" />
      <Text className="text-title-3 font-semibold text-sf-text mt-4 text-center">
        No Card to Edit
      </Text>
      <Text className="text-subheadline text-sf-text-2 mt-1 text-center">
        Go back and create your card first.
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Verify**

Run: Clear card from Settings > Reset Card. Navigate to each tab. Each should show the icon + title + subtitle centered vertically.

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/\(home\)/index.tsx app/\(tabs\)/\(share\)/index.tsx app/\(tabs\)/\(home\)/editor.tsx
git commit -m "feat: Apple-style empty states with icon, title, and subtitle"
```

---

## Execution Order

1. **Task 1** — StripedBackground dark mode (isolated, zero dependencies)
2. **Task 2** — Delete ghost design-system (clears confusion for all subsequent work)
3. **Task 3** — Home entrance animations
4. **Task 4** — CardDisplay press feedback
5. **Task 5** — ColorDot touch target
6. **Task 6** — Onboarding back hints
7. **Task 7** — Empty states

Tasks 3-7 are independent of each other and can be parallelized after Tasks 1-2 complete.
