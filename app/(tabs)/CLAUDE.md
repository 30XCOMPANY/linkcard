# (tabs)/
> L2 | Parent: app/CLAUDE.md

Tab-based main navigation. Uses `NativeTabs` (iOS Liquid Glass) with web fallback via `Tabs`.

## Members

```
_layout.tsx:          Native tab navigator — NativeTabs with SF Symbols (Card, Share, Settings)
_layout.web.tsx:      Web fallback — Tabs with Ionicons icons
(home)/               Home tab — card hero, editor push, version chips, quick actions
(settings)/           Settings tab — grouped preferences, account card, theme, accent color
(share)/              Share tab — field toggle chips, card preview, share actions
```

## Architecture

- Each tab is a separate Stack group with its own `_layout.tsx` for native large title collapse.
- `_layout.web.tsx` is a platform-specific override — Expo Router picks it on web, `_layout.tsx` on native.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
