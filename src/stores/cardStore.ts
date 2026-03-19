/**
 * [INPUT]: zustand, zustand/middleware (persist), AsyncStorage, react-native Appearance, @/src/types, @/src/lib/card-presets, @/src/services/supabase
 * [OUTPUT]: useCardStore — card CRUD, hydration state, theme/preferences, debounced Supabase sync
 * [POS]: Main app state — single Zustand store with AsyncStorage persistence and cloud preference sync.
 *        onRehydrateStorage calls applyNativeTheme before React re-renders to eliminate theme flash.
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
    BusinessCard,
    CardTag,
    CardVersion,
    ContactAction,
    LinkedInProfile,
    ThemeMode,
    UserPreferences,
} from '@/src/types';
import { normalizeCardVersion } from '@/src/lib/card-presets';
import type { NameFontKey } from '@/src/lib/name-fonts';
import { Appearance, Platform } from 'react-native';
import { cardService, userPreferencesService } from '@/src/services/supabase';

// ── Internals ───────────────────────────────────────────────────

/** Sync native Appearance immediately — no useEffect delay. */
const applyNativeTheme = (mode: ThemeMode) => {
    if (Platform.OS === 'web') return;
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
};

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let preferencesSyncTimer: ReturnType<typeof setTimeout> | null = null;

const normalizeCard = (card: BusinessCard): BusinessCard => ({
    ...card,
    tagState: card.tagState ?? { custom: [], hidden: [], renamed: {} },
    versions: card.versions.map(normalizeCardVersion),
});

const DEFAULT_PREFERENCES: UserPreferences = {
    themeMode: 'system',
    nameFont: 'classic',
    autoSync: true,
    includeQRCode: true,
    notifProfileUpdates: true,
    notifShareActivity: true,
    notifSyncReminders: false,
};

const getPreferenceSnapshot = (state: Pick<
    CardState,
    | 'themeMode'
    | 'nameFont'
    | 'autoSync'
    | 'includeQRCode'
    | 'notifProfileUpdates'
    | 'notifShareActivity'
    | 'notifSyncReminders'
>): UserPreferences => ({
    themeMode: state.themeMode,
    nameFont: state.nameFont,
    autoSync: state.autoSync,
    includeQRCode: state.includeQRCode,
    notifProfileUpdates: state.notifProfileUpdates,
    notifShareActivity: state.notifShareActivity,
    notifSyncReminders: state.notifSyncReminders,
});

const debouncedSyncCard = (get: () => CardState, card: BusinessCard) => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        if (!get().autoSync) return;
        cardService.upsertCard(card).catch(console.error);
    }, 500);
};

