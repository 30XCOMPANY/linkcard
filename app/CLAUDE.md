# app/
> L2 | Parent: /CLAUDE.md

Expo Router file-based screens. Root layout gates onboarding vs tabs.

## Members

```
_layout.tsx:       Root layout — gates onboarding/ (no card) vs (tabs)/ (card exists)
(tabs)/            Tab navigator (NativeTabs iOS / Tabs web)
  (home)/          Home tab — orchestrator + split card editor primitives + deep editor route
  (discover)/      Discover tab — random profile feed, card holder collection
  (events)/        Events tab — event listing and management
  (settings)/      Settings tab — grouped preferences
onboarding/        unified 4-step onboarding that imports LinkedIn and creates the first card in-place
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
