# stores/
> L2 | Parent: /CLAUDE.md

Zustand state management with AsyncStorage persistence.

## Members

```
cardStore.ts:  Main app state — single business-card truth, theme mode, name font.
               Debounced Supabase sync (500ms). Persists card + UI mode only; version visuals live inside CardVersion.
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
