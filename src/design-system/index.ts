/**
 * [INPUT]: All design system modules
 * [OUTPUT]: Unified re-export of entire design system
 * [POS]: Root barrel — single import point for the design system
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

// Tokens
export * from './tokens';

// Theme
export * from './theme';

// Primitives
export * from './primitives';

// Patterns (components)
export * from './patterns';

// Bento
export * from './bento';
