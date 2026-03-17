# (index,share)/
> L2 | Parent: app/(tabs)/CLAUDE.md

Shared Stack group — Card and Share tabs share push navigation (editor is reachable from both).

## Members

- `_layout.tsx`: Stack navigator — large titles, transparent header, blur effect, screen definitions for index/share/editor
- `index.tsx`: Home screen — editorial card hero (no entrance animation), middot-separated version selector, text action bar (Edit | Share | QR Code)
- `share.tsx`: Smart Share screen — field toggle chips, card preview, version selector, quick actions (copy/AirDrop/wallet), share button
- `editor.tsx`: Card editor — live card preview, visible field toggles (Switch), background picker row. Push target from home/share

[PROTOCOL]: Update this on any file add/remove/rename, then check app/(tabs)/CLAUDE.md
