/**
 * LinkCard Design System - Typography Tokens (V7 Labs Style)
 * 
 * Key features from V7:
 * - NEGATIVE letter-spacing on headlines (-1.44px for H1)
 * - Tight line-height (1:1 for display)
 * - STK Bureau / Satoshi-like geometric sans
 * - Martina Plantijn for editorial serif accents
 */

export const fontFamily = {
    // Display - Use DM Sans as closest to STK Bureau
    display: 'DMSans_600SemiBold',
    displayMedium: 'DMSans_500Medium',
    displayLight: 'DMSans_400Regular',

    // Editorial serif - Cormorant Garamond as Martina Plantijn alternative
    serif: 'CormorantGaramond_400Regular',
    serifItalic: 'CormorantGaramond_400Regular_Italic',
    serifBold: 'CormorantGaramond_700Bold',

    // Body - DM Sans
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemibold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',

    // Mono
    mono: 'JetBrainsMono_400Regular',
    monoMedium: 'JetBrainsMono_500Medium',
} as const;

// V7 Labs exact type scale
export const fontSize = {
    xs: 12,      // UI elements
    sm: 14,      // Body standard
    base: 16,    // Body large
    lg: 18,
    xl: 20,
    '2xl': 24,   // H3/Subheading
    '3xl': 32,
    '4xl': 36,   // H2/Heading
    '5xl': 48,   // H1/Display (V7 hero)
    '6xl': 64,
    '7xl': 72,
    '8xl': 96,
} as const;

export const fontWeight = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
} as const;

// V7 uses very tight line heights
export const lineHeight = {
    none: 1,         // Display headlines (48/48 = 1)
    tight: 1.05,     // Tight headlines
    snug: 1.2,       // H2, H3
    normal: 1.4,     // Subheadings
    relaxed: 1.5,    // Body text (24/16 = 1.5)
    loose: 1.75,
} as const;

// V7's SIGNATURE: Negative letter spacing on headlines
export const letterSpacing = {
    tightest: -0.03,  // -1.44px at 48px = -0.03em (H1)
    tighter: -0.025,  // -0.9px at 36px
    tight: -0.01,     // -0.14px at 14px (body)
    normal: 0,
    wide: 0.025,
    wider: 0.05,
} as const;

export const typography = {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
export type FontSizeToken = keyof typeof fontSize;
