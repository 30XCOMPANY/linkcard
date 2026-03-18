/**
 * [INPUT]: zustand, zustand/middleware (persist), AsyncStorage, @/src/types, @/src/lib/card-presets, @/src/services/supabase
 * [OUTPUT]: useCardStore — card CRUD, theme, preferences, debounced Supabase sync
 * [POS]: Main app state — single Zustand store with AsyncStorage persistence
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BusinessCard, CardTag, CardVersion, ContactAction, LinkedInProfile, ThemeMode } from '@/src/types';
import { normalizeCardVersion } from '@/src/lib/card-presets';
import type { NameFontKey } from '@/src/lib/name-fonts';
import { cardService } from '@/src/services/supabase';

// ── Internals ───────────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSync = (card: BusinessCard) => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        cardService.upsertCard(card).catch(console.error);
    }, 500);
};

const normalizeCard = (card: BusinessCard): BusinessCard => ({
    ...card,
    tagState: card.tagState ?? { custom: [], hidden: [], renamed: {} },
    versions: card.versions.map(normalizeCardVersion),
});

/**
 * Guarded card mutation — eliminates the repeated get/null-check/normalize/set/sync pattern.
 * Every store action that modifies card state calls this instead of duplicating the 5-line dance.
 */
const withCard = (
    get: () => CardState,
    set: (partial: Partial<CardState>) => void,
    mutate: (card: BusinessCard) => BusinessCard,
) => {
    const raw = get().card;
    if (!raw) return;
    const card = normalizeCard(raw);
    const updated = { ...mutate(card), updatedAt: new Date() };
    set({ card: updated });
    debouncedSync(updated);
};

const moveItems = <T,>(items: T[], sourceIndices: number[], destination: number): T[] => {
    if (sourceIndices.length === 0) return items;
    const sorted = [...sourceIndices].sort((a, b) => a - b);
    const moving = sorted.map((i) => items[i]).filter((item): item is T => item !== undefined);
    if (moving.length === 0) return items;
    const sourceSet = new Set(sorted);
    const remaining = items.filter((_, i) => !sourceSet.has(i));
    const offset = sorted.filter((i) => i < destination).length;
    const target = Math.max(0, Math.min(remaining.length, destination - offset));
    remaining.splice(target, 0, ...moving);
    return remaining;
};

// ── Interface ───────────────────────────────────────────────────

interface CardState {
    card: BusinessCard | null;
    isLoading: boolean;
    error: string | null;

    themeMode: ThemeMode;
    nameFont: NameFontKey;

    autoSync: boolean;
    includeQRCode: boolean;
    notifProfileUpdates: boolean;
    notifShareActivity: boolean;
    notifSyncReminders: boolean;

    // Card mutations
    setCard: (card: BusinessCard) => void;
    updateProfile: (profile: Partial<LinkedInProfile>) => void;
    addVersion: (version: CardVersion) => void;
    updateVersion: (versionId: string, updates: Partial<CardVersion>) => void;
    deleteVersion: (versionId: string) => void;
    moveVersions: (sourceIndices: number[], destination: number) => void;
    setDefaultVersion: (versionId: string) => void;
    addCustomTag: (tag: Pick<CardTag, 'emoji' | 'label'>) => void;
    removeTag: (tagId: string) => void;
    renameTag: (tagId: string, label: string) => void;
    updateContactAction: (action: ContactAction | undefined) => void;

