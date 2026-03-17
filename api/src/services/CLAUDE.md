# api/src/services/
> L2 | Parent: api/src/CLAUDE.md

Business logic services consumed by route handlers.

## Members

```
scraper.ts:        RapidAPI LinkedIn profile fetch + response parsing, 1hr cache, rate limiter (10/min)
ai.ts:             OpenAI gpt-4o-mini keyword summarization (summarizeToKeywords)
emoji.ts:          OpenAI gpt-4o-mini emoji matching (matchEmojis) with fallback
passGenerator.ts:  Apple Wallet .pkpass generation (stub — needs Apple Developer certs)
```

[PROTOCOL]: Update this on any file add/remove/rename, then check api/src/CLAUDE.md
