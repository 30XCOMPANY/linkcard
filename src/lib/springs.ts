/**
 * [INPUT]: none (pure constants)
 * [OUTPUT]: springs object with named spring parameter presets
 * [POS]: Core utility — single source of truth for all spring animation configs
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

export const springs = {
  // User-initiated: button press, chip tap (fast settle)
  snappy: { stiffness: 500, damping: 30 },
  // User-initiated: card drag, carousel flick (preserves velocity)
  gesture: { stiffness: 500, damping: 30 },
  // UI feedback: scale bounce on success (more bounce)
  bouncy: { stiffness: 600, damping: 15 },
  // Settle: list items, stagger (gentle ease-in)
  gentle: { stiffness: 300, damping: 25 },
} as const;
