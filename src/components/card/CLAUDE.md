# card/
> L2 | Parent: src/components/CLAUDE.md

Pure presentational card rendering — Tailwind-styled business card display with field-level typography control. No store access; receives all data via props.

## Members

- `card-field.tsx`: Single field renderer — maps field name to Tailwind class, applies FieldStyle overrides as inline style
- `card-display.tsx`: Complete card renderer — composes Avatar, QRCode, CardField into a rounded card layout with QR overlay support

[PROTOCOL]: Update this header on change, then check CLAUDE.md
