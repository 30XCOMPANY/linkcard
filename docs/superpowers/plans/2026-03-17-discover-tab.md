# Discover Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Share tab with a Discover tab for browsing random user profiles and saving them to a card holder collection.

**Architecture:** New `(discover)/` tab group with two Stack screens (feed + collection). New `contactsStore` for saved contacts and discover state. `DiscoverProfile` is a flat struct that bridges to `CardDisplay` by constructing a `CardVersion` on the fly. Settings gets a "Contact Preferences" section. Shared `executeContactAction` utility used by both discover and collection screens.

**Tech Stack:** Expo Router (NativeTabs + Stack), Zustand + AsyncStorage, react-native-reanimated, existing design-system settings primitives.

**Spec:** `docs/superpowers/specs/2026-03-17-discover-tab-design.md`

---

### Task 1: Add New Types

**Files:**
- Modify: `src/types/index.ts:86-122`

- [ ] **Step 1: Add ContactAction and DiscoverProfile types**

After line 95 (closing brace of `BusinessCard`), before `ShareSession`, insert:

```ts
// ── Discover & Contact ─────────────────────────────────────────
// How others can contact this user — user-configurable
export type ContactActionType = 'email' | 'linkedin' | 'wechat' | 'url';

export interface ContactAction {
  type: ContactActionType;
  label: string;
  value: string;
}

// A saved contact in the user's card holder
export interface SavedContact {
  id: string;
  profile: LinkedInProfile;
  contactAction?: ContactAction;
  savedAt: string; // ISO 8601 — survives AsyncStorage JSON serialization
}

// Lightweight discovery profile — flat struct, no fieldStyles overhead
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

- [ ] **Step 2: Add contactAction to BusinessCard**

In the `BusinessCard` interface (line 87-95), add before the closing brace:

```ts
  contactAction?: ContactAction;
```

- [ ] **Step 3: Update RootStackParamList**

Replace the `share` route (line 120) with:

```ts
  discover: undefined;
  collection: undefined;
```

- [ ] **Step 4: Update L3 header**

Update the `[OUTPUT]` line to include the new types:

```ts
 * [OUTPUT]: LinkedInProfile, CardTemplate, CardBackground, FieldStyle, CardVersion, CardTag,
 *           CardTagState, BusinessCard, ContactActionType, ContactAction, SavedContact,
 *           DiscoverProfile, ShareSession, WalletPassData, RootStackParamList, ThemeMode, Theme
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Users/henry/PARA/01-Projects/Vibe/linkcard && npx tsc --noEmit 2>&1 | head -20`

Expected: No errors related to new types (existing errors are OK).

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add ContactAction, SavedContact, DiscoverProfile types for discover tab"
```

---

### Task 2: Create Mock Discover Data + Contact Action Utility

**Files:**
- Create: `src/lib/mock-discover.ts`
- Create: `src/lib/contact-actions.ts`

- [ ] **Step 1: Create contact action utility**

Create `src/lib/contact-actions.ts`:

```ts
/**
 * [INPUT]: react-native Linking/Alert/Clipboard
 * [OUTPUT]: executeContactAction — opens contact channel based on action type
 * [POS]: Shared utility — used by discover screen and card holder
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Alert, Clipboard, Linking } from "react-native";
import type { ContactAction } from "@/src/types";

export function executeContactAction(
  action?: ContactAction,
  fallbackUrl?: string
) {
  if (!action) {
    if (fallbackUrl) Linking.openURL(fallbackUrl);
    return;
  }
  switch (action.type) {
    case "email":
      Linking.openURL(`mailto:${action.value}`);
      break;
    case "linkedin":
    case "url":
      Linking.openURL(action.value);
      break;
    case "wechat":
      Alert.alert("WeChat ID", action.value, [
        {
          text: "Copy",
          onPress: () => Clipboard.setString(action.value),
        },
        { text: "OK" },
      ]);
      break;
  }
}
```

- [ ] **Step 2: Create mock profiles (20 entries)**

Create `src/lib/mock-discover.ts`:

```ts
/**
 * [INPUT]: @/src/types DiscoverProfile
 * [OUTPUT]: MOCK_PROFILES, getRandomBatch — mock data pool for discover feed development
 * [POS]: Dev-only data source — will be replaced by API when backend is ready
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { DiscoverProfile } from "@/src/types";

const p = (
  id: string, username: string, name: string,
  headline: string, jobTitle: string, company: string,
  location: string, character: string,
  template: DiscoverProfile["template"],
  accentColor: string,
  background: DiscoverProfile["background"],
  actionType: "email" | "linkedin" | "wechat" | "url",
  actionLabel: string,
  actionValue: string,
): DiscoverProfile => ({
  id,
  profile: {
    url: `https://linkedin.com/in/${username}`,
    username, name, headline, jobTitle, company, location,
    photoUrl: null, character,
    lastSynced: new Date(), checksum: `mock-${id}`,
  },
  template, accentColor, background,
  visibleFields: ["photoUrl", "name", "headline", "company", "location", "character", "qrCode"],
  contactAction: { type: actionType, label: actionLabel, value: actionValue },
  qrCodeData: `https://linkcard.app/c/${username}`,
});

