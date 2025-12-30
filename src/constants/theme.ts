import { Theme, ThemeMode } from '@/src/types';

/**
 * LinkCard Design System
 * 
 * Light, elegant, editorial aesthetic matching LinkCard website.
 * Cormorant Garamond serif typography.
 * White/off-white background with subtle texture feel.
 */

// ============================================================================
// SPACING SYSTEM
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
  section: 160,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// Display: Cormorant Garamond (elegant serif)
// Body: DM Sans (modern, clean sans-serif)
// ============================================================================
export const typography = {
  fontFamily: {
    // Display - Cormorant Garamond (elegant serif)
    display: 'CormorantGaramond_400Regular',
    displayItalic: 'CormorantGaramond_400Regular_Italic',
    displayMedium: 'CormorantGaramond_500Medium',
    displaySemibold: 'CormorantGaramond_600SemiBold',
    displayBold: 'CormorantGaramond_700Bold',
    // Body - DM Sans (modern sans-serif)
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemibold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',
    bodyItalic: 'DMSans_400Regular',
    // Mono - for metadata
    mono: 'JetBrainsMono_400Regular',
    monoMedium: 'JetBrainsMono_500Medium',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 56,
    '7xl': 72,
    '8xl': 96,
  },
  lineHeight: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.625,
    loose: 1.75,
  },
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
} as const;

// ============================================================================
// COLOR SYSTEM
// Light theme with off-white background
// ============================================================================
export const colors = {
  // Core
  background: '#F5F5F3', // Off-white/light gray (paper-like)
  foreground: '#1A1A1A', // Near black for text

  // Surfaces
  white: '#FFFFFF',
  black: '#000000',

  // Muted
  muted: '#EBEBEB',
  mutedForeground: '#6B6B6B',

  // Borders
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Functional
  success: '#10B981',
  error: '#EF4444',
} as const;

// Legacy accent colors (backward compatibility)
export const accentColors = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  indigo: '#1A1A1A',
  violet: '#1A1A1A',
  fuchsia: '#1A1A1A',
  pink: '#1A1A1A',
  rose: '#1A1A1A',
  orange: '#1A1A1A',
  amber: '#1A1A1A',
  emerald: '#1A1A1A',
  teal: '#1A1A1A',
  cyan: '#1A1A1A',
  blue: '#1A1A1A',
  slate: '#6B6B6B',
} as const;

export type AccentColorKey = keyof typeof accentColors;

// ============================================================================
// BORDERS
// ============================================================================
export const borders = {
  hairline: { borderWidth: 1, borderColor: colors.border },
  thin: { borderWidth: 1, borderColor: colors.foreground },
  medium: { borderWidth: 2, borderColor: colors.foreground },
} as const;

// ============================================================================
// SHADOWS
// Minimal, subtle shadows
// ============================================================================
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {},
  glow: {},
  glowStrong: {},
} as const;

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

// Light theme (PRIMARY - white/off-white canvas)
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: colors.background,
    surface: colors.white,
    card: colors.white,
    text: colors.foreground,
    textSecondary: colors.mutedForeground,
    accent: colors.foreground,
    border: colors.border,
    success: colors.success,
    error: colors.error,
  },
};

// Dark theme (secondary)
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: colors.black,
    surface: '#141414',
    card: '#1A1A1A',
    text: colors.white,
    textSecondary: '#A3A3A3',
    accent: colors.white,
    border: '#333333',
    success: colors.success,
    error: colors.error,
  },
};

export const getTheme = (mode: ThemeMode, systemColorScheme: 'light' | 'dark'): Theme => {
  // Default to light theme (matches LinkCard website)
  if (mode === 'system') {
    return lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================
export const animations = {
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
  },
  spring: {
    gentle: { damping: 20, stiffness: 100 },
    snappy: { damping: 15, stiffness: 200 },
    bouncy: { damping: 10, stiffness: 300 },
  },
  entrance: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
} as const;