    // UI state
    setThemeMode: (mode: ThemeMode) => void;
    setNameFont: (font: NameFontKey) => void;
    setAutoSync: (val: boolean) => void;
    setIncludeQRCode: (val: boolean) => void;
    setNotifProfileUpdates: (val: boolean) => void;
    setNotifShareActivity: (val: boolean) => void;
    setNotifSyncReminders: (val: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearCard: () => void;
    resetAllData: () => void;
}

// ── Store ───────────────────────────────────────────────────────

export const useCardStore = create<CardState>()(
    persist(
        (set, get) => ({
            card: null,
            isLoading: false,
            error: null,
            themeMode: 'system',
            nameFont: 'classic' as NameFontKey,
            autoSync: true,
            includeQRCode: true,
            notifProfileUpdates: true,
            notifShareActivity: true,
            notifSyncReminders: false,

            setCard: (card) => {
                const normalized = normalizeCard(card);
                set({ card: normalized, error: null });
                debouncedSync(normalized);
            },

            updateProfile: (profile) =>
                withCard(get, set, (card) => ({
                    ...card,
                    profile: { ...card.profile, ...profile },
                })),

            addVersion: (version) =>
                withCard(get, set, (card) => ({
                    ...card,
                    versions: [...card.versions, normalizeCardVersion(version)],
                })),

            updateVersion: (versionId, updates) =>
                withCard(get, set, (card) => ({
                    ...card,
                    versions: card.versions.map((v) =>
                        v.id === versionId ? normalizeCardVersion({ ...v, ...updates }) : v
                    ),
                })),

            deleteVersion: (versionId) =>
                withCard(get, set, (card) => {
                    if (card.versions.length <= 1) return card;
                    const filtered = card.versions.filter((v) => v.id !== versionId);
                    if (card.versions.find((v) => v.id === versionId)?.isDefault) {
                        filtered[0].isDefault = true;
                    }
                    return { ...card, versions: filtered };
                }),

            moveVersions: (sourceIndices, destination) =>
                withCard(get, set, (card) => ({
                    ...card,
                    versions: moveItems(card.versions, sourceIndices, destination),
                })),

            setDefaultVersion: (versionId) =>
                withCard(get, set, (card) => ({
                    ...card,
                    versions: card.versions.map((v) => ({
                        ...v,
                        isDefault: v.id === versionId,
                    })),
                })),

            addCustomTag: (tag) =>
                withCard(get, set, (card) => ({
                    ...card,
                    tagState: {
                        ...card.tagState,
                        custom: [
                            ...card.tagState.custom,
                            {
                                id: `custom:${Date.now()}`,
                                emoji: tag.emoji,
                                label: tag.label,
                                source: 'custom' as const,
                            },
                        ],
                    },
                })),

            removeTag: (tagId) =>
                withCard(get, set, (card) => {
                    const isCustom = tagId.startsWith('custom:');
                    return {
                        ...card,
                        tagState: {
                            ...card.tagState,
                            custom: isCustom
                                ? card.tagState.custom.filter((t) => t.id !== tagId)
                                : card.tagState.custom,
                            hidden: isCustom
                                ? card.tagState.hidden
                                : Array.from(new Set([...card.tagState.hidden, tagId])),
                        },
                    };
                }),

            renameTag: (tagId, label) => {
                const trimmed = label.trim();
                if (!trimmed) return;
                const isCustom = tagId.startsWith('custom:');
                withCard(get, set, (card) => ({
                    ...card,
                    tagState: {
                        ...card.tagState,
                        custom: isCustom
                            ? card.tagState.custom.map((t) =>
                                t.id === tagId ? { ...t, label: trimmed } : t
                            )
                            : card.tagState.custom,
                        renamed: isCustom
                            ? card.tagState.renamed
                            : { ...card.tagState.renamed, [tagId]: trimmed },
                    },
                }));
            },

            updateContactAction: (action) =>
                withCard(get, set, (card) => ({ ...card, contactAction: action })),

            setThemeMode: (mode) => set({ themeMode: mode }),
            setNameFont: (font) => set({ nameFont: font }),
            setAutoSync: (val) => set({ autoSync: val }),
            setIncludeQRCode: (val) => set({ includeQRCode: val }),
            setNotifProfileUpdates: (val) => set({ notifProfileUpdates: val }),
            setNotifShareActivity: (val) => set({ notifShareActivity: val }),
            setNotifSyncReminders: (val) => set({ notifSyncReminders: val }),

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            clearCard: () => set({ card: null, error: null }),
            resetAllData: () =>
                set({
                    card: null,
                    isLoading: false,
                    error: null,
                    themeMode: 'system',
                    nameFont: 'classic' as NameFontKey,
                    autoSync: true,
                    includeQRCode: true,
                    notifProfileUpdates: true,
                    notifShareActivity: true,
                    notifSyncReminders: false,
                }),
        }),
        {
            name: 'linkcard-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                card: state.card,
                themeMode: state.themeMode,
                nameFont: state.nameFont,
                autoSync: state.autoSync,
                includeQRCode: state.includeQRCode,
                notifProfileUpdates: state.notifProfileUpdates,
                notifShareActivity: state.notifShareActivity,
                notifSyncReminders: state.notifSyncReminders,
            }),
        }
    )
);
