# (home)/
> L2 | Parent: app/(tabs)/CLAUDE.md

Home tab — Bonjour!-style profile page with version switching, identity tags, floating action bar.

## Members

```
_layout.tsx:              Stack navigator — native large title with collapse behavior
index.tsx:                Screen orchestrator — wires store state, version selection, image picker, and card actions
profile-header.tsx:       Native header — version switcher, edit entry, quick card actions
profile-card-editor.tsx:  Editable card body — banner, avatar, name, headline, tags, social links, publications
editable-text.tsx:        Inline text primitive — tap to edit, blur to save
editable-tag-list.tsx:    Tag editor — long-press edit mode, rename, delete, add
swipe-to-share.tsx:       Gesture-driven share — pan up card, blur condensation + Skia ripple, auto-triggers Share Sheet
editor.tsx:               Card editor — Apple Settings-style, SegmentedControl, Switch field toggles, Slider
social-links.ios.tsx:     Social links list — SwiftUI native list with swipe-to-delete
social-links.tsx:         Social links list — web/Android fallback
social-link-detail.tsx:   Social link URL editor — SwiftUI TextField form
social-link-picker.ios.tsx: Platform picker — SwiftUI list of available platforms
social-link-picker.tsx:   Platform picker — web/Android fallback
```

[PROTOCOL]: Update this on any file add/remove/rename, then check app/(tabs)/CLAUDE.md
