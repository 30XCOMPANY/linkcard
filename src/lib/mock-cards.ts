/**
 * [INPUT]: @/src/types (BusinessCard), @/src/lib/card-presets (createDefaultCardVersions)
 * [OUTPUT]: MOCK_CARD, MOCK_CARD_ESHAW, MOCK_CARDS, MockProfileKey
 * [POS]: Dev-only mock cards for settings screen testing
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { BusinessCard } from '@/src/types';
import { createDefaultCardVersions } from '@/src/lib/card-presets';

const createEmptyTagState = (): BusinessCard['tagState'] => ({
    custom: [],
    hidden: [],
    renamed: {},
});

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
        socialLinks: [
            { platform: 'linkedin', url: 'https://linkedin.com/in/zihanhuang' },
            { platform: 'x', url: 'https://x.com/zihanhuang' },
            { platform: 'github', url: 'https://github.com/zihanhuang' },
            { platform: 'instagram', url: 'https://instagram.com/zihanhuang' },
            { platform: 'threads', url: 'https://threads.net/@zihanhuang' },
            { platform: 'product-hunt', url: 'https://producthunt.com/@zihanhuang' },
        ],
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

export type MockProfileKey = 'zihan' | 'eshaw';

export const MOCK_CARDS: Record<MockProfileKey, BusinessCard> = {
    zihan: MOCK_CARD,
    eshaw: MOCK_CARD_ESHAW,
};
