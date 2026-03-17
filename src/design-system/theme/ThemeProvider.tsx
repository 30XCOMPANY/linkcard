/**
 * [INPUT]: react-native useColorScheme, ./tokens/colors, ../stores/cardStore
 * [OUTPUT]: ThemeProvider, useTheme()
 * [POS]: Theme layer — resolves semantic colors by light/dark scheme
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
    lightColors,
    darkColors,
    type SemanticColors,
} from '../tokens/colors';

/* ================================================================
 * THEME CONTEXT
 * ================================================================ */

export interface ThemeValue {
    colors: SemanticColors;
    scheme: 'light' | 'dark';
    isDark: boolean;
}

const ThemeContext = createContext<ThemeValue>({
    colors: lightColors,
    scheme: 'light',
    isDark: false,
});

/* ================================================================
 * PROVIDER
 * Wraps app root. Resolves system color scheme OR manual override.
 * ================================================================ */

interface ThemeProviderProps {
    children: React.ReactNode;
    /** Force a specific scheme. If omitted, follows system. */
    forceScheme?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    forceScheme,
}) => {
    const rawScheme = useColorScheme();
    const systemScheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
    const scheme = forceScheme ?? systemScheme;

    const value = useMemo<ThemeValue>(() => ({
        colors: scheme === 'dark' ? darkColors : lightColors,
        scheme,
        isDark: scheme === 'dark',
    }), [scheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/* ================================================================
 * HOOK
 * ================================================================ */

export function useTheme(): ThemeValue {
    return useContext(ThemeContext);
}
