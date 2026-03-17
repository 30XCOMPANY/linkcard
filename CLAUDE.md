# LinkCard — LinkedIn Business Card Generator
Expo SDK 55 + expo-router + Zustand + Supabase + Express API

## Directory Structure

```
app/               — Expo Router screens (file-based routing)
  (tabs)/          — Tab navigator (NativeTabs iOS / Tabs web)
    (index,share)/ — Shared stack: Card + Share tabs + editor push
  onboarding/      — 3-step onboarding flow (auth → linkedin → preview)
src/
  components/      — Shared UI components
    cards/         — BusinessCard template renderers
    modals/        — Sheet modals (ShareMenu, BackgroundPicker, AddBlock, etc.)
    qr/            — QR code component
    shared/        — Tailwind-styled shared primitives (AdaptiveGlass, Avatar, QRCode)
    ui/            — Avatar, AnimatedComponents (unique, no design-system dupe)
  css/             — Tailwind v4 CSS foundation (sf.css, glass.css, global entry)
  design-system/   — Unified design tokens + primitives + patterns
    tokens/        — Colors, typography, spacing, radii, shadows, effects, animation, theme
    primitives/    — Box, Text, VStack, HStack
    patterns/      — Button, Input, GlassCard, GlassButton
    layouts/       — GlassScreenLayout
    theme/         — ThemeProvider + useTheme (Apple HIG semantic colors)
    bento/         — BentoGrid layout primitives
  features/
    editor/        — Editor constants, types, helpers (extracted from editor.tsx)
  lib/             — Core utilities (cn, haptics, springs, accent-colors, icons)
  services/        — Supabase, LinkedIn API client, share, notifications, offline
  stores/          — Zustand stores (cardStore)
  tw/              — CSS wrapper layer (useCssElement bridges for className/Tailwind)
  types/           — TypeScript interfaces (LinkedInProfile, CardVersion, etc.)
api/               — Express + Vercel serverless API
  src/
    routes/        — linkedin, wallet, share routes
    services/      — scraper (RapidAPI + OpenAI)
```

## Config Files

- `app.json` — Expo config
- `tsconfig.json` — TypeScript config with `@/` path alias
- `vercel.json` — Vercel deployment config (rewrites to api/)
- `babel.config.js` — Babel with expo preset + reanimated plugin
- `.env.example` — Required env vars (Supabase, RapidAPI, OpenAI, CORS)

## Architecture Decisions

- **Single design system**: `src/design-system/tokens/` is the sole source of truth for all visual tokens. The old `src/constants/theme.ts` was deleted.
- **Apple HIG**: Typography uses system-native fonts (SF Pro / Roboto / system-ui). Color system follows Apple semantic colors with light/dark support.
- **Debounced sync**: cardStore debounces Supabase writes by 500ms to avoid hammering the backend during rapid edits.
- **Editor extraction**: Types, constants, and helpers extracted to `src/features/editor/`. The main EditorScreen, sub-components, and styles remain in `app/editor.tsx` for co-location with the route.
- **v2 routing**: Root layout gates `onboarding/` vs `(tabs)/` based on `cardStore.card`. Tabs use `NativeTabs` (iOS Liquid Glass) with `_layout.web.tsx` fallback. `(index,share)` shared group lets Card and Share tabs share a Stack for push navigation to editor. Old flat screens coexist during migration.

## Dev

```sh
npm start          # Expo dev server
cd api && npm run dev  # API dev server
```
