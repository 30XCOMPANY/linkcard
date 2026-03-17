/**
 * [INPUT]: None (leaf module)
 * [OUTPUT]: spacing
 * [POS]: Token layer — Apple 8pt grid spacing system
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const spacing = {
    /** 2px — hairline gaps */
    '2xs': 2,
    /** 4px */
    xs: 4,
    /** 8px — tight element spacing */
    sm: 8,
    /** 12px — compact padding */
    md: 12,
    /** 16px — standard padding (Apple default) */
    lg: 16,
    /** 20px — generous padding */
    xl: 20,
    /** 24px — section inner padding */
    '2xl': 24,
    /** 32px — section gaps */
    '3xl': 32,
    /** 40px — large section gaps */
    '4xl': 40,
    /** 48px — screen-level spacing */
    '5xl': 48,
    /** 64px — hero spacing */
    '6xl': 64,
    /** 80px — legacy large spacing */
    '7xl': 80,
    /** 120px — legacy section padding */
    '8xl': 120,
    /** 160px — full section spacing */
    section: 160,
} as const;

export type SpacingToken = keyof typeof spacing;
