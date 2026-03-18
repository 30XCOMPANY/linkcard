# onboarding/
> L2 | Parent: app/CLAUDE.md

Single-path onboarding: welcome → identity → versions → social connect.

## Members

```
_layout.tsx:    Stack navigator — headerless single screen flow
index.tsx:      Four-page horizontal FlatList — gradient tops, emoji+title+subtitle,
                Liquid Glass "Next" button, LinkedIn/Twitter connect on page 4
AGENTS.md:      Directory map for the unified onboarding flow
```

## Flow

1. Page 1: "Welcome to LinkCard" — brand intro, neutral gradient
2. Page 2: 🪪 "Your Digital Business Card" — blue gradient
3. Page 3: 🎭 "One Profile, Many Faces" — orange gradient
4. Page 4: 🔗 "Connect Your Profiles" — green gradient, LinkedIn URL + Twitter card + Skip

On connect/skip: `createNewCard()` → `setCard()` → root layout redirects to `/(tabs)`.

Legacy `linkedin.tsx` / `preview.tsx` / `_shared.ts` were removed so the onboarding story only exists once.

[PROTOCOL]: Update this on any file add/remove/rename, then check app/CLAUDE.md
