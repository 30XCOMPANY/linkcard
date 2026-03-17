# css/
> L2 | Parent: /CLAUDE.md

Tailwind CSS v4 foundation layer for the design system.

## Members

- `global.css`: Entry point — imports Tailwind layers, sf.css, glass.css; sets platform font stacks via `@media ios` / `@media android`
- `sf.css`: Apple HIG semantic color tokens as CSS custom properties; `light-dark()` fallbacks with iOS `platformColor()` overrides; Tailwind `@theme` bridge mapping `--sf-*` to `--color-sf-*`
- `glass.css`: Glass morphism utility classes (`.glass-regular`, `.glass-thin`, `.glass-ultra-thin`) with dark mode variants

[PROTOCOL]: Update this file on member changes, then check /CLAUDE.md
