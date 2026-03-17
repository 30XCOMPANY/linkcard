# design-system/
> L2 | Parent: /CLAUDE.md

Unified design token layer + component primitives. **Single source of truth** for all visual styling.

## Members

```
tokens/
  colors.ts:      Apple HIG semantic colors (light/dark), palette, accent colors, legacy compat aliases
  typography.ts:   System-native fonts (SF Pro/Roboto/system-ui), Apple type scale, fontSize/fontWeight/lineHeight
  spacing.ts:      8pt grid spacing system (2xs–8xl + section)
  radii.ts:        Continuous corner radii (xs–full, pill, nav)
  shadows.ts:      Shadow tokens (none–xl)
  effects.ts:      Gradients, glassmorphism, dot patterns, glow effects
  animation.ts:    Spring configs, duration, easing curves
  theme.ts:        getTheme(), lightTheme, darkTheme (wraps types/Theme)
  index.ts:        Barrel re-export

primitives/
  Box.tsx:         Styled View with spacing/color props
  Text.tsx:        Typography component with variant system
  VStack.tsx:      Vertical stack layout
  HStack.tsx:      Horizontal stack layout

patterns/
  Button.tsx:      V7 Labs pill button (160px radius, 12px text)
  Input.tsx:       Apple-style input with focus animation
  GlassCard.tsx:   Frosted glass card container
  GlassButton.tsx: Glass-styled button

layouts/
  GlassScreenLayout.tsx: Full-screen glass layout with header

theme/
  ThemeProvider.tsx: React context provider resolving light/dark
  index.ts:         Barrel

bento/
  BentoGrid components (legacy)
```

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
