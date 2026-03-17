# Discover Tab — Design Spec

## Summary

Replace the second tab (Smart Share) with a **Discover** tab that lets users browse random LinkCard profiles one at a time and save them to a personal collection (card holder). Smart Share functionality will be integrated into the Home tab in a future iteration.

## Scope

- Remove `(share)/` tab entirely
- Create `(discover)/` tab with two screens: discover feed + card holder
- Add `ContactAction` type (user-defined "Say Hi" behavior)
- Add `SavedContact` type for card holder
- Add new Zustand store for contacts
- Add "Contact Preferences" section in Settings
- New tab icon asset

## Out of Scope

- Home tab swipe-to-share gesture (separate task)
- In-app messaging / chat system
- AI Agent conversations
- Backend API for random user feed (use mock data)

---

## Data Model

### New Types (`src/types/index.ts`)

```ts
// How others can contact this user — user-configurable
export type ContactActionType = 'email' | 'linkedin' | 'wechat' | 'url';

export interface ContactAction {
  type: ContactActionType;
  label: string;   // Display text, e.g. "Email Me", "Connect on LinkedIn"
  value: string;   // email address, LinkedIn URL, WeChat ID, or custom URL
}

// A saved contact in the user's card holder
export interface SavedContact {
  id: string;
  profile: LinkedInProfile;
  contactAction?: ContactAction;
  savedAt: string;  // ISO 8601 string — survives JSON serialization in AsyncStorage
}

// Lightweight version info for discovery rendering — subset of CardVersion
// Omits fieldStyles (user-local customization) to keep the data contract light
export interface DiscoverProfile {
  id: string;
  profile: LinkedInProfile;
  template: CardTemplate;
  accentColor: string;
  background: CardBackground;
  visibleFields: (keyof LinkedInProfile | 'qrCode')[];
  contactAction?: ContactAction;
  qrCodeData: string;
}
```

### BusinessCard Extension

Add optional `contactAction` field to `BusinessCard`:

```ts
export interface BusinessCard {
  // ... existing fields
  contactAction?: ContactAction;  // NEW — how others can reach this user
}
```

### RootStackParamList Update

Remove `share` route, add `discover` and `collection`:

```ts
export type RootStackParamList = {
  index: undefined;
  onboarding: undefined;
  card: { cardId: string };
  discover: undefined;         // replaces share
  collection: undefined;
  settings: undefined;
};
```

---

## Store: `contactsStore.ts`

New Zustand store at `src/stores/contactsStore.ts`, persistence key `'linkcard-contacts'`:

```ts
type DiscoverStatus = 'browsing' | 'batch_exhausted' | 'daily_limit_reached' | 'loading';

interface ContactsState {
  savedContacts: SavedContact[];

  // Discover state
  discoverBatch: DiscoverProfile[];
  discoverIndex: number;              // 0..4, clamped
  discoverStatus: DiscoverStatus;
  refreshesUsed: number;              // 0..5
  lastRefreshDate: string;            // YYYY-MM-DD local date string
  seenIds: string[];                  // IDs seen in current day, prevents repeats

  // Actions
  saveContact: (profile: DiscoverProfile) => void;
  removeContact: (id: string) => void;
  nextCard: () => void;              // index++ or transition to batch_exhausted
  refreshBatch: () => void;          // pull 5 new, increment refreshesUsed, or daily_limit_reached
  resetDailyIfNeeded: () => void;    // called on mount, compares lastRefreshDate to today
}
```

**`nextCard` behavior:** increments `discoverIndex`. When `discoverIndex >= discoverBatch.length - 1`, sets `discoverStatus = 'batch_exhausted'`. If `refreshesUsed >= 5`, sets `discoverStatus = 'daily_limit_reached'`.

**`refreshBatch` behavior:** picks 5 random profiles from mock pool excluding `seenIds`. Appends new IDs to `seenIds`. Resets `discoverIndex = 0`, sets `discoverStatus = 'browsing'`, increments `refreshesUsed`.

**`resetDailyIfNeeded` behavior:** compares `lastRefreshDate` against `new Date().toISOString().slice(0, 10)` (UTC date). If different, resets `refreshesUsed = 0`, `seenIds = []`, updates `lastRefreshDate`.

**Persisted fields:** `savedContacts`, `refreshesUsed`, `lastRefreshDate`, `seenIds`. Discover batch is not persisted (regenerated on mount).

---

## Screen Architecture

### File Structure

```
app/(tabs)/(discover)/
  _layout.tsx       — Stack navigator, title "Discover"
  index.tsx         — Discover feed: one card at a time + action buttons
  collection.tsx    — Card holder list (pushed from header button)
```

### Tab Configuration

