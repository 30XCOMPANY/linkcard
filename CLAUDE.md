# LinkCard — LinkedIn Business Card Generator
Expo SDK 55 + expo-router + Zustand + Supabase + Express API

## Directory Structure

```
app/               — Expo Router screens (file-based routing)
  (tabs)/          — Tab navigator (NativeTabs iOS / Tabs web)
    (home)/        — Home tab: card hero, editor push, version chips
    (discover)/    — Discover tab: random profile feed, card holder collection
    (events)/      — Events tab: event listing and management
    (settings)/    — Settings tab: grouped preferences, account card
  onboarding/      — 6-step identity builder (claim → role → signature → vibe → reach → review)
src/
  components/      — Shared UI components
    card/          — Pure presentational card rendering (CardField, CardDisplay)
    shared/        — Tailwind-styled shared primitives (AdaptiveGlass, Avatar, QRCode)
  css/             — Tailwind v4 CSS foundation (sf.css, glass.css, global entry)
  design-system/   — Unified design tokens + primitives + patterns + settings
  lib/             — Core utilities (cn, haptics, springs, accent-colors, icons, onboarding-card, mock-cards)
  services/        — Supabase, LinkedIn, share (3 active services)
  stores/          — Zustand stores (cardStore, contactsStore)
  tw/              — CSS wrapper layer (useCssElement bridges for className/Tailwind)
  types/           — TypeScript interfaces (LinkedInProfile, CardVersion, etc.)
api/               — Express + Vercel serverless API
  src/
    routes/        — linkedin, wallet, share, emoji routes
    services/      — scraper, ai, emoji, passGenerator
```

## Config Files

- `app.json` — Expo config
- `tsconfig.json` — TypeScript config with `@/` path alias
- `vercel.json` — Vercel deployment config (rewrites to api/)
- `babel.config.js` — Babel with expo preset + reanimated plugin
- `.env.example` — Required env vars (Supabase, RapidAPI, OpenAI, CORS)

## Architecture Decisions

- **Single design system**: `src/design-system/tokens/` is the sole source of truth for all visual tokens.
- **Apple HIG**: Typography uses system-native fonts (SF Pro / Roboto / system-ui). Color system follows Apple semantic colors with light/dark support.
- **Debounced sync**: cardStore debounces Supabase writes by 500ms to avoid hammering the backend during rapid edits.
- **withCard pattern**: All card mutations in cardStore use `withCard(get, set, mutate)` — eliminates the repeated null-check/normalize/set/sync dance.
- **Onboarding builders extracted**: `src/lib/onboarding-card.ts` owns the OnboardingDraft → BusinessCard transformation. Mock data lives in `src/lib/mock-cards.ts`.
- **v2 routing**: Root layout gates `onboarding/` vs `(tabs)/` based on `cardStore.card`. Tabs use `NativeTabs` (iOS Liquid Glass) with `_layout.web.tsx` fallback. Each tab is a separate Stack group with native large title collapse.

## Dev

```sh
npm start          # Expo dev server
cd api && npm run dev  # API dev server
```
