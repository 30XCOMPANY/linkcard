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
    wallet.ts:     Wallet pass endpoints (generate, update, download)
    share.ts:      Share session endpoints (create, get, track, history)
    emoji.ts:      POST /match — AI-powered emoji matching for profiles
  services/
    scraper.ts:    RapidAPI LinkedIn profile fetch + response parsing + cache
    ai.ts:         OpenAI gpt-4o-mini keyword summarization
    emoji.ts:      OpenAI gpt-4o-mini emoji matching with fallback
    passGenerator.ts: Apple Wallet .pkpass generation (stub)
```

CORS restricted via `CORS_ORIGIN` env var. `/clear-cache` gated behind `NODE_ENV === 'development'`.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
