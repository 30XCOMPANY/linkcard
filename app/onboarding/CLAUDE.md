# onboarding/
> L2 | Parent: app/CLAUDE.md

3-step onboarding flow: auth -> linkedin -> preview. Shown when no card exists in cardStore.

## Members

```
_layout.tsx:    Stack navigator — headerless auth, headed linkedin/preview
_shared.ts:     Module-level profile data shuttle (linkedin → preview) — avoids serialization
index.tsx:      Auth screen — email/password + Google OAuth, spring-animated buttons, shake error
linkedin.tsx:   LinkedIn URL input — single input, bottom bar CTA, fetchLinkedInProfile call
preview.tsx:    Profile preview — staggered card display, smart theme selection, createNewCard
```

## Flow

1. `index` (Auth) — user signs in or starts fresh → pushes to linkedin
2. `linkedin` — user provides LinkedIn URL → fetchLinkedInProfile → stores in _shared → pushes to preview
3. `preview` — displays extracted data → createNewCard + smart theme → replaces to /(tabs)

## Data Passing

Profile data flows via `_shared.ts` module-level variable. No JSON serialization.
`setOnboardingProfile()` in linkedin, `getOnboardingProfile()` in preview.

Root layout gates here when `cardStore.card === null`.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
