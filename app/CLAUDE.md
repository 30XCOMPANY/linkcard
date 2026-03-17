# app/
> L2 | Parent: /CLAUDE.md

Expo Router file-based screens. Root layout gates onboarding vs tabs.

## Members

```
_layout.tsx:       Root layout — gates onboarding/ (no card) vs (tabs)/ (card exists)
(tabs)/            Tab navigator (NativeTabs iOS / Tabs web)
  (home)/          Home tab — card hero, editor push
  (settings)/      Settings tab — grouped preferences
  (share)/         Share tab — field toggles, card preview, share actions
onboarding/        3-step auth → linkedin → preview flow
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
