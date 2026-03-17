/**
 * [INPUT]: None (leaf module)
 * [OUTPUT]: radii
 * [POS]: Token layer — Apple continuous corner radius system
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const radii = {
    none: 0,
    /** 4px — small chips, badges */
    xs: 4,
    /** 8px — buttons, small cards */
    sm: 8,
    /** 12px — standard cards, inputs (Apple default) */
    md: 12,
    /** 16px — large cards */
    lg: 16,
    /** 20px — modal sheets */
    xl: 20,
    /** 24px — feature cards */
    '2xl': 24,
    /** 36px — hero elements */
    '3xl': 36,
    /** 160px — pill buttons (legacy, prefer md/lg) */
    pill: 160,
    /** 100px — nav elements (legacy) */
    nav: 100,
    /** 9999px — perfect circles (avatars) */
    full: 9999,
} as const;

export type RadiiToken = keyof typeof radii;
