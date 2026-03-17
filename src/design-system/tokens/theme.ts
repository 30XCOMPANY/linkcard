/**
 * [INPUT]: @/src/types (Theme, ThemeMode), ./colors
 * [OUTPUT]: lightTheme, darkTheme, getTheme, animations
 * [POS]: Legacy compat — bridges old Theme interface to new semantic colors
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Theme, ThemeMode } from '@/src/types';
import { lightColors, darkColors, palette } from './colors';

/* ================================================================
 * LEGACY THEME OBJECTS — consumed by cardStore + old screens
 * Migrate consumers to useTheme() then remove.
 * ================================================================ */

export const lightTheme: Theme = {
    mode: 'light',
    colors: {
        background: lightColors.groupedBackground as string,
        surface:    lightColors.background as string,
        card:       lightColors.card as string,
        text:       lightColors.label as string,
        textSecondary: lightColors.secondaryLabel as string,
        accent:     palette.systemBlue.light,
        border:     lightColors.separator as string,
        success:    lightColors.success as string,
        error:      lightColors.destructive as string,
    },
};

export const darkTheme: Theme = {
    mode: 'dark',
    colors: {
        background: darkColors.background as string,
        surface:    darkColors.secondaryBackground as string,
        card:       darkColors.card as string,
        text:       darkColors.label as string,
        textSecondary: darkColors.secondaryLabel as string,
        accent:     palette.systemBlue.dark,
        border:     darkColors.separator as string,
        success:    darkColors.success as string,
        error:      darkColors.destructive as string,
    },
};

export function getTheme(mode: ThemeMode, _systemScheme: 'light' | 'dark' = 'light'): Theme {
    if (mode === 'system') return lightTheme;
    return mode === 'dark' ? darkTheme : lightTheme;
}

/* ================================================================
 * LEGACY ANIMATIONS — from old constants/theme
 * ================================================================ */

export const animations = {
    duration: { instant: 0, fast: 100, normal: 200, slow: 300 },
    spring: {
        gentle: { damping: 20, stiffness: 100 },
        snappy: { damping: 15, stiffness: 200 },
        bouncy: { damping: 10, stiffness: 300 },
    },
} as const;
