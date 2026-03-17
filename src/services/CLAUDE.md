# services/
> L2 | Parent: /CLAUDE.md

Backend integration layer. All external API calls and data sync.

## Members

```
supabase.ts:        Supabase client + cardService (upsert/fetch)
linkedin.ts:        LinkedIn profile fetch client (calls api/ endpoints)
share.ts:           Card sharing utilities (server share + local fallback)
notifications.ts:   Push notification setup + scheduling
backgroundSync.ts:  Background sync task definition (registered but never called from app/)
offline.ts:         Offline queue for failed sync operations
cardExport.ts:      Card image export (view-shot + media library)
index.ts:           Barrel
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
