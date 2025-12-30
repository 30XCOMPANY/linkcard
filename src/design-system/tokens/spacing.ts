/**
 * LinkCard Design System - Spacing Tokens (V7 Labs Style)
 * 
 * V7 uses generous spacing with large section padding (120px+)
 */

export const spacing = {
    /** 4px */
    xs: 4,
    /** 8px */
    sm: 8,
    /** 12px */
    md: 12,
    /** 16px */
    lg: 16,
    /** 20px */
    xl: 20,
    /** 24px - V7 card padding */
    '2xl': 24,
    /** 32px */
    '3xl': 32,
    /** 40px - V7 large card padding */
    '4xl': 40,
    /** 44px - V7 grid gap */
    '5xl': 44,
    /** 64px */
    '6xl': 64,
    /** 80px */
    '7xl': 80,
    /** 120px - V7 section top padding */
    '8xl': 120,
} as const;

export type SpacingToken = keyof typeof spacing;
