# src/lib/
> L2 | Parent: /CLAUDE.md

Core utility library — platform primitives and pure constants consumed across all features.

## Members

- `cn.ts`: Tailwind className merging via clsx + tailwind-merge
- `haptics.ts`: Platform-guarded haptic feedback (iOS-only, no-op elsewhere)
- `springs.ts`: Named spring animation parameter presets (snappy, gesture, bouncy, gentle)
- `accent-colors.ts`: Accent color palette constants + AccentColorKey type
- `card-presets.ts`: Version background presets, default version factory, and migration-safe normalization
- `icons.tsx`: Platform-adaptive Icon component (SF Symbols on iOS, Ionicons on web/Android)
- `mock-discover.ts`: Mock profile pool for discover feed development (20 profiles, getRandomBatch)
- `contact-actions.ts`: Contact action executor — opens email/linkedin/wechat/url based on action type

[PROTOCOL]: Update this header on change, then check CLAUDE.md
