# (index,share)/
> L2 | Parent: app/(tabs)/CLAUDE.md

Shared Stack group — Card and Share tabs share push navigation (editor is reachable from both).

## Members

- `_layout.tsx`: Stack navigator — large titles, transparent header, blur effect, screen definitions for index/share/editor
- `index.tsx`: Home screen — card hero with native context menu (Link.Menu + Link.Preview), pull-to-refresh (RefreshControl), version chips, quick actions (Edit | Share | QR Code)
- `share.tsx`: Smart Share screen — field toggle chips, card preview, version selector, quick actions (copy/AirDrop/wallet), share button
- `editor.tsx`: Card editor — Apple Settings-style with SegmentedControl (version switch, name weight), Switch field toggles, Slider (accent intensity), RefreshControl, background disclosure row. Push target from home/share

[PROTOCOL]: Update this on any file add/remove/rename, then check app/(tabs)/CLAUDE.md
