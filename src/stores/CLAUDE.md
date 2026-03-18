# stores/
> L2 | Parent: /CLAUDE.md

Zustand state management with AsyncStorage persistence.

## Members

```
cardStore.ts:     Main app state — card CRUD, theme mode, name font, preferences.
                  Debounced Supabase sync (500ms). Uses `withCard` pattern to eliminate mutation boilerplate.
                  Mock data and onboarding builders extracted to src/lib/.
contactsStore.ts: Discover feed + card holder — saved contacts, daily refresh counter, browse state.
                  Separate persistence key 'linkcard-contacts'. Not synced to Supabase.
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
