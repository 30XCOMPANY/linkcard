# shared/
> L2 | Parent: src/components/CLAUDE.md

Shared UI primitives consumed across screens and card renderers. Keep these small, stateless, and visually predictable.

## Members

- `CLAUDE.md`: This local member map for shared primitives
- `adaptive-glass.tsx`: AdaptiveGlass — runtime-guarded glass rendering (Liquid Glass iOS 26+, BlurView fallback, CSS backdrop-filter web, opaque Android)
- `avatar.tsx`: Avatar — LinkedIn photo or deterministic illustration fallback, optional Liquid Glass shell with inset padding
- `glass-button.tsx`: GlassButton + SecondaryButton — primary glass CTA (dark/blue/white variants) and secondary text button
- `qr-code.tsx`: QRCode — minimal wrapper around react-native-qrcode-svg with Tailwind container

[PROTOCOL]: Update this header on change, then check CLAUDE.md
