/**
 * [INPUT]: react-native Platform, TextStyle
 * [OUTPUT]: fontFamily, typeScale, fontSize, fontWeight, lineHeight, letterSpacing, typography
 * [POS]: Token layer — Apple HIG type system with platform-native fonts
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Platform, TextStyle } from 'react-native';

/* ================================================================
 * FONT FAMILIES — System native
 * iOS: SF Pro (via "System"), Android: Roboto, Web: system-ui
 * ================================================================ */

export const fontFamily = {
    regular:   Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' })!,
    medium:    Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' })!,
    semibold:  Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' })!,
    bold:      Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' })!,
    monospace: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, SFMono-Regular, monospace' })!,

    // Legacy aliases — map to system font so old imports don't break
    display:        Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    displayMedium:  Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    displayLight:   Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    body:           Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    bodyMedium:     Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    bodySemibold:   Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    bodyBold:       Platform.select({ ios: 'System', android: 'Roboto', default: 'system-ui' })!,
    serif:          Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })!,
    serifItalic:    Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })!,
    serifBold:      Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' })!,
    mono:           Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!,
    monoMedium:     Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!,
} as const;

/* ================================================================
 * APPLE HIG TYPE SCALE
 * ================================================================ */

export const typeScale = {
    largeTitle:  { fontSize: 34, lineHeight: 41, fontWeight: '700' as TextStyle['fontWeight'] },
    title1:      { fontSize: 28, lineHeight: 34, fontWeight: '700' as TextStyle['fontWeight'] },
    title2:      { fontSize: 22, lineHeight: 28, fontWeight: '700' as TextStyle['fontWeight'] },
    title3:      { fontSize: 20, lineHeight: 25, fontWeight: '600' as TextStyle['fontWeight'] },
    headline:    { fontSize: 17, lineHeight: 22, fontWeight: '600' as TextStyle['fontWeight'] },
    body:        { fontSize: 17, lineHeight: 22, fontWeight: '400' as TextStyle['fontWeight'] },
    callout:     { fontSize: 16, lineHeight: 21, fontWeight: '400' as TextStyle['fontWeight'] },
    subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as TextStyle['fontWeight'] },
    footnote:    { fontSize: 13, lineHeight: 18, fontWeight: '400' as TextStyle['fontWeight'] },
    caption1:    { fontSize: 12, lineHeight: 16, fontWeight: '400' as TextStyle['fontWeight'] },
    caption2:    { fontSize: 11, lineHeight: 13, fontWeight: '400' as TextStyle['fontWeight'] },
} as const;

export type TypeScaleKey = keyof typeof typeScale;

/* ================================================================
 * INDIVIDUAL TOKEN SCALES — direct access + legacy compat
 * ================================================================ */

export const fontSize = {
    xs:    12,
    sm:    13,
    base:  15,
    md:    16,
    lg:    17,
    xl:    20,
    '2xl': 22,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56,
    '8xl': 64,
} as const;

export const fontWeight = {
    regular:  '400' as TextStyle['fontWeight'],
    medium:   '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold:     '700' as TextStyle['fontWeight'],
} as const;

export const lineHeight = {
    none:    1,
    tight:   1.1,
    snug:    1.25,
    normal:  1.3,
    relaxed: 1.5,
    loose:   1.75,
} as const;

export const letterSpacing = {
    tighter:  -0.03,
    tight:    -0.01,
    normal:   0,
    wide:     0.02,
    wider:    0.05,
} as const;

export const typography = {
    fontFamily,
    typeScale,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
export type FontSizeToken = keyof typeof fontSize;
