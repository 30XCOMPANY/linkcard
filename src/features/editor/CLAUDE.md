# features/editor/
> L2 | Parent: /CLAUDE.md

Extracted constants, types, and helpers from `app/editor.tsx`. The main screen component remains in the route file.

## Members

```
types.ts:      CanvasElement, FontOption interfaces
constants.ts:  AVAILABLE_FONTS, CARD_LAYOUTS, TEMPLATE_STYLES, getFontStack
helpers.ts:    getDefaultElements (canvas init), getComponentIcon (icon mapping)
index.ts:      Barrel re-export
```

The EditorScreen (~2500 lines), CanvasElementRenderer, ComponentsPanel, StylePanel, and StyleSheet remain in `app/editor.tsx` for route co-location.

[PROTOCOL]: Update this on any file add/remove/rename, then check /CLAUDE.md
