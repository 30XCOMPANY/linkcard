# onboarding/
> L2 | Parent: app/CLAUDE.md

3-step onboarding flow: auth -> linkedin -> preview. Shown when no card exists in cardStore.

## Members

```
_layout.tsx:    Stack navigator — headerless auth, headed linkedin/preview
index.tsx:      Auth screen (stub) — entry point, no header
linkedin.tsx:   LinkedIn import screen (stub) — profile URL input
preview.tsx:    Preview screen (stub) — card preview before saving
```

## Flow

1. `index` (Auth) — user signs in or starts fresh
2. `linkedin` — user provides LinkedIn profile URL for import
3. `preview` — user previews generated card, confirms to save

Root layout gates here when `cardStore.card === null`.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
