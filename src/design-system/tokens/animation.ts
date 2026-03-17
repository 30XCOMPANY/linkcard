/**
 * [INPUT]: None (leaf module)
 * [OUTPUT]: springs, duration, easing
 * [POS]: Token layer — Apple-style animation curves and timing
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

/* ================================================================
 * SPRING CONFIGS — for react-native-reanimated withSpring()
 * ================================================================ */

export const springs = {
    /** Quick, responsive — button taps, toggles */
    snappy:  { damping: 20, stiffness: 300 },
    /** Natural — page transitions, card animations */
    gentle:  { damping: 25, stiffness: 200 },
    /** Playful — entrance animations, modals */
    bouncy:  { damping: 12, stiffness: 200 },
    /** Precise — layout shifts, subtle repositions */
    precise: { damping: 28, stiffness: 350 },
} as const;

/* ================================================================
 * DURATION — for withTiming()
 * ================================================================ */

export const duration = {
    /** 100ms — micro-interactions */
    instant: 100,
    /** 150ms — state changes (hover, press) */
    fast: 150,
    /** 250ms — standard transitions */
    normal: 250,
    /** 350ms — complex transitions */
    slow: 350,
    /** 500ms — dramatic entrances */
    dramatic: 500,
} as const;

/* ================================================================
 * EASING — standard Apple curves
 * ================================================================ */

export const easing = {
    /** Standard Apple ease-in-out */
    default: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
    /** Entrance — ease-out */
    enter:   { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    /** Exit — ease-in */
    exit:    { x1: 0.42, y1: 0, x2: 1, y2: 1 },
} as const;

export const animation = { springs, duration, easing } as const;
