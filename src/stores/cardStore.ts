import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard, CardVersion, LinkedInProfile, ThemeMode } from '@/src/types';
import { accentColors, AccentColorKey } from '@/src/constants/theme';
import { cardService } from '@/src/services/supabase';

interface CardState {
    // Card data
    card: BusinessCard | null;
    isLoading: boolean;
    error: string | null;

    // Theme
    themeMode: ThemeMode;
    accentColor: string;

    // Actions
    setCard: (card: BusinessCard) => void;
    updateProfile: (profile: Partial<LinkedInProfile>) => void;
    addVersion: (version: CardVersion) => void;
    updateVersion: (versionId: string, updates: Partial<CardVersion>) => void;
    deleteVersion: (versionId: string) => void;
    setDefaultVersion: (versionId: string) => void;

    // Theme actions
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColorKey | string) => void;

    // Sync actions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearCard: () => void;
}

// Default card versions
const defaultVersions: CardVersion[] = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Executive left-aligned layout with a clean aesthetic',
        visibleFields: ['photoUrl', 'name', 'jobTitle', 'headline', 'company', 'location', 'qrCode', 'character'],
        template: 'ocean',
        accentColor: '#0066CC',
        isDefault: true,
        fieldStyles: {
            photoUrl: { x: 10, y: 8, width: 20, borderRadius: 100 },
            name: { x: 10, y: 30, width: 80, fontWeight: '700', fontSize: 28, color: '#000000' },
            jobTitle: { x: 10, y: 38, width: 80, fontWeight: '500', fontSize: 13, color: '#666666' },
            headline: { x: 10, y: 46, width: 80, fontSize: 15, lineHeight: 22, color: '#1a1a1a' },
            character: { x: 10, y: 58, width: 80, fontSize: 12, color: '#999999' },
            company: { x: 10, y: 76, width: 50, fontWeight: '700', fontSize: 14, color: '#000000' },
            location: { x: 10, y: 84, width: 50, fontSize: 12, color: '#666666' },
            qrCode: { x: 74, y: 76, width: 16 }
        }
    },
    {
        id: 'networking',
        name: 'Networking',
        description: 'Quick connect with a bento layout',
        visibleFields: ['photoUrl', 'name', 'headline', 'company', 'qrCode'],
        template: 'cream',
        accentColor: '#8B5CF6',
        isDefault: false,
    },
    {
        id: 'personal',
        name: 'Personal',
        description: 'Elegant sunset theme for social contexts',
        visibleFields: ['photoUrl', 'name', 'headline', 'location', 'website', 'qrCode'],
        template: 'sunset',
        accentColor: '#EC4899',
        isDefault: false,
    },
];

export const useCardStore = create<CardState>()(
    persist(
        (set, get) => ({
            card: null,
            isLoading: false,
            error: null,
            themeMode: 'system',
            accentColor: accentColors.indigo,

            setCard: (card) => {
                set({ card, error: null });
                // Sync to cloud in background
                cardService.upsertCard(card).catch(console.error);
            },

            updateProfile: (profile) => {
                const currentCard = get().card;
                if (!currentCard) return;

                const updatedCard = {
                    ...currentCard,
                    profile: { ...currentCard.profile, ...profile },
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                // Sync to cloud in background
                cardService.upsertCard(updatedCard).catch(console.error);
            },

            addVersion: (version) => {
                const currentCard = get().card;
                if (!currentCard) return;

                const updatedCard = {
                    ...currentCard,
                    versions: [...currentCard.versions, version],
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                cardService.upsertCard(updatedCard).catch(console.error);
            },

            updateVersion: (versionId, updates) => {
                const currentCard = get().card;
                if (!currentCard) return;

                const updatedCard = {
                    ...currentCard,
                    versions: currentCard.versions.map((v) =>
                        v.id === versionId ? { ...v, ...updates } : v
                    ),
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                cardService.upsertCard(updatedCard).catch(console.error);
            },

            deleteVersion: (versionId) => {
                const currentCard = get().card;
                if (!currentCard) return;

                // Don't delete if it's the only version
                if (currentCard.versions.length <= 1) return;

                const newVersions = currentCard.versions.filter((v) => v.id !== versionId);

                // If we deleted the default, make the first one default
                if (currentCard.versions.find((v) => v.id === versionId)?.isDefault) {
                    newVersions[0].isDefault = true;
                }

                const updatedCard = {
                    ...currentCard,
                    versions: newVersions,
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                cardService.upsertCard(updatedCard).catch(console.error);
            },

            setDefaultVersion: (versionId) => {
                const currentCard = get().card;
                if (!currentCard) return;

                const updatedCard = {
                    ...currentCard,
                    versions: currentCard.versions.map((v) => ({
                        ...v,
                        isDefault: v.id === versionId,
                    })),
                    updatedAt: new Date(),
                };

                set({ card: updatedCard });
                cardService.upsertCard(updatedCard).catch(console.error);
            },

            setThemeMode: (mode) => set({ themeMode: mode }),

            setAccentColor: (color) => {
                const colorValue = color in accentColors
                    ? accentColors[color as AccentColorKey]
                    : color;
                set({ accentColor: colorValue });
            },

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),

            clearCard: () => set({ card: null, error: null }),
        }),
        {
            name: 'linkcard-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                card: state.card,
                themeMode: state.themeMode,
                accentColor: state.accentColor,
            }),
        }
    )
);

// Helper to create a new business card
export const createNewCard = (profile: LinkedInProfile): BusinessCard => ({
    id: `card-${Date.now()}`,
    profile,
    versions: defaultVersions,
    qrCodeData: `https://www.linkedin.com/in/${profile.username}`,
    createdAt: new Date(),
    updatedAt: new Date(),
});

