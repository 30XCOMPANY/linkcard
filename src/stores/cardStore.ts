/**
 * [INPUT]: zustand, zustand/middleware (persist), AsyncStorage, @/src/types (incl. ContactAction), @/src/lib/card-presets
 * [OUTPUT]: useCardStore — card data, theme mode, name font, CRUD actions, tag editing actions, updateContactAction
 * [POS]: Main app state — single Zustand store with AsyncStorage persistence, version ordering, and debounced Supabase sync
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard, CardBackground, CardTag, CardVersion, ContactAction, LinkedInProfile, ThemeMode } from '@/src/types';
import { createDefaultCardVersions, normalizeCardVersion } from '@/src/lib/card-presets';
import type { NameFontKey } from '@/src/lib/name-fonts';
import { cardService } from '@/src/services/supabase';

// Debounced cloud sync — avoids hammering Supabase on rapid edits
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSync = (card: BusinessCard) => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        cardService.upsertCard(card).catch(console.error);
    }, 500);
};

const createEmptyTagState = (): BusinessCard['tagState'] => ({
    custom: [],
    hidden: [],
    renamed: {},
});

const normalizeCard = (card: BusinessCard): BusinessCard => ({
    ...card,
    tagState: card.tagState ?? createEmptyTagState(),
    versions: card.versions.map(normalizeCardVersion),
});

const moveItems = <T,>(items: T[], sourceIndices: number[], destination: number): T[] => {
    if (sourceIndices.length === 0) return items;

    const sortedSources = [...sourceIndices].sort((a, b) => a - b);
    const movingItems = sortedSources
        .map((index) => items[index])
        .filter((item): item is T => item !== undefined);

    if (movingItems.length === 0) return items;

    const sourceSet = new Set(sortedSources);
    const remainingItems = items.filter((_, index) => !sourceSet.has(index));
    const offset = sortedSources.filter((index) => index < destination).length;
    const targetIndex = Math.max(0, Math.min(remainingItems.length, destination - offset));

    remainingItems.splice(targetIndex, 0, ...movingItems);
    return remainingItems;
};

interface CardState {
    // Card data
    card: BusinessCard | null;
    isLoading: boolean;
    error: string | null;

    // Theme
    themeMode: ThemeMode;
    nameFont: NameFontKey;

    // Actions
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

    // Theme actions
    setThemeMode: (mode: ThemeMode) => void;
    setNameFont: (font: NameFontKey) => void;

    // Sync actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateContactAction: (action: ContactAction | undefined) => void;
    clearCard: () => void;
}

// ── Mock card for frontend development ──────────────────────────
const MOCK_CARD: BusinessCard = {
    id: 'mock-card-001',
    profile: {
        url: 'https://linkedin.com/in/henryzhao',
        username: 'henryzhao',
        name: 'Henry Zhao',
        headline: 'Building the future of professional networking',
        jobTitle: 'Founder & CEO',
        company: 'LinkCard',
        location: 'San Francisco, CA',
        city: 'San Francisco',
        photoUrl: null,
        email: 'henry@linkcard.app',
        phone: '+1 (415) 555-0123',
        website: 'https://linkcard.app',
        character: 'Visionary Builder',
        lastSynced: new Date(),
        checksum: 'mock-checksum',
    },
    versions: createDefaultCardVersions(),
    tagState: createEmptyTagState(),
    qrCodeData: 'https://linkcard.app/c/henryzhao',
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const useCardStore = create<CardState>()(
    persist(
        (set, get) => ({
            card: MOCK_CARD,  // TODO: revert to null when onboarding is ready
            isLoading: false,
            error: null,
            themeMode: 'system',
            nameFont: 'classic' as NameFontKey,

            setCard: (card) => {
                const normalizedCard = normalizeCard(card);
                set({ card: normalizedCard, error: null });
                debouncedSync(normalizedCard);
            },

            updateProfile: (profile) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const updatedCard = {
                    ...normalizedCard,
                    profile: { ...normalizedCard.profile, ...profile },
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                // Sync to cloud in background
                debouncedSync(updatedCard);
            },

            addVersion: (version) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const updatedCard = {
                    ...normalizedCard,
                    versions: [...normalizedCard.versions, normalizeCardVersion(version)],
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            updateVersion: (versionId, updates) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const updatedCard = {
                    ...normalizedCard,
                    versions: normalizedCard.versions.map((v) =>
                        v.id === versionId ? normalizeCardVersion({ ...v, ...updates }) : v
                    ),
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            deleteVersion: (versionId) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                // Don't delete if it's the only version
                if (normalizedCard.versions.length <= 1) return;

                const newVersions = normalizedCard.versions.filter((v) => v.id !== versionId);

                // If we deleted the default, make the first one default
                if (normalizedCard.versions.find((v) => v.id === versionId)?.isDefault) {
                    newVersions[0].isDefault = true;
                }

                const updatedCard = {
                    ...normalizedCard,
                    versions: newVersions,
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            moveVersions: (sourceIndices, destination) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const reorderedVersions = moveItems(
                    normalizedCard.versions,
                    sourceIndices,
                    destination
                );

                const updatedCard = {
                    ...normalizedCard,
                    versions: reorderedVersions,
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            setDefaultVersion: (versionId) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const updatedCard = {
                    ...normalizedCard,
                    versions: normalizedCard.versions.map((v) => ({
                        ...v,
                        isDefault: v.id === versionId,
                    })),
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            addCustomTag: (tag) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const updatedCard = {
                    ...normalizedCard,
                    tagState: {
                        ...normalizedCard.tagState,
                        custom: [
                            ...normalizedCard.tagState.custom,
                            {
                                id: `custom:${Date.now()}`,
                                emoji: tag.emoji,
                                label: tag.label,
                                source: 'custom' as const,
                            },
                        ],
                    },
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            removeTag: (tagId) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const isCustomTag = tagId.startsWith('custom:');
                const updatedCard = {
                    ...normalizedCard,
                    tagState: {
                        ...normalizedCard.tagState,
                        custom: isCustomTag
                            ? normalizedCard.tagState.custom.filter((tag) => tag.id !== tagId)
                            : normalizedCard.tagState.custom,
                        hidden: isCustomTag
                            ? normalizedCard.tagState.hidden
                            : Array.from(new Set([...normalizedCard.tagState.hidden, tagId])),
                    },
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            renameTag: (tagId, label) => {
                const currentCard = get().card;
                if (!currentCard) return;
                const normalizedCard = normalizeCard(currentCard);

                const trimmed = label.trim();
                if (!trimmed) return;

                const isCustomTag = tagId.startsWith('custom:');
                const updatedCard = {
                    ...normalizedCard,
                    tagState: {
                        ...normalizedCard.tagState,
                        custom: isCustomTag
                            ? normalizedCard.tagState.custom.map((tag) =>
                                tag.id === tagId ? { ...tag, label: trimmed } : tag
                            )
                            : normalizedCard.tagState.custom,
                        renamed: isCustomTag
                            ? normalizedCard.tagState.renamed
                            : {
                                ...normalizedCard.tagState.renamed,
                                [tagId]: trimmed,
                            },
                    },
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                debouncedSync(updatedCard);
            },

            setThemeMode: (mode) => set({ themeMode: mode }),
            setNameFont: (font) => set({ nameFont: font }),

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

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

            clearCard: () => set({ card: null, error: null }),
        }),
        {
            name: 'linkcard-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                card: state.card,
                themeMode: state.themeMode,
                nameFont: state.nameFont,
            }),
        }
    )
);

// Helper to create a new business card
export const createNewCard = (
    profile: LinkedInProfile,
    options?: { primaryBackground?: CardBackground }
): BusinessCard => ({
    id: `card-${Date.now()}`,
    profile,
    versions: createDefaultCardVersions(options?.primaryBackground),
    tagState: createEmptyTagState(),
    qrCodeData: `https://www.linkedin.com/in/${profile.username}`,
    createdAt: new Date(),
    updatedAt: new Date(),
});
