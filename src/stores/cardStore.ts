/**
 * [INPUT]: zustand, zustand/middleware (persist), AsyncStorage, @/src/types (incl. ContactAction/OnboardingDraft), @/src/lib/card-presets
 * [OUTPUT]: useCardStore — card data, theme mode, name font, CRUD actions, tag editing actions, updateContactAction,
 *           resetAllData, buildCharacterFromOnboardingDraft, createProfileFromOnboardingDraft, createCardFromOnboardingDraft
 * [POS]: Main app state — single Zustand store with AsyncStorage persistence, version ordering, onboarding card creation, and debounced Supabase sync
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard, CardBackground, CardTag, CardVersion, ContactAction, LinkedInProfile, OnboardingDraft, OnboardingPersonalityAxes, ThemeMode } from '@/src/types';
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

const slugify = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const normalizeWebsite = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const normalizeLinkedInUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const username = trimmed
        .replace(/^@/, "")
        .replace(/^linkedin\.com\/in\//i, "")
        .replace(/^in\//i, "")
        .replace(/^\/+|\/+$/g, "");
    return username ? `https://www.linkedin.com/in/${username}` : "";
};

const extractLinkedInUsername = (value: string): string => {
    const normalized = normalizeLinkedInUrl(value);
    const match = normalized.match(/linkedin\.com\/in\/([^/?#]+)/i);
    return match?.[1] ?? "";
};

const firstFilled = (...values: Array<string | undefined | null>): string =>
    values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";

const AXIS_FALLBACKS: OnboardingPersonalityAxes = {
    energy: "solo",
    focus: "possibilities",
    decision: "logic",
    rhythm: "adapt",
};

const AXIS_LABELS = {
    energy: {
        people: "Connector",
        solo: "Independent",
    },
    focus: {
        facts: "Grounded",
        possibilities: "Visionary",
    },
    decision: {
        logic: "Systems Thinker",
        people: "Collaborative",
    },
    rhythm: {
        plan: "Structured",
        adapt: "Adaptive",
    },
} as const;

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

    // Preferences
    autoSync: boolean;
    includeQRCode: boolean;
    notifProfileUpdates: boolean;
    notifShareActivity: boolean;
    notifSyncReminders: boolean;

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

    // Preference actions
    setAutoSync: (val: boolean) => void;
    setIncludeQRCode: (val: boolean) => void;
    setNotifProfileUpdates: (val: boolean) => void;
    setNotifShareActivity: (val: boolean) => void;
    setNotifSyncReminders: (val: boolean) => void;

    // Sync actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateContactAction: (action: ContactAction | undefined) => void;
    clearCard: () => void;
    resetAllData: () => void;
}

// ── Mock cards for frontend development ─────────────────────────

export const MOCK_PROFILES = {
    zihan: 'zihan',
    eshaw: 'eshaw',
} as const;
export type MockProfileKey = keyof typeof MOCK_PROFILES;

export const MOCK_CARD: BusinessCard = {
    id: 'mock-card-001',
    profile: {
        url: 'https://linkedin.com/in/zihanhuang',
        username: 'zihanhuang',
        name: 'Zihan Huang',
        headline: 'Designing the next generation of professional identity',
        jobTitle: 'Founder & CEO',
        company: 'LinkCard',
        location: 'San Francisco, CA',
        city: 'San Francisco',
        photoUrl: null,
        email: 'zihan@linkcard.app',
        phone: '+1 (415) 555-0188',
        website: 'https://linkcard.app',
        character: 'Visionary Builder',
        publications: [
            {
                title: 'Why Digital Business Cards Will Replace Paper',
                publisher: 'Medium',
                date: '2025-12',
                url: 'https://medium.com/@zihanhuang/digital-cards',
            },
            {
                title: 'The Future of Professional Networking in the AI Era',
                publisher: 'LinkedIn Pulse',
                date: '2026-01',
                url: 'https://linkedin.com/pulse/future-networking-ai',
            },
        ],
        lastSynced: new Date(),
        checksum: 'mock-checksum',
    },
    versions: createDefaultCardVersions(),
    tagState: createEmptyTagState(),
    contactAction: { type: 'email', label: 'Email Me', value: 'zihan@linkcard.app' },
    qrCodeData: 'https://linkcard.app/c/zihanhuang',
    createdAt: new Date(),
    updatedAt: new Date(),
};

// Sparse profile — tests card rendering with minimal data
export const MOCK_CARD_ESHAW: BusinessCard = {
    id: 'mock-card-eshaw',
    profile: {
        url: '',
        username: '',
        name: 'Eshaw',
        headline: '',
        company: '',
        location: '',
        photoUrl: null,
        lastSynced: new Date(),
        checksum: 'mock-checksum-eshaw',
    },
    versions: createDefaultCardVersions(),
    tagState: createEmptyTagState(),
    qrCodeData: 'https://linkcard.app/c/eshaw',
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const MOCK_CARDS: Record<MockProfileKey, BusinessCard> = {
    zihan: MOCK_CARD,
    eshaw: MOCK_CARD_ESHAW,
};

export const buildCharacterFromOnboardingDraft = (draft: OnboardingDraft): string => {
    const axes: OnboardingPersonalityAxes = {
        ...AXIS_FALLBACKS,
        ...draft.personalityAxes,
    };
    const picks = [
        draft.traits[0],
        draft.interests[0],
        draft.traits[1],
        AXIS_LABELS.energy[axes.energy],
        AXIS_LABELS.focus[axes.focus],
        AXIS_LABELS.decision[axes.decision],
        AXIS_LABELS.rhythm[axes.rhythm],
    ]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));

    return Array.from(new Set(picks)).slice(0, 3).join(", ");
};

export const createProfileFromOnboardingDraft = (
    draft: OnboardingDraft,
    importedProfile?: Partial<LinkedInProfile>
): LinkedInProfile => {
    const linkedInUrl = draft.primaryContactAction === "linkedin"
        ? normalizeLinkedInUrl(draft.contactValue)
        : normalizeLinkedInUrl(importedProfile?.url ?? "");
    const website = draft.primaryContactAction === "url"
        ? normalizeWebsite(draft.contactValue)
        : normalizeWebsite(importedProfile?.website ?? "");
    const email = draft.primaryContactAction === "email"
        ? draft.contactValue.trim()
        : firstFilled(importedProfile?.email);
    const username = firstFilled(importedProfile?.username, extractLinkedInUsername(linkedInUrl));

    return {
        url: linkedInUrl,
        username,
        name: firstFilled(draft.name, importedProfile?.name, "Your Name"),
        headline: firstFilled(draft.headline, importedProfile?.headline),
        jobTitle: firstFilled(draft.jobTitle, importedProfile?.jobTitle) || undefined,
        company: firstFilled(draft.company, importedProfile?.company),
        location: firstFilled(draft.location, importedProfile?.location),
        city: firstFilled(importedProfile?.city),
        bannerUrl: importedProfile?.bannerUrl ?? null,
        photoUrl: draft.photoUrl ?? importedProfile?.photoUrl ?? null,
        email: email || undefined,
        phone: firstFilled(importedProfile?.phone) || undefined,
        website: website || undefined,
        character: buildCharacterFromOnboardingDraft(draft),
        socialLinks:
            importedProfile?.socialLinks ??
            (linkedInUrl ? [{ platform: "linkedin", url: linkedInUrl }] : undefined),
        publications: importedProfile?.publications,
        lastSynced: importedProfile?.lastSynced ?? new Date(),
        checksum: importedProfile?.checksum ?? `manual-${Date.now()}`,
    };
};

const createContactActionFromDraft = (
    draft: OnboardingDraft,
    profile: LinkedInProfile
): ContactAction | undefined => {
    if (!draft.primaryContactAction) {
        return undefined;
    }

    switch (draft.primaryContactAction) {
        case "email":
            return profile.email
                ? { type: "email", label: "Email Me", value: profile.email }
                : undefined;
        case "linkedin":
            return profile.url
                ? { type: "linkedin", label: "Connect on LinkedIn", value: profile.url }
                : undefined;
        case "url":
            return profile.website
                ? { type: "url", label: "Visit Website", value: profile.website }
                : undefined;
        case "wechat":
            return draft.contactValue.trim()
                ? { type: "wechat", label: "Add on WeChat", value: draft.contactValue.trim() }
                : undefined;
        case "github":
            return draft.contactValue.trim()
                ? { type: "github", label: "View GitHub", value: normalizeWebsite(draft.contactValue) }
                : undefined;
        default:
            return undefined;
    }
};

const buildQrCodeData = (profile: LinkedInProfile, cardId: string): string => {
    if (profile.website) return profile.website;
    if (profile.url) return profile.url;
    if (profile.email) return `mailto:${profile.email}`;

    const slug = slugify(profile.name) || cardId;
    return `https://linkcard.app/c/${slug}`;
};

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
            setAutoSync: (val) => set({ autoSync: val }),
            setIncludeQRCode: (val) => set({ includeQRCode: val }),
            setNotifProfileUpdates: (val) => set({ notifProfileUpdates: val }),
            setNotifShareActivity: (val) => set({ notifShareActivity: val }),
            setNotifSyncReminders: (val) => set({ notifSyncReminders: val }),

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

// Helper to create a new business card
export const createNewCard = (
    profile: LinkedInProfile,
    options?: { primaryBackground?: CardBackground; contactAction?: ContactAction }
): BusinessCard => {
    const cardId = `card-${Date.now()}`;

    return {
    id: cardId,
    profile,
    versions: createDefaultCardVersions(options?.primaryBackground),
    tagState: createEmptyTagState(),
    contactAction: options?.contactAction,
    qrCodeData: buildQrCodeData(profile, cardId),
    createdAt: new Date(),
    updatedAt: new Date(),
    };
};

export const createCardFromOnboardingDraft = (
    draft: OnboardingDraft,
    options?: { importedProfile?: Partial<LinkedInProfile>; primaryBackground?: CardBackground }
): BusinessCard => {
    const profile = createProfileFromOnboardingDraft(draft, options?.importedProfile);

    return createNewCard(profile, {
        primaryBackground: options?.primaryBackground,
        contactAction: createContactActionFromDraft(draft, profile),
    });
};
