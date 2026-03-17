/**
 * [INPUT]: None (leaf module)
 * [OUTPUT]: shadows
 * [POS]: Token layer — Apple-style minimal elevation shadows
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    /** Subtle card lift */
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    /** Standard card */
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    /** Floating elements */
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    /** Modals, sheets */
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
} as const;

export type ShadowToken = keyof typeof shadows;
