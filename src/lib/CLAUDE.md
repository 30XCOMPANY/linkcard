# src/lib/
> L2 | Parent: /CLAUDE.md

Core utility library — platform primitives and pure constants consumed across all features.

## Members

- `cn.ts`: Tailwind className merging via clsx + tailwind-merge
- `haptics.ts`: Platform-guarded haptic feedback (iOS-only, no-op elsewhere)
- `springs.ts`: Named spring animation parameter presets (snappy, gesture, bouncy, gentle, share)
- `accent-colors.ts`: Accent color palette constants + AccentColorKey type
- `card-presets.ts`: Version background presets, default version factory, and migration-safe normalization
- `icons.tsx`: Platform-adaptive Icon component (SF Symbols on iOS, Ionicons on web/Android)
- `social-platforms.ts`: Social platform registry — label, icon, color, URL prefix for 24 platforms
- `social-icon.tsx`: SocialIcon component — Majesticons line SVGs via SvgXml for platform icons
- `mock-discover.ts`: Mock profile pool for discover feed development (20 profiles, getRandomBatch)
- `mock-cards.ts`: Dev-only mock BusinessCard instances for settings screen testing
- `onboarding-card.ts`: OnboardingDraft → BusinessCard transformer (personality, profile, card creation)
- `contact-actions.ts`: Contact action executor — opens email/linkedin/wechat/url based on action type
- `name-fonts.ts`: Name font registry — family, label, key for card name typography
- `profile-tags.ts`: Tag derivation and resolution from LinkedInProfile + CardTagState
- `platform-color.ts`: Platform-adaptive color abstraction (PlatformColor on iOS, light/dark web fallback)
- `semantic-colors.ts`: Custom semantic color definitions + `useSemanticColors()` hook for reactive dark/light adaptation

[PROTOCOL]: Update this header on change, then check CLAUDE.md
