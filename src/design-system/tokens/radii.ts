/**
 * LinkCard Design System - Border Radius (V7 Labs Style)
 * 
 * Key: 160px for FULL pill buttons (not 9999px, actual measured value)
 */

export const radii = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,       // Standard cards
    '2xl': 32,    // Feature cards
    '3xl': 40,
    pill: 160,    // V7's exact button radius
    nav: 100,     // Floating navigation
    full: 9999,   // Circles
} as const;

export type RadiiToken = keyof typeof radii;
