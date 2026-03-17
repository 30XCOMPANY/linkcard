# (tabs)/
> L2 | Parent: app/CLAUDE.md

Tab-based main navigation. Uses `NativeTabs` (iOS Liquid Glass) with web fallback via `Tabs`.

## Members

```
_layout.tsx:          Native tab navigator — NativeTabs with SF Symbols (Card, Share, Settings)
_layout.web.tsx:      Web fallback — Tabs with Ionicons icons
settings.tsx:         Settings screen (stub)
(index,share)/        Shared stack group — Card + Share tabs share push navigation (e.g. editor)
```

## Architecture

- `(index,share)` is a shared route group: both Card and Share tabs live in the same Stack so you can push editor from either tab.
- `_layout.web.tsx` is a platform-specific override — Expo Router picks it on web, `_layout.tsx` on native.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
