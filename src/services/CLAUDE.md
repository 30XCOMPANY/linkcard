# services/
> L2 | Parent: /CLAUDE.md

Backend integration layer. All external API calls and data sync.

## Members

```
supabase.ts:   Supabase client + cardService, userProfileService, publicCardService, auth helpers, DB types
linkedin.ts:   LinkedIn profile fetch client (calls api/ endpoints), URL parsing, change detection
share.ts:      Card sharing utilities (server share + local fallback)
index.ts:      Barrel re-export (linkedin, share, supabase)
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
