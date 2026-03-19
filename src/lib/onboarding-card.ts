/**
 * [INPUT]: @/src/types (OnboardingDraft, OnboardingPersonalityAxes, LinkedInProfile, ContactAction, CardBackground, BusinessCard)
 * [OUTPUT]: buildCharacterFromOnboardingDraft, createProfileFromOnboardingDraft, createCardFromOnboardingDraft
 * [POS]: Onboarding draft → BusinessCard transformer — consumed by onboarding screen and cardStore
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type {
    BusinessCard,
    CardBackground,
    ContactAction,
    LinkedInProfile,
    OnboardingDraft,
    OnboardingPersonalityAxes,
} from '@/src/types';
import { createDefaultCardVersions } from '@/src/lib/card-presets';
import { buildPublicCardUrl } from '@/src/lib/public-url';

// ── Helpers ─────────────────────────────────────────────────────

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

const slugify = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// ── Personality ─────────────────────────────────────────────────

const AXIS_FALLBACKS: OnboardingPersonalityAxes = {
    energy: "solo",
    focus: "possibilities",
    decision: "logic",
    rhythm: "adapt",
};

const AXIS_LABELS = {
    energy: { people: "Connector", solo: "Independent" },
    focus: { facts: "Grounded", possibilities: "Visionary" },
    decision: { logic: "Systems Thinker", people: "Collaborative" },
    rhythm: { plan: "Structured", adapt: "Adaptive" },
} as const;

// ── Public API ──────────────────────────────────────────────────

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
    if (!draft.primaryContactAction) return undefined;

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
    return buildPublicCardUrl(slugify(profile.username || profile.name) || cardId);
};

export const createNewCard = (
    profile: LinkedInProfile,
    options?: { primaryBackground?: CardBackground; contactAction?: ContactAction }
): BusinessCard => {
    const cardId = `card-${Date.now()}`;
    return {
        id: cardId,
        profile,
        versions: createDefaultCardVersions(options?.primaryBackground),
        tagState: { custom: [], hidden: [], renamed: {} },
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