const MOCK_PROFILES: DiscoverProfile[] = [
  p("001", "sarahchen", "Sarah Chen", "VP of Engineering at Stripe", "VP of Engineering", "Stripe", "San Francisco, CA", "Infrastructure Architect", "modern", "#635BFF", "lightGlass", "linkedin", "Connect on LinkedIn", "https://linkedin.com/in/sarahchen"),
  p("002", "marcusj", "Marcus Johnson", "Founder & CEO at NovaTech", "Founder & CEO", "NovaTech", "Austin, TX", "Serial Entrepreneur", "bento", "#F59E0B", "sunsetGlow", "email", "Email Me", "marcus@novatech.io"),
  p("003", "emilywang", "Emily Wang", "Product Designer at Figma", "Product Designer", "Figma", "New York, NY", "Design Systems Evangelist", "minimal", "#A259FF", "freshBlue", "url", "Visit Portfolio", "https://emilywang.design"),
  p("004", "jameskim", "James Kim", "ML Engineer at OpenAI", "ML Engineer", "OpenAI", "San Francisco, CA", "AI Researcher", "modern", "#10B981", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/jameskim"),
  p("005", "priyapatel", "Priya Patel", "Growth Lead at Notion", "Growth Lead", "Notion", "Seattle, WA", "Growth Hacker", "modern", "#0EA5E9", "lightGlass", "email", "Say Hello", "priya@notion.so"),
  p("006", "alexmorales", "Alex Morales", "DevRel at Vercel", "Developer Advocate", "Vercel", "Portland, OR", "Community Builder", "bento", "#EF4444", "paper", "url", "Follow on X", "https://x.com/alexmorales"),
  p("007", "linazhang", "Lina Zhang", "Partner at Sequoia Capital", "Partner", "Sequoia Capital", "Menlo Park, CA", "Deep Tech Investor", "modern", "#6366F1", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/linazhang"),
  p("008", "tomhansen", "Tom Hansen", "CTO at Plaid", "CTO", "Plaid", "San Francisco, CA", "Fintech Pioneer", "minimal", "#14B8A6", "freshBlue", "email", "Email Me", "tom@plaid.com"),
  p("009", "sofiarivera", "Sofia Rivera", "Head of Design at Linear", "Head of Design", "Linear", "Remote", "Craft Obsessed", "modern", "#8B5CF6", "lightGlass", "url", "Visit Website", "https://sofiarivera.design"),
  p("010", "davidnguyen", "David Nguyen", "iOS Engineer at Apple", "iOS Engineer", "Apple", "Cupertino, CA", "Platform Native Purist", "modern", "#000000", "paper", "wechat", "Add WeChat", "david_ng_ios"),
  p("011", "rachelgreen", "Rachel Green", "Head of Product at Shopify", "Head of Product", "Shopify", "Toronto, Canada", "Commerce Visionary", "bento", "#96BF48", "lightGlass", "linkedin", "Connect", "https://linkedin.com/in/rachelgreen"),
  p("012", "omarhassan", "Omar Hassan", "Principal Engineer at Databricks", "Principal Engineer", "Databricks", "San Francisco, CA", "Data Lake Whisperer", "modern", "#FF3621", "midnightInk", "email", "Email", "omar@databricks.com"),
  p("013", "miayamamoto", "Mia Yamamoto", "Staff Designer at Airbnb", "Staff Designer", "Airbnb", "Los Angeles, CA", "Experience Crafter", "minimal", "#FF385C", "sunsetGlow", "url", "Portfolio", "https://miayamamoto.com"),
  p("014", "bencooper", "Ben Cooper", "Founding Engineer at Resend", "Founding Engineer", "Resend", "San Francisco, CA", "DX Maximalist", "modern", "#000000", "lightGlass", "email", "Email Me", "ben@resend.com"),
  p("015", "natalieross", "Natalie Ross", "VP Marketing at Anthropic", "VP Marketing", "Anthropic", "San Francisco, CA", "AI Safety Advocate", "modern", "#D97706", "paper", "linkedin", "Connect", "https://linkedin.com/in/natalieross"),
  p("016", "kevinlee", "Kevin Lee", "Staff Engineer at Netflix", "Staff Engineer", "Netflix", "Los Gatos, CA", "Streaming Architect", "modern", "#E50914", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/kevinlee"),
  p("017", "anagarcia", "Ana Garcia", "CPO at Canva", "CPO", "Canva", "Sydney, Australia", "Visual Storyteller", "bento", "#00C4CC", "freshBlue", "email", "Email Me", "ana@canva.com"),
  p("018", "ryanpatel", "Ryan Patel", "Founding Partner at a16z", "Founding Partner", "a16z", "San Francisco, CA", "Builder Backer", "modern", "#FF6600", "paper", "url", "Website", "https://ryanpatel.vc"),
  p("019", "juliawu", "Julia Wu", "Design Director at Spotify", "Design Director", "Spotify", "Stockholm, Sweden", "Sound & Color", "minimal", "#1DB954", "lightGlass", "linkedin", "Connect", "https://linkedin.com/in/juliawu"),
  p("020", "danielkim", "Daniel Kim", "Co-founder at Replit", "Co-founder", "Replit", "San Francisco, CA", "Code Democratizer", "modern", "#F26207", "sunsetGlow", "url", "Replit Profile", "https://replit.com/@danielkim"),
];

/**
 * Pick `count` random profiles from the pool, excluding `excludeIds`.
 * When the pool is exhausted, clears exclusion and re-samples.
 */
export function getRandomBatch(
  count: number,
  excludeIds: string[]
): DiscoverProfile[] {
  let available = MOCK_PROFILES.filter((p) => !excludeIds.includes(p.id));
  if (available.length < count) available = MOCK_PROFILES;
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/contact-actions.ts src/lib/mock-discover.ts
git commit -m "feat: add contact action utility and mock discover profiles"
```

---

### Task 3: Create Contacts Store

**Files:**
- Create: `src/stores/contactsStore.ts`

- [ ] **Step 1: Create the store**

```ts
/**
 * [INPUT]: zustand, zustand/middleware (persist), AsyncStorage, @/src/types,
 *          @/src/lib/mock-discover getRandomBatch
 * [OUTPUT]: useContactsStore — saved contacts, discover feed state, daily refresh logic
 * [POS]: Contacts state — discover browsing + card holder, separate from cardStore
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DiscoverProfile, SavedContact } from "@/src/types";
import { getRandomBatch } from "@/src/lib/mock-discover";

const BATCH_SIZE = 5;
const MAX_DAILY_REFRESHES = 5;

export type DiscoverStatus =
  | "loading"
  | "browsing"
  | "batch_exhausted"
  | "daily_limit_reached";

interface ContactsState {
  // Card holder
  savedContacts: SavedContact[];

  // Discover
  discoverBatch: DiscoverProfile[];
  discoverIndex: number;
  discoverStatus: DiscoverStatus;
  refreshesUsed: number;
  lastRefreshDate: string;
  seenIds: string[];

  // Actions
  saveContact: (profile: DiscoverProfile) => void;
  removeContact: (id: string) => void;
  nextCard: () => void;
  refreshBatch: () => void;
  resetDailyIfNeeded: () => void;
}

const todayUTC = () => new Date().toISOString().slice(0, 10);

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      savedContacts: [],
      discoverBatch: [],
      discoverIndex: 0,
      discoverStatus: "batch_exhausted" as DiscoverStatus,
      refreshesUsed: 0,
      lastRefreshDate: "",
      seenIds: [],

      saveContact: (dp) => {
        const { savedContacts } = get();
        if (savedContacts.some((c) => c.id === dp.id)) return;
        set({
          savedContacts: [
            {
              id: dp.id,
              profile: dp.profile,
              contactAction: dp.contactAction,
              savedAt: new Date().toISOString(),
            },
            ...savedContacts,
          ],
        });
      },

      removeContact: (id) =>
        set((s) => ({
          savedContacts: s.savedContacts.filter((c) => c.id !== id),
        })),

      nextCard: () => {
        const { discoverIndex, discoverBatch, refreshesUsed } = get();
        const nextIndex = discoverIndex + 1;
        if (nextIndex >= discoverBatch.length) {
          set({
            discoverIndex: nextIndex,
            discoverStatus:
              refreshesUsed >= MAX_DAILY_REFRESHES
                ? "daily_limit_reached"
                : "batch_exhausted",
          });
        } else {
          set({ discoverIndex: nextIndex });
        }
      },

      refreshBatch: () => {
        const { refreshesUsed, seenIds } = get();
        if (refreshesUsed >= MAX_DAILY_REFRESHES) {
          set({ discoverStatus: "daily_limit_reached" });
          return;
        }
        const batch = getRandomBatch(BATCH_SIZE, seenIds);
        const newSeenIds = [...seenIds, ...batch.map((p) => p.id)];
        set({
          discoverBatch: batch,
          discoverIndex: 0,
          discoverStatus: "browsing",
          refreshesUsed: refreshesUsed + 1,
          seenIds: newSeenIds,
          lastRefreshDate: todayUTC(),
        });
      },

      resetDailyIfNeeded: () => {
        const { lastRefreshDate } = get();
        const today = todayUTC();
        if (lastRefreshDate !== today) {
          set({
            refreshesUsed: 0,
            seenIds: [],
            lastRefreshDate: today,
            discoverBatch: [],
            discoverIndex: 0,
            discoverStatus: "batch_exhausted",
          });
        }
      },
    }),
    {
      name: "linkcard-contacts",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedContacts: state.savedContacts,
        refreshesUsed: state.refreshesUsed,
        lastRefreshDate: state.lastRefreshDate,
        seenIds: state.seenIds,
      }),
    }
  )
);
```

- [ ] **Step 2: Update stores CLAUDE.md**

Add `contactsStore.ts` to `src/stores/CLAUDE.md` member list:

```
contactsStore.ts: Discover feed + card holder — saved contacts, daily refresh counter, browse state.
                  Separate persistence key 'linkcard-contacts'. Not synced to Supabase.
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/contactsStore.ts src/stores/CLAUDE.md
git commit -m "feat: add contactsStore for discover feed and card holder"
```

---

### Task 4: Scaffold Discover Tab + Swap Tab Layout

**Files:**
- Create: `app/(tabs)/(discover)/_layout.tsx`
- Create: `app/(tabs)/(discover)/index.tsx` (placeholder)
- Create: `app/(tabs)/(discover)/collection.tsx` (placeholder)
- Create: `app/(tabs)/(discover)/CLAUDE.md`
- Modify: `app/(tabs)/_layout.tsx:19-26`
- Modify: `app/(tabs)/_layout.web.tsx:23-31`
- Modify: `app/(tabs)/CLAUDE.md`
- Modify: `app/CLAUDE.md`

- [ ] **Step 1: Create discover stack layout**

Create `app/(tabs)/(discover)/_layout.tsx`:

```tsx
/**
 * [INPUT]: expo-router Stack, react-native PlatformColor
 * [OUTPUT]: Discover tab stack with native large title
 * [POS]: Discover Stack — native iOS large title with collapse behavior
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: {
          color: PlatformColor("label") as unknown as string,
        },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Discover" }} />
      <Stack.Screen
        name="collection"
        options={{
          title: "Card Holder",
          headerLargeTitle: false,
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack>
  );
}
```

- [ ] **Step 2: Create placeholder discover index**

Create `app/(tabs)/(discover)/index.tsx`:

```tsx
/**
 * [INPUT]: react-native View/Text/PlatformColor/StyleSheet
 * [OUTPUT]: DiscoverScreen — discover feed with card browsing and actions
 * [POS]: Discover tab main screen — one card at a time with Next/Say Hi buttons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";

export default function DiscoverScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Discover — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: {
    fontSize: 17,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
```

- [ ] **Step 3: Create placeholder collection**

Create `app/(tabs)/(discover)/collection.tsx`:

```tsx
/**
 * [INPUT]: react-native View/Text/PlatformColor/StyleSheet
 * [OUTPUT]: CollectionScreen — saved contacts card holder list
 * [POS]: Card holder — push from discover header, list of saved contacts
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";

export default function CollectionScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Card Holder — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: {
    fontSize: 17,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
});
```

- [ ] **Step 4: Swap native tab layout**

In `app/(tabs)/_layout.tsx`, replace the `(share)` NativeTabs.Trigger block (lines 20-26) with:

```tsx
      <NativeTabs.Trigger name="(discover)">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tab-creditcard.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Label hidden>Discover</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
```

Note: Temporarily reusing `tab-creditcard.png` icon. Task 8 will add proper icon alias.

Update L3 header `[OUTPUT]` to say "Card, Discover, Settings" instead of "Card, Share, Settings".

- [ ] **Step 5: Swap web tab layout**

In `app/(tabs)/_layout.web.tsx`, replace the `(share)` Tabs.Screen block (lines 23-31) with:

```tsx
      <Tabs.Screen
        name="(discover)"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
```

Update L3 header `[OUTPUT]` to say "Card, Discover, Settings" instead of "Card, Share, Settings".

- [ ] **Step 6: Create discover CLAUDE.md**

Create `app/(tabs)/(discover)/CLAUDE.md`:

```md
# (discover)/
> L2 | Parent: app/(tabs)/CLAUDE.md

Discover tab — browse random profiles and manage saved contacts.

## Members

```
_layout.tsx:      Stack navigator — native large title with collapse behavior
index.tsx:        Discover feed — one card at a time, Next/Say Hi buttons, daily refresh
collection.tsx:   Card holder — saved contacts list, push from header button
```

[PROTOCOL]: Update this on any file add/remove/rename, then check app/(tabs)/CLAUDE.md
```

- [ ] **Step 7: Update parent CLAUDE.md files**

Update `app/(tabs)/CLAUDE.md`: replace `(share)/` entry with:
```
(discover)/           Discover tab — random profile feed, card holder collection
```

Update `app/CLAUDE.md`: replace `(share)/` entry with:
```
  (discover)/    — Discover tab: random profile feed, card holder collection
```

- [ ] **Step 8: Verify app compiles**

Run: `cd /Users/henry/PARA/01-Projects/Vibe/linkcard && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 9: Commit**

```bash
git add app/(tabs)/(discover)/ app/(tabs)/_layout.tsx app/(tabs)/_layout.web.tsx app/(tabs)/CLAUDE.md app/CLAUDE.md
git commit -m "feat: scaffold discover tab, replace share tab in navigation"
```

---

### Task 5: Build Discover Screen

**Files:**
- Modify: `app/(tabs)/(discover)/index.tsx` (full rewrite)

- [ ] **Step 1: Implement discover screen**

Full rewrite of `app/(tabs)/(discover)/index.tsx`:

```tsx
/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView,
 *          expo-router Stack/useRouter, react-native-reanimated Animated/FadeInRight/FadeOutLeft,
 *          @/src/stores/contactsStore, @/src/components/card/card-display CardDisplay,
 *          @/src/lib/haptics, @/src/lib/springs, @/src/lib/icons Icon,
 *          @/src/lib/contact-actions, @/src/types CardVersion
 * [OUTPUT]: DiscoverScreen — discover feed with card browsing and actions
 * [POS]: Discover tab main screen — one card at a time with Next/Say Hi buttons
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useEffect } from "react";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router/stack";
import { useRouter } from "expo-router";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { useContactsStore } from "@/src/stores/contactsStore";
import { CardDisplay } from "@/src/components/card/card-display";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import { Icon } from "@/src/lib/icons";
import type { CardVersion, DiscoverProfile } from "@/src/types";

// ── Synthesize CardVersion from DiscoverProfile fields ───────────
function toCardVersion(p: DiscoverProfile): CardVersion {
  return {
    id: "discover-preview",
    name: "Discover",
    visibleFields: p.visibleFields,
    template: p.template,
    accentColor: p.accentColor,
    background: p.background,
    isDefault: false,
  };
}

export default function DiscoverScreen() {
  const router = useRouter();
  const batch = useContactsStore((s) => s.discoverBatch);
  const index = useContactsStore((s) => s.discoverIndex);
  const status = useContactsStore((s) => s.discoverStatus);
  const refreshesUsed = useContactsStore((s) => s.refreshesUsed);
  const nextCard = useContactsStore((s) => s.nextCard);
  const refreshBatch = useContactsStore((s) => s.refreshBatch);
  const saveContact = useContactsStore((s) => s.saveContact);
  const resetDaily = useContactsStore((s) => s.resetDailyIfNeeded);

  const current = index < batch.length ? batch[index] : null;

  // Reactive bookmark check — re-renders when savedContacts changes
  const saved = useContactsStore((s) =>
    current ? s.savedContacts.some((c) => c.id === current.id) : false
  );

  useEffect(() => {
    resetDaily();
  }, [resetDaily]);

  // Auto-load first batch if empty
  useEffect(() => {
    if (
      batch.length === 0 &&
      status === "batch_exhausted" &&
      refreshesUsed < 5
    ) {
      refreshBatch();
    }
  }, [batch.length, status, refreshesUsed, refreshBatch]);

  const handleNext = useCallback(() => {
    haptic.selection();
    nextCard();
  }, [nextCard]);

  const handleSayHi = useCallback(() => {
    if (!current) return;
    haptic.medium();
    executeContactAction(current.contactAction, current.profile.url);
  }, [current]);

  const handleSave = useCallback(() => {
    if (!current || saved) return;
    haptic.success();
    saveContact(current);
  }, [current, saved, saveContact]);

  const handleRefresh = useCallback(() => {
    haptic.medium();
    refreshBatch();
  }, [refreshBatch]);

  const remainingRefreshes = 5 - refreshesUsed;

  return (
    <>
      {/* ── Header toolbar ──────────────────────────────────── */}
      <Stack.Screen options={{ title: "Discover", headerLargeTitle: true }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View>
          <Pressable
            onPress={() => {
              haptic.light();
              router.push("/(discover)/collection" as any);
            }}
            style={styles.toolbarBtn}
          >
            <Icon web="bookmark" size={20} color={PlatformColor("label") as unknown as string} />
          </Pressable>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.View>
          <Text style={styles.refreshBadge}>{remainingRefreshes} left</Text>
        </Stack.Toolbar.View>
      </Stack.Toolbar>

      {/* ── Body ────────────────────────────────────────────── */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {status === "browsing" && current ? (
          <>
            {/* Progress */}
            <Text style={styles.progress}>
              {index + 1} / {batch.length}
            </Text>

            {/* Card */}
            <Animated.View
              key={current.id}
              entering={FadeInRight.springify()
                .stiffness(springs.gentle.stiffness)
                .damping(springs.gentle.damping)}
              exiting={FadeOutLeft.duration(200)}
            >
              <CardDisplay
                profile={current.profile}
                version={toCardVersion(current)}
                qrCodeData={current.qrCodeData}
                compact
              />
            </Animated.View>

            {/* Bookmark */}
            <Pressable style={styles.bookmarkBtn} onPress={handleSave}>
              <Icon
                web={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={saved ? "#FF9500" : (PlatformColor("secondaryLabel") as unknown as string)}
              />
            </Pressable>

            {/* Action buttons */}
            <View style={styles.actions}>
              <Pressable style={styles.btnSecondary} onPress={handleNext}>
                <Text style={styles.btnSecondaryLabel}>Next</Text>
              </Pressable>
              <View style={styles.btnSpacer} />
              <Pressable style={styles.btnPrimary} onPress={handleSayHi}>
                <Text style={styles.btnPrimaryLabel}>
                  {current.contactAction?.label ?? "Say Hi"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : status === "batch_exhausted" ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {remainingRefreshes > 0
                ? "Batch complete!"
                : "All done for today"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {remainingRefreshes > 0
                ? `${remainingRefreshes} refresh${remainingRefreshes === 1 ? "" : "es"} remaining`
                : "Come back tomorrow for more profiles"}
            </Text>
            {remainingRefreshes > 0 ? (
              <Pressable
                style={[styles.btnPrimary, styles.refreshBtn]}
                onPress={handleRefresh}
              >
                <Text style={styles.btnPrimaryLabel}>Refresh</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Come back tomorrow</Text>
            <Text style={styles.emptySubtitle}>
              You've used all 5 refreshes for today
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  toolbarBtn: {
    minHeight: 32,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBadge: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
  progress: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: PlatformColor("secondaryLabel") as unknown as string,
    marginBottom: 16,
  },
  bookmarkBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: 24,
  },
  btnSpacer: { width: 12 },
  btnSecondary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    borderWidth: 1,
    borderColor: PlatformColor("separator") as unknown as string,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: PlatformColor("label") as unknown as string,
  },
  btnPrimary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 25,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBlue") as unknown as string,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  refreshBtn: {
    marginTop: 24,
    width: 200,
    alignSelf: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: PlatformColor("label") as unknown as string,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("secondaryLabel") as unknown as string,
    textAlign: "center",
  },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/(discover)/index.tsx
git commit -m "feat: implement discover feed screen with card browsing"
```

---

### Task 6: Build Card Holder Screen

**Files:**
- Modify: `app/(tabs)/(discover)/collection.tsx` (full rewrite)

- [ ] **Step 1: Implement collection screen**

Full rewrite of `app/(tabs)/(discover)/collection.tsx`:

```tsx
/**
 * [INPUT]: react-native View/Text/Pressable/PlatformColor/StyleSheet/ScrollView,
 *          @/src/stores/contactsStore, @/src/components/shared/avatar Avatar,
 *          @/src/components/card/card-display CardDisplay,
 *          @/src/design-system/settings primitives,
 *          @/src/lib/haptics, @/src/lib/contact-actions, @/src/types
 * [OUTPUT]: CollectionScreen — saved contacts card holder list with expandable detail
 * [POS]: Card holder — push from discover header, list of saved contacts with actions
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { useCallback, useState } from "react";
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

import { useContactsStore } from "@/src/stores/contactsStore";
import { Avatar } from "@/src/components/shared/avatar";
import { CardDisplay } from "@/src/components/card/card-display";
import { executeContactAction } from "@/src/lib/contact-actions";
import { haptic } from "@/src/lib/haptics";
import { springs } from "@/src/lib/springs";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionHeader,
  SettingsSeparator,
  SettingsChevron,
} from "@/src/design-system/settings";
import type { CardVersion, SavedContact } from "@/src/types";

function ContactRow({
  contact,
  isLast,
  expanded,
  onPress,
  onSayHi,
  onDelete,
}: {
  contact: SavedContact;
  isLast: boolean;
  expanded: boolean;
  onPress: () => void;
  onSayHi: () => void;
  onDelete: () => void;
}) {
  // Build a CardVersion for display
  const version: CardVersion = {
    id: "collection-preview",
    name: contact.profile.name,
    visibleFields: ["photoUrl", "name", "headline", "company", "location", "character", "qrCode"],
    template: "modern",
    accentColor: "#007AFF",
    background: "lightGlass",
    isDefault: false,
  };

  return (
    <>
      <SettingsRow
        title={contact.profile.name}
        subtitle={contact.profile.headline}
        leading={
          <Avatar
            source={contact.profile.photoUrl}
            name={contact.profile.name}
            size={36}
          />
        }
        trailing={<SettingsChevron />}
        onPress={onPress}
      />
      {expanded ? (
        <Animated.View
          entering={FadeInDown.springify()
            .stiffness(springs.gentle.stiffness)
            .damping(springs.gentle.damping)}
          exiting={FadeOutUp.duration(150)}
          style={styles.detail}
        >
          <CardDisplay
            profile={contact.profile}
            version={version}
            qrCodeData={contact.profile.url}
            compact
          />
          <View style={styles.detailActions}>
            <Pressable style={styles.detailBtnPrimary} onPress={onSayHi}>
              <Text style={styles.detailBtnPrimaryLabel}>
                {contact.contactAction?.label ?? "Say Hi"}
              </Text>
            </Pressable>
            <Pressable style={styles.detailBtnDestructive} onPress={onDelete}>
              <Text style={styles.detailBtnDestructiveLabel}>Remove</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
      {!isLast ? <SettingsSeparator inset={68} /> : null}
    </>
  );
}

export default function CollectionScreen() {
  const savedContacts = useContactsStore((s) => s.savedContacts);
  const removeContact = useContactsStore((s) => s.removeContact);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      haptic.light();
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleSayHi = useCallback((contact: SavedContact) => {
    haptic.medium();
    executeContactAction(contact.contactAction, contact.profile.url);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      haptic.warning();
      removeContact(id);
      if (expandedId === id) setExpandedId(null);
    },
    [removeContact, expandedId]
  );

  if (savedContacts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No saved cards yet</Text>
        <Text style={styles.emptySubtitle}>
          Browse Discover to find and save interesting people
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <SettingsSectionHeader title={`${savedContacts.length} SAVED`} />
      <SettingsGroup>
        {savedContacts.map((contact, i) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isLast={i === savedContacts.length - 1}
            expanded={expandedId === contact.id}
            onPress={() => handleToggle(contact.id)}
            onSayHi={() => handleSayHi(contact)}
            onDelete={() => handleDelete(contact.id)}
          />
        ))}
      </SettingsGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: PlatformColor("label") as unknown as string,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("secondaryLabel") as unknown as string,
    textAlign: "center",
  },
  detail: {
    padding: 16,
  },
  detailActions: {
    marginTop: 16,
    gap: 8,
  },
  detailBtnPrimary: {
    minHeight: 44,
    borderRadius: 22,
    borderCurve: "continuous" as any,
    backgroundColor: PlatformColor("systemBlue") as unknown as string,
    alignItems: "center",
    justifyContent: "center",
  },
  detailBtnPrimaryLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailBtnDestructive: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  detailBtnDestructiveLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: PlatformColor("systemRed") as unknown as string,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/(discover)/collection.tsx
git commit -m "feat: implement card holder collection screen with expandable detail"
```

---

### Task 7: Add Contact Preferences in Settings

**Files:**
- Modify: `src/stores/cardStore.ts` (add updateContactAction action)
- Modify: `app/(tabs)/(settings)/index.tsx` (add CONTACT PREFERENCES section)

- [ ] **Step 1: Add updateContactAction to cardStore**

In `src/stores/cardStore.ts`:

1. Add `ContactAction` to the import from `@/src/types` (line 11).

2. Add to the `CardState` interface (after `setError` at line 84):

```ts
    updateContactAction: (action: ContactAction | undefined) => void;
```

3. Add the implementation inside the `create` call (after `setError` implementation at line 328):

```ts
            updateContactAction: (action) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const updatedCard = {
                    ...currentCard,
                    contactAction: action,
                    updatedAt: new Date(),
                };
                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },
```

- [ ] **Step 2: Add contact preferences section to Settings**

In `app/(tabs)/(settings)/index.tsx`:

1. Add imports:

```ts
import { Platform } from "react-native";
import type { ContactAction, ContactActionType } from "@/src/types";
```

2. Add store selectors (after existing selectors around line 28-31):

```ts
  const updateContactAction = useCardStore((s) => s.updateContactAction);
  const contactAction = card?.contactAction;
```

3. Add constants and handlers (after `handleResetCard` around line 58):

```ts
  const CONTACT_METHODS: { type: ContactActionType; label: string; placeholder: string }[] = [
    { type: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    { type: "email", label: "Email", placeholder: "you@example.com" },
    { type: "wechat", label: "WeChat", placeholder: "WeChat ID" },
    { type: "url", label: "Custom URL", placeholder: "https://..." },
  ];

  const handleContactMethodPick = () => {
    const options = [...CONTACT_METHODS.map((m) => m.label), "Cancel"];
    if (Platform.OS === "ios") {
      const ActionSheetIOS = require("react-native").ActionSheetIOS;
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: CONTACT_METHODS.length },
        (index: number) => {
          if (index >= CONTACT_METHODS.length) return;
          const method = CONTACT_METHODS[index];
          updateContactAction({
            type: method.type,
            label: method.label,
            value: contactAction?.value ?? "",
          });
        }
      );
    } else {
      Alert.alert("Contact Method", "Choose how others can reach you",
        CONTACT_METHODS.map((method) => ({
          text: method.label,
          onPress: () =>
            updateContactAction({
              type: method.type,
              label: method.label,
              value: contactAction?.value ?? "",
            }),
        })).concat({ text: "Cancel", onPress: () => {} })
      );
    }
  };

  const handleContactValueEdit = () => {
    const method = CONTACT_METHODS.find((m) => m.type === contactAction?.type);
    Alert.prompt(
      "Contact Value",
      `Enter your ${contactAction?.label ?? "contact"} info`,
      (text) => {
        if (!text?.trim()) return;
        updateContactAction({
          type: contactAction?.type ?? "linkedin",
          label: contactAction?.label ?? "LinkedIn",
          value: text.trim(),
        });
      },
      "plain-text",
      contactAction?.value ?? "",
      method?.placeholder
    );
  };
```

4. Insert this JSX between the SYNC group and DATA group (after line 110, before line 112):

```tsx
      <SettingsSectionHeader title="CONTACT PREFERENCES" />
      <SettingsGroup>
        <SettingsRow
          title="Contact Method"
          leading={<SettingsIconTile web="person" color="#5856D6" />}
          trailing={
            <Text style={styles.trailingValue}>
              {contactAction?.label ?? "Not set"}
            </Text>
          }
          onPress={handleContactMethodPick}
        />
        <SettingsSeparator />
        <SettingsRow
          title="Contact Value"
          subtitle={contactAction?.value || "Tap to set"}
          leading={<SettingsIconTile web="link" color="#32ADE6" />}
          trailing={<SettingsChevron />}
          onPress={handleContactValueEdit}
        />
      </SettingsGroup>
```

5. Add to StyleSheet:

```ts
  trailingValue: {
    fontSize: 17,
    lineHeight: 22,
    color: PlatformColor("secondaryLabel") as unknown as string,
  },
```

Also add `SettingsIconTile` and `SettingsSeparator` to the imports from `@/src/design-system/settings` if not already present.

- [ ] **Step 3: Commit**

```bash
git add src/stores/cardStore.ts app/(tabs)/(settings)/index.tsx
git commit -m "feat: add contact preferences section in settings"
```

---

### Task 8: Icon Alias + Cleanup + Delete Old Share Tab

**Files:**
- Modify: `src/lib/icons.tsx` (add people alias)
- Delete: `app/(tabs)/(share)/` (entire directory)
- Modify: `src/types/CLAUDE.md`
- Modify: `src/lib/CLAUDE.md`
- Modify: `CLAUDE.md` (root)

- [ ] **Step 1: Add "people" icon alias**

In `src/lib/icons.tsx`, add to `SF_ALIASES` (after the `person` entries around line 59):

```ts
  people: "person.2",
  "people-outline": "person.2",
```

- [ ] **Step 2: Delete old share tab files**

```bash
rm -rf app/(tabs)/(share)/
```

- [ ] **Step 3: Update root CLAUDE.md**

In the root `CLAUDE.md`, update the `(share)/` line in the directory structure to:

```
    (discover)/    — Discover tab: random profile feed, card holder collection
```

- [ ] **Step 4: Update types CLAUDE.md**

In `src/types/CLAUDE.md`, update `index.ts` entry to include new types:

```
index.ts:            Core domain types — LinkedInProfile, CardVersion, CardBackground, BusinessCard,
                     ContactAction, ContactActionType, SavedContact, DiscoverProfile,
                     ShareSession, WalletPassData, FieldStyle, CardTemplate, Theme, RootStackParamList
```

- [ ] **Step 5: Update lib CLAUDE.md**

In `src/lib/CLAUDE.md`, add entries:

```
- `mock-discover.ts`: Mock profile pool for discover feed development (20 profiles, getRandomBatch)
- `contact-actions.ts`: Contact action executor — opens email/linkedin/wechat/url based on action type
```

- [ ] **Step 6: Final TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -30`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: complete discover tab — icon alias, docs, remove old share tab"
```
