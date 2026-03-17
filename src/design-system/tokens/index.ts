/**
 * [INPUT]: All token modules
 * [OUTPUT]: Unified re-export of all design tokens
 * [POS]: Token barrel — single import point for the token layer
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

// Full re-exports
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './shadows';
export * from './effects';
export * from './animation';
export * from './theme';

// Named re-exports for convenience
export { colors, accentColors, lightColors, darkColors, resolveColors, palette } from './colors';
export type { AccentColorKey, SemanticColors, ColorToken } from './colors';
export { typography, fontFamily, fontSize, typeScale, fontWeight, lineHeight, letterSpacing } from './typography';
export type { TypeScaleKey, FontFamilyToken, FontSizeToken } from './typography';
export { spacing } from './spacing';
export type { SpacingToken } from './spacing';
export { radii } from './radii';
export type { RadiiToken } from './radii';
export { shadows } from './shadows';
export type { ShadowToken } from './shadows';
export { effects, gradients, glass, blurIntensity, glowEffects, patterns } from './effects';
export { animation, springs, duration, easing } from './animation';
export { getTheme, lightTheme, darkTheme } from './theme';
