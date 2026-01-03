/**
 * LinkCard Design System - Effects Tokens (V7 Labs Style)
 * 
 * Features:
 * - Warm mesh gradient (peach/blue/cream)
 * - Floating bar with 100px radius
 * - Glassmorphism with blur(8px)
 * - Dot grid pattern at 24px
 */

import { Platform } from 'react-native';
import { colors } from './colors';

// ============================================================================
// MESH GRADIENTS (V7's Signature Background)
// ============================================================================

export const gradients = {
    /** V7 hero mesh - warm peach/blue/cream blend */
    mesh: [colors.meshPeach, colors.meshBlue, colors.meshCream],

    /** Sunset gradient */
    sunset: ['#FF8A00', '#FF008A'],

    /** Blue to purple */
    ocean: ['#3B82F6', '#8B5CF6'],

    /** Cyan glow */
    glow: ['rgba(100, 180, 255, 0.3)', 'rgba(100, 180, 255, 0)'],

    /** Figma Light Glass - Blue to White */
    lightGlass: ['#DBEAFE', '#EFF6FF', '#F9FAFB', '#FFFFFF'],

    /** Warm Peachy */
    peach: ['#FED7AA', '#FEE2E2', '#FFFFFF'],

    /** Cool Mint */
    mint: ['#D1FAE5', '#E0F2FE', '#FFFFFF'],

    /** Purple Dream */
    purple: ['#E9D5FF', '#FAE8FF', '#FFFFFF'],

    /** Soft Pink */
    rose: ['#FECDD3', '#FEE2E2', '#FFFFFF'],

    /** Pure White - Clean and minimal */
    white: ['#FFFFFF', '#FFFFFF'],

    /** Pure Black - Elegant dark mode */
    black: ['#000000', '#1A1A1A'],
} as const;

// ============================================================================
// GLASSMORPHISM (V7 Floating Elements)
// ============================================================================

export const glass = {
    /** V7 floating bar style */
    floatingBar: {
        backgroundColor: colors.overlay,
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
        } : {}),
    },

    /** Light frosted card */
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        ...(Platform.OS === 'web' ? {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        } : {}),
    },
} as const;

// ============================================================================
// BACKGROUND PATTERNS
// ============================================================================

export const patterns = {
    /** V7 dot grid - 24px spacing with 1px dots */
    dotGrid: Platform.OS === 'web' ? {
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px',
    } : {},

    /** Larger version */
    dotGridLarge: Platform.OS === 'web' ? {
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.06) 1.5px, transparent 0)',
        backgroundSize: '32px 32px',
    } : {},
} as const;

// ============================================================================
// GLOW EFFECTS
// ============================================================================

export const glowEffects = {
    /** Top blue glow */
    topGlow: Platform.OS === 'web' ? {
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(100, 180, 255, 0.2) 0%, transparent 60%)',
    } : {},

    /** Bottom glow */
    bottomGlow: Platform.OS === 'web' ? {
        background: 'radial-gradient(ellipse 80% 40% at 50% 105%, rgba(100, 180, 255, 0.15) 0%, transparent 60%)',
    } : {},

    /** V7 mesh-style multi-color glow */
    meshGlow: Platform.OS === 'web' ? {
        background: `
      radial-gradient(ellipse 60% 40% at 20% 20%, rgba(247, 181, 157, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse 50% 35% at 80% 30%, rgba(209, 230, 255, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse 45% 30% at 50% 80%, rgba(255, 245, 230, 0.3) 0%, transparent 50%)
    `,
    } : {},
} as const;

export const effects = {
    gradients,
    glass,
    patterns,
    glowEffects,
} as const;
