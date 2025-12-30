/**
 * LinkCard Design System - Color Tokens (V7 Labs Style)
 * 
 * Extracted from v7labs.com production CSS:
 * - High contrast Off-Black (#292929) for text
 * - Warm White cards (#F7F6F5)
 * - Multi-color mesh gradient backgrounds
 */

export const colors = {
    // ============================================================================
    // TEXT COLORS (from V7 Labs computed styles)
    // ============================================================================

    /** Primary text - Off-black (NOT pure black!) */
    text: '#292929',

    /** Secondary/muted text - with alpha */
    textMuted: 'rgba(3, 3, 2, 0.59)',

    /** Placeholder text */
    placeholder: 'rgba(0, 0, 0, 0.4)',

    // ============================================================================
    // SURFACE COLORS
    // ============================================================================

    /** Pure white - Primary sections */
    white: '#FFFFFF',

    /** Warm off-white - Bento cards (SIGNATURE V7 COLOR) */
    card: '#F7F6F5',

    /** Slightly warmer variation */
    cardAlt: '#F5F4F2',

    /** Input backgrounds */
    input: '#FAFAFA',

    /** Border color */
    border: 'rgba(0, 0, 0, 0.1)',

    // ============================================================================
    // DARK COLORS (Buttons & Overlays)
    // ============================================================================

    /** Primary button background */
    dark: '#1C1C1C',

    /** Floating bar overlay */
    overlay: 'rgba(0, 0, 0, 0.9)',

    // ============================================================================
    // MESH GRADIENT COLORS
    // ============================================================================

    /** Warm peach - mesh gradient */
    meshPeach: '#F7B59D',

    /** Light blue - mesh gradient */
    meshBlue: '#D1E6FF',

    /** Warm cream - mesh gradient */
    meshCream: '#FFF5E6',

    /** Brand blue - links/accents */
    blue: '#2663EB',

    /** Cyan glow */
    glow: '#64B4FF',

    // ============================================================================
    // SEMANTIC
    // ============================================================================

    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
} as const;

export type ColorToken = keyof typeof colors;
