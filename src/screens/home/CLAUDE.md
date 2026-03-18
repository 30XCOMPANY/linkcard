# home/
> L2 | Parent: /Users/nora/Desktop/linkcard/src/screens/AGENTS.md

Shared Home screen implementations and editing primitives that should never live in `app/`.

## Members

```
versions-screen.tsx:        Shared versions manager — settings-style fallback implementation
versions-native-screen.tsx: Native versions manager — ExpoUI list with reorder/delete
profile-header.tsx:         Native toolbar shell — version switcher, edit entry, account shortcut
profile-card-editor.tsx:    Editable card body — banner, avatar, text fields, tags, links
editable-text.tsx:          Inline text primitive — tap to edit, blur to save
editable-tag-list.tsx:      Tag editor — long-press edit, rename, delete, add
```

Principles: route files stay in `app/`; reusable editing surfaces stay here; iOS route shells should bind directly to native implementations once the product commits to a native-only path.
