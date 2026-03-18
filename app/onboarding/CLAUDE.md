# onboarding/
> L2 | Parent: app/CLAUDE.md

Single-path onboarding: claim identity → role → signature → personality tuning → reachability → review.

## Members

```
_layout.tsx:    Stack navigator — headerless single screen flow
index.tsx:      Six-step identity builder — live ProfileCard preview, one-question steps,
                optional LinkedIn enrich on review, creates first card from onboarding draft
AGENTS.md:      Directory map for the unified onboarding flow
```

## Flow

1. Claim: name + optional photo, immediate ownership
2. Role: job title + optional company
3. Signature: one-line intro
4. Vibe: four personality choices + traits + interests
5. Reach: choose one primary contact path
6. Review: create card, optional LinkedIn enrich that only fills missing details

On create: `createCardFromOnboardingDraft()` → `setCard()` → root layout redirects to `/(tabs)`.

LinkedIn import is no longer the entry gate. It only enriches the already-owned identity on the review step.

[PROTOCOL]: Update this on any file add/remove/rename, then check app/CLAUDE.md
