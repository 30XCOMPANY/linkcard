/**
 * [INPUT]: react-native ColorValue type
 * [OUTPUT]: lightColors, darkColors, palette, resolveColors(), colors (legacy compat), accentColors
 * [POS]: Token layer — Apple HIG semantic color system with light/dark
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { ColorValue } from 'react-native';

/* ================================================================
 * SYSTEM TINT PALETTE (Apple HIG exact values)
 * ================================================================ */

export const palette = {
    systemBlue:    { light: '#007AFF', dark: '#0A84FF' },
    systemGreen:   { light: '#34C759', dark: '#30D158' },
    systemIndigo:  { light: '#5856D6', dark: '#5E5CE6' },
    systemOrange:  { light: '#FF9500', dark: '#FF9F0A' },
    systemPink:    { light: '#FF2D55', dark: '#FF375F' },
    systemPurple:  { light: '#AF52DE', dark: '#BF5AF2' },
    systemRed:     { light: '#FF3B30', dark: '#FF453A' },
    systemTeal:    { light: '#5AC8FA', dark: '#64D2FF' },
    systemYellow:  { light: '#FFCC00', dark: '#FFD60A' },
    systemGray:    { light: '#8E8E93', dark: '#8E8E93' },
    systemGray2:   { light: '#AEAEB2', dark: '#636366' },
    systemGray3:   { light: '#C7C7CC', dark: '#48484A' },
    systemGray4:   { light: '#D1D1D6', dark: '#3A3A3C' },
    systemGray5:   { light: '#E5E5EA', dark: '#2C2C2E' },
    systemGray6:   { light: '#F2F2F7', dark: '#1C1C1E' },
} as const;

/* ================================================================
 * SEMANTIC COLOR INTERFACE
 * ================================================================ */

export interface SemanticColors {
    // Labels
    label: ColorValue;
    secondaryLabel: ColorValue;
    tertiaryLabel: ColorValue;
    quaternaryLabel: ColorValue;

    // Fills
    fill: ColorValue;
    secondaryFill: ColorValue;
    tertiaryFill: ColorValue;
    quaternaryFill: ColorValue;

    // Backgrounds (plain)
    background: ColorValue;
    secondaryBackground: ColorValue;
    tertiaryBackground: ColorValue;

    // Backgrounds (grouped — Settings style)
    groupedBackground: ColorValue;
    secondaryGroupedBackground: ColorValue;
    tertiaryGroupedBackground: ColorValue;

    // Separators
    separator: ColorValue;
    opaqueSeparator: ColorValue;

    // System tints
    tint: ColorValue;
    systemBlue: ColorValue;
    systemGreen: ColorValue;
    systemRed: ColorValue;
    systemOrange: ColorValue;
    systemYellow: ColorValue;
    systemGray: ColorValue;

    // Glass materials
    ultraThinMaterial: ColorValue;
    thinMaterial: ColorValue;
    regularMaterial: ColorValue;
    thickMaterial: ColorValue;

    // Card
    card: ColorValue;
    cardBorder: ColorValue;

    // Functional
    destructive: ColorValue;
    success: ColorValue;
    warning: ColorValue;
}

/* ================================================================
 * LIGHT THEME
 * ================================================================ */

export const lightColors: SemanticColors = {
    label:            '#000000',
    secondaryLabel:   'rgba(60, 60, 67, 0.6)',
    tertiaryLabel:    'rgba(60, 60, 67, 0.3)',
    quaternaryLabel:  'rgba(60, 60, 67, 0.18)',

    fill:             'rgba(120, 120, 128, 0.2)',
    secondaryFill:    'rgba(120, 120, 128, 0.16)',
    tertiaryFill:     'rgba(120, 120, 128, 0.12)',
    quaternaryFill:   'rgba(120, 120, 128, 0.08)',

    background:            '#FFFFFF',
    secondaryBackground:   '#F2F2F7',
    tertiaryBackground:    '#FFFFFF',

    groupedBackground:            '#F2F2F7',
    secondaryGroupedBackground:   '#FFFFFF',
    tertiaryGroupedBackground:    '#F2F2F7',

    separator:       'rgba(60, 60, 67, 0.29)',
    opaqueSeparator: '#C6C6C8',

    tint:         palette.systemBlue.light,
    systemBlue:   palette.systemBlue.light,
    systemGreen:  palette.systemGreen.light,
    systemRed:    palette.systemRed.light,
    systemOrange: palette.systemOrange.light,
    systemYellow: palette.systemYellow.light,
    systemGray:   palette.systemGray.light,

    ultraThinMaterial: 'rgba(255, 255, 255, 0.44)',
    thinMaterial:      'rgba(255, 255, 255, 0.6)',
    regularMaterial:   'rgba(255, 255, 255, 0.72)',
    thickMaterial:     'rgba(255, 255, 255, 0.85)',

    card:       '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.06)',

    destructive: palette.systemRed.light,
    success:     palette.systemGreen.light,
    warning:     palette.systemOrange.light,
};