- **Icon**: New `tab-discover` asset (people/cards icon, Majesticons style)
- **Label**: Hidden (consistent with other tabs)
- **Position**: Second tab (between Card and Settings)

### Discover Screen (`index.tsx`)

**Header:** Uses `Stack.Toolbar` API (consistent with Home tab):
- Left: `Stack.Toolbar.View` with liquid glass bookmark button → `router.push('collection')`
- Right: refresh count badge

**Layout:**
- Full-width CardDisplay centered vertically (reuse existing component)
- Build a `CardVersion` on the fly from `DiscoverProfile` fields for CardDisplay compatibility
- Progress indicator at top: "2 / 5" (current / total in batch)
- Bottom action bar: two buttons side by side
  - Left: **"Next"** — outline/secondary style, skip to next card
  - Right: **"Say Hi"** — filled/primary style, execute contact action
- Bookmark icon on card (top-right corner) to save to collection

**States:**
- `loading`: Spinner (should be instant with mock data, placeholder for real API)
- `browsing`: Card + action buttons
- `batch_exhausted`: "Refresh" button with remaining count (e.g. "4 refreshes left")
- `daily_limit_reached`: "Come back tomorrow" message with countdown or illustration

**Daily Limits:**
- 5 refreshes per day, 5 cards per refresh
- Reset check on screen mount via `resetDailyIfNeeded()`

**Animations:**
- Card transition: FadeInRight (entering) / FadeOutLeft (exiting) via re-keying `<Animated.View key={currentProfile.id}>`
- Bookmark: scale spring using `springs.gentle` from `@/src/lib/springs`
- Haptic: `haptic.selection()` on Next, `haptic.success()` on Save, `haptic.medium()` on Say Hi

**Contact action fallback:** If `contactAction` is undefined, default to opening `profile.url` (LinkedIn profile).

### Card Holder (`collection.tsx`)

**Entry:** Left `Stack.Toolbar.View` button in Discover screen header — liquid glass bookmark icon. Navigated via `router.push('collection')`.

**Header:** Native large title "Card Holder", back button to return to Discover.

**Layout:**
- List of saved contacts using SettingsGroup/SettingsRow primitives
- Each row: Avatar (36pt) + Name + Headline (secondary) + chevron
- Tap row → push to detail view showing full CardDisplay + "Say Hi" button
- Swipe-to-delete via `removeContact()`

**Empty State:**
- Centered text: "No saved cards yet"
- Subtitle: "Browse Discover to find and save interesting people"

---

## Settings Integration

Add new section in Settings tab under existing sections:

**Section: "CONTACT PREFERENCES"**

```
┌─────────────────────────────────────────┐
│ 📧  Contact Method    [LinkedIn     ▾]  │
├─────────────────────────────────────────┤
│ 🔗  Contact Value     linkedin.com/...  │
└─────────────────────────────────────────┘
```

- **Contact Method**: Picker with options: Email, LinkedIn, WeChat, Custom URL
- **Contact Value**: Text input, placeholder adapts to method
- Saved to `cardStore.card.contactAction`

---

## Mock Data

Create `src/lib/mock-discover.ts` with 20-30 fake `DiscoverProfile` entries. Each has randomized name, headline, company, location, template, and contactAction. `refreshBatch()` picks 5 random ones from the pool excluding `seenIds`.

When `seenIds` exhausts the mock pool (all 20-30 seen), `refreshBatch` wraps around and clears `seenIds` to allow repeats.

---

## Tab Layout Changes

### `_layout.tsx` (native)
- Replace `(share)` trigger with `(discover)`
- New icon: `tab-discover.png` (@1x, @2x, @3x Majesticons-style PNGs)

### `_layout.web.tsx`
- Replace `(share)` tab with `(discover)`, icon: `people-outline` (Ionicons)

---

## Contact Action Execution

When user taps "Say Hi", behavior depends on `contactAction.type`:

| Type | Action |
|------|--------|
| `email` | `Linking.openURL('mailto:...')` |
| `linkedin` | `Linking.openURL('https://linkedin.com/in/...')` |
| `wechat` | Show modal with WeChat ID + copy button |
| `url` | `Linking.openURL(value)` |
| undefined | Default: `Linking.openURL(profile.url)` |

---

## Implementation Order

1. Tab layout swap — replace `(share)` with `(discover)` in both layouts, placeholder screens
2. Types — ContactAction, SavedContact, DiscoverProfile, BusinessCard extension, RootStackParamList
3. Mock data — `src/lib/mock-discover.ts`
4. Contacts store — `src/stores/contactsStore.ts`
5. Discover screen — card display + Next/Say Hi buttons + status states
6. Card holder screen — list + detail + swipe-to-delete
7. Settings contact preferences section
8. Tab icon asset (generate Majesticons-style people icon)
9. Documentation updates (CLAUDE.md files at all levels)
