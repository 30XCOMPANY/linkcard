# api/
> L2 | Parent: /CLAUDE.md

Express API server deployed as Vercel serverless function.

## Members

```
index.ts:          Vercel entry point — imports Express app from src/
src/
  index.ts:        Express app (local dev entry, cors, routes, error handler)
  routes/
    linkedin.ts:   POST /profile (fetch), POST /check (change detection), POST /clear-cache (dev only)
    wallet.ts:     Wallet pass endpoints
    share.ts:      Share session endpoints
  services/
    scraper.ts:    RapidAPI LinkedIn profile fetch + OpenAI keyword generation
```

CORS restricted via `CORS_ORIGIN` env var. `/clear-cache` gated behind `NODE_ENV === 'development'`.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