const debouncedSyncPreferences = (preferences: UserPreferences) => {
    if (preferencesSyncTimer) clearTimeout(preferencesSyncTimer);
    preferencesSyncTimer = setTimeout(() => {
        userPreferencesService.upsertPreferences(preferences).catch(console.error);
    }, 500);
};

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
    debouncedSyncCard(get, updated);
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
    hasHydrated: boolean;

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
    setHasHydrated: (hydrated: boolean) => void;
    hydrateFromCloud: () => Promise<void>;
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
            hasHydrated: false,
            themeMode: DEFAULT_PREFERENCES.themeMode,
            nameFont: DEFAULT_PREFERENCES.nameFont as NameFontKey,
            autoSync: DEFAULT_PREFERENCES.autoSync,
            includeQRCode: DEFAULT_PREFERENCES.includeQRCode,
            notifProfileUpdates: DEFAULT_PREFERENCES.notifProfileUpdates,
            notifShareActivity: DEFAULT_PREFERENCES.notifShareActivity,
            notifSyncReminders: DEFAULT_PREFERENCES.notifSyncReminders,

            setCard: (card) => {
                const normalized = normalizeCard(card);
                set({ card: normalized, error: null });
                debouncedSyncCard(get, normalized);
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

            setThemeMode: (mode) => {
                applyNativeTheme(mode);
                set((state) => {
                    const next = { ...state, themeMode: mode };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { themeMode: mode };
                });
            },
            setNameFont: (font) =>
                set((state) => {
                    const next = { ...state, nameFont: font };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { nameFont: font };
                }),
            setAutoSync: (val) =>
                set((state) => {
                    const next = { ...state, autoSync: val };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { autoSync: val };
                }),
            setIncludeQRCode: (val) =>
                set((state) => {
                    const next = { ...state, includeQRCode: val };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { includeQRCode: val };
                }),
            setNotifProfileUpdates: (val) =>
                set((state) => {
                    const next = { ...state, notifProfileUpdates: val };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { notifProfileUpdates: val };
                }),
            setNotifShareActivity: (val) =>
                set((state) => {
                    const next = { ...state, notifShareActivity: val };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { notifShareActivity: val };
                }),
            setNotifSyncReminders: (val) =>
                set((state) => {
                    const next = { ...state, notifSyncReminders: val };
                    debouncedSyncPreferences(getPreferenceSnapshot(next));
                    return { notifSyncReminders: val };
                }),

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
            hydrateFromCloud: async () => {
                const [remoteCard, remotePreferences] = await Promise.all([
                    cardService.getCard(),
                    userPreferencesService.getPreferences(),
                ]);

                const patch: Partial<CardState> = {};
                const shouldSeedPreferences = !remotePreferences;
                if (remoteCard) patch.card = normalizeCard(remoteCard);
                if (remotePreferences) {
                    patch.themeMode = remotePreferences.themeMode;
                    patch.nameFont = remotePreferences.nameFont as NameFontKey;
                    patch.autoSync = remotePreferences.autoSync;
                    patch.includeQRCode = remotePreferences.includeQRCode;
                    patch.notifProfileUpdates = remotePreferences.notifProfileUpdates;
                    patch.notifShareActivity = remotePreferences.notifShareActivity;
                    patch.notifSyncReminders = remotePreferences.notifSyncReminders;
                }

                if (Object.keys(patch).length > 0) {
                    set(patch);
                    // If cloud overrides themeMode, sync native appearance immediately
                    // so PlatformColor values are correct before next frame.
                    if (patch.themeMode) applyNativeTheme(patch.themeMode);
                }

                if (shouldSeedPreferences) {
                    const nextState = { ...get(), ...patch };
                    debouncedSyncPreferences(getPreferenceSnapshot(nextState));
                }
            },
            clearCard: () => {
                const cardId = get().card?.id;
                set({ card: null, error: null });
                if (cardId) {
                    cardService.deleteCard(cardId).catch(console.error);
                }
            },
            resetAllData: () => {
                const cardId = get().card?.id;
                set({
                    card: null,
                    isLoading: false,
                    error: null,
                    themeMode: DEFAULT_PREFERENCES.themeMode,
                    nameFont: DEFAULT_PREFERENCES.nameFont as NameFontKey,
                    autoSync: DEFAULT_PREFERENCES.autoSync,
                    includeQRCode: DEFAULT_PREFERENCES.includeQRCode,
                    notifProfileUpdates: DEFAULT_PREFERENCES.notifProfileUpdates,
                    notifShareActivity: DEFAULT_PREFERENCES.notifShareActivity,
                    notifSyncReminders: DEFAULT_PREFERENCES.notifSyncReminders,
                });
                if (cardId) {
                    cardService.deleteCard(cardId).catch(console.error);
                }
                userPreferencesService.resetPreferences().catch(console.error);
            },
        }),
        {
            name: 'linkcard-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Sync native appearance BEFORE React re-renders.
                    // This eliminates the theme flash on real devices where
                    // useEffect fires one frame after mount.
                    applyNativeTheme(state.themeMode);
                    state.setHasHydrated(true);
                }
            },
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