/* ================================================================
 * DARK THEME
 * ================================================================ */

export const darkColors: SemanticColors = {
    label:            '#FFFFFF',
    secondaryLabel:   'rgba(235, 235, 245, 0.6)',
    tertiaryLabel:    'rgba(235, 235, 245, 0.3)',
    quaternaryLabel:  'rgba(235, 235, 245, 0.18)',

    fill:             'rgba(120, 120, 128, 0.36)',
    secondaryFill:    'rgba(120, 120, 128, 0.32)',
    tertiaryFill:     'rgba(120, 120, 128, 0.24)',
    quaternaryFill:   'rgba(120, 120, 128, 0.18)',

    background:            '#000000',
    secondaryBackground:   '#1C1C1E',
    tertiaryBackground:    '#2C2C2E',

    groupedBackground:            '#000000',
    secondaryGroupedBackground:   '#1C1C1E',
    tertiaryGroupedBackground:    '#2C2C2E',

    separator:       'rgba(84, 84, 88, 0.6)',
    opaqueSeparator: '#38383A',

    tint:         palette.systemBlue.dark,
    systemBlue:   palette.systemBlue.dark,
    systemGreen:  palette.systemGreen.dark,
    systemRed:    palette.systemRed.dark,
    systemOrange: palette.systemOrange.dark,
    systemYellow: palette.systemYellow.dark,
    systemGray:   palette.systemGray.dark,

    ultraThinMaterial: 'rgba(30, 30, 30, 0.44)',
    thinMaterial:      'rgba(30, 30, 30, 0.6)',
    regularMaterial:   'rgba(30, 30, 30, 0.72)',
    thickMaterial:     'rgba(30, 30, 30, 0.85)',

    card:       '#1C1C1E',
    cardBorder: 'rgba(255, 255, 255, 0.08)',

    destructive: palette.systemRed.dark,
    success:     palette.systemGreen.dark,
    warning:     palette.systemOrange.dark,
};

/* ================================================================
 * RESOLVER
 * ================================================================ */

export function resolveColors(scheme: 'light' | 'dark'): SemanticColors {
    return scheme === 'dark' ? darkColors : lightColors;
}

/* ================================================================
 * LEGACY COMPAT — static light-mode aliases
 * Maps old token names to new semantic equivalents.
 * Consumers should migrate to useTheme() → colors.
 * ================================================================ */

export const colors = {
    text:            lightColors.label as string,
    foreground:      lightColors.label as string,
    textMuted:       lightColors.secondaryLabel as string,
    placeholder:     lightColors.tertiaryLabel as string,

    white:    '#FFFFFF',
    black:    '#000000',
    dark:     '#1C1C1C',
    card:     lightColors.secondaryBackground as string,
    cardAlt:  lightColors.groupedBackground as string,
    input:    lightColors.secondaryBackground as string,
    border:   lightColors.separator as string,
    overlay:  'rgba(0, 0, 0, 0.5)',

    background:      lightColors.groupedBackground as string,
    muted:           lightColors.secondaryBackground as string,
    mutedForeground: lightColors.secondaryLabel as string,
    borderLight:     lightColors.quaternaryFill as string,

    blue:    palette.systemBlue.light,
    glow:    palette.systemTeal.light,
    info:    palette.systemBlue.light,
    success: palette.systemGreen.light,
    error:   palette.systemRed.light,
    warning: palette.systemOrange.light,

    meshPeach:  '#F7B59D',
    meshBlue:   '#D1E6FF',
    meshCream:  '#FFF5E6',
} as const;

export type ColorToken = keyof typeof colors;

/* ================================================================
 * ACCENT COLORS — legacy mapping for gradient/version picker
 * ================================================================ */

export const accentColors = {
    white:   '#FFFFFF',
    black:   '#1A1A1A',
    indigo:  palette.systemIndigo.light,
    violet:  palette.systemPurple.light,
    fuchsia: palette.systemPink.light,
    pink:    palette.systemPink.light,
    rose:    '#FF2D55',
    orange:  palette.systemOrange.light,
    amber:   palette.systemYellow.light,
    emerald: palette.systemGreen.light,
    teal:    palette.systemTeal.light,
    cyan:    palette.systemTeal.light,
    blue:    palette.systemBlue.light,
    slate:   palette.systemGray.light,
} as const;

export type AccentColorKey = keyof typeof accentColors;
