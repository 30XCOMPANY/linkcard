# (home)/
> L2 | Parent: app/(tabs)/CLAUDE.md

Home tab — Bonjour!-style profile page with version switching, identity tags, floating action bar.

## Members

```
_layout.tsx:              Stack navigator — native large title with collapse behavior
index.tsx:                Screen orchestrator — wires store state, version selection, image picker, and card actions
editor.tsx:               Card editor — Apple Settings-style, SegmentedControl, Switch field toggles, Slider
versions.ios.tsx:         Native versions route shell — direct iOS-native entry
versions.tsx:             Shared versions route shell — non-iOS fallback entry
social-links.ios.tsx:     Social links list — SwiftUI native list with swipe-to-delete
social-links.tsx:         Social links list — web/Android fallback
social-link-detail.tsx:   Social link URL editor — SwiftUI TextField form
publications.ios.tsx:     Publications list — SwiftUI native list with swipe-to-delete
publications.tsx:         Publications list — web/Android fallback
publication-detail.tsx:   Publication detail editor — SwiftUI TextField form
social-link-picker.ios.tsx: Platform picker — SwiftUI list of available platforms
social-link-picker.tsx:   Platform picker — web/Android fallback
```

Principles: route files stay thin; reusable editing primitives live in `src/screens/home`; iOS route shells bind directly to native implementations once the app commits to a native-only path

[PROTOCOL]: Update this on any file add/remove/rename, then check app/(tabs)/CLAUDE.md
