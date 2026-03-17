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
  prevCard: () => void;
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

      prevCard: () => {
        const { discoverIndex } = get();
        if (discoverIndex > 0) {
          set({ discoverIndex: discoverIndex - 1 });
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
