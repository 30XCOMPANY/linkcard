/**
 * [INPUT]: react-native Platform, ./colors
 * [OUTPUT]: gradients, glass, glowEffects, effects
 * [POS]: Token layer — gradients, glass materials, and visual effects
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Platform } from 'react-native';
import { colors } from './colors';

/* ================================================================
 * GRADIENT PRESETS — background picker options
 * ================================================================ */

export const gradients = {
    /** Default light — soft neutral */
    lightGlass: ['#DBEAFE', '#EFF6FF', '#F9FAFB', '#FFFFFF'],

    /** Fresh blue — tech/innovation */
    freshBlue: ['#BFDBFE', '#DBEAFE', '#EFF6FF', '#FFFFFF'],

    /** V7 classic — warm peach/blue/cream */
    v7Classic: [colors.meshPeach, colors.meshBlue, colors.meshCream],

    /** Warm peach */
    peach: ['#FED7AA', '#FEE2E2', '#FFFFFF'],

    /** Cool mint */
    mint: ['#D1FAE5', '#E0F2FE', '#FFFFFF'],

    /** Purple dream */
    purple: ['#E9D5FF', '#FAE8FF', '#FFFFFF'],

    /** Soft rose */
    rose: ['#FECDD3', '#FEE2E2', '#FFFFFF'],

    /** Sunset */
    sunset: ['#FF8A00', '#FF008A'],

    /** Ocean depth */
    ocean: ['#3B82F6', '#8B5CF6'],

    /** Pure white */
    white: ['#FFFFFF', '#FFFFFF'],

    /** Pure black */
    black: ['#000000', '#1A1A1A'],

    /** Midnight */
    midnight: ['#0F172A', '#1E293B'],
} as const;

/* ================================================================
 * GLASS MATERIALS — Liquid Glass / Blur effects
 * ================================================================ */

export const glass = {
    /** Ultra-thin — subtle background awareness */
    ultraThin: {
        backgroundColor: 'rgba(255, 255, 255, 0.44)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        } : {}),
    },
    /** Thin — readable with background hint */
    thin: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } : {}),
    },
    /** Regular — standard card material */
    regular: {
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        } : {}),
    },
    /** Thick — opaque with subtle transparency */
    thick: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        } : {}),
    },
    /** Dark floating bar */
    floatingBar: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        } : {}),
    },
} as const;

/* ================================================================
 * BLUR INTENSITY — for expo-blur BlurView
 * ================================================================ */

export const blurIntensity = {
    ultraThin: 15,
    thin:      25,
    regular:   40,
    thick:     60,
    prominent: 80,
} as const;

/* ================================================================
 * GLOW EFFECTS — web-only radial gradients
 * ================================================================ */

export const glowEffects = {
    topGlow: Platform.OS === 'web' ? {
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(100, 180, 255, 0.15) 0%, transparent 60%)',
    } : {},
    bottomGlow: Platform.OS === 'web' ? {
        background: 'radial-gradient(ellipse 80% 40% at 50% 105%, rgba(100, 180, 255, 0.1) 0%, transparent 60%)',
    } : {},
} as const;

/* ================================================================
 * DOT PATTERNS — web-only backgrounds
 * ================================================================ */

export const patterns = {
    dotGrid: Platform.OS === 'web' ? {
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 0)',
        backgroundSize: '24px 24px',
    } : {},
} as const;

export const effects = { gradients, glass, blurIntensity, glowEffects, patterns } as const;
