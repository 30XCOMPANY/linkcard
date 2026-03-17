# api/src/routes/
> L2 | Parent: api/src/CLAUDE.md

Express route handlers — each file exports a Router mounted by src/index.ts.

## Members

```
linkedin.ts:   POST /profile (fetch+parse), POST /check (change detection), POST /clear-cache (dev only)
share.ts:      POST /create (shareable link), GET /:shareId (card data), POST /track, GET /history
wallet.ts:     POST /generate (Apple Wallet pass), PUT /update, GET /pass/:serialNumber
emoji.ts:      POST /match (AI-powered emoji matching for profiles)
```

[PROTOCOL]: Update this on any file add/remove/rename, then check api/src/CLAUDE.md
