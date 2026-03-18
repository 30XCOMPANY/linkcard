# discover/
> L2 | Parent: /Users/nora/Desktop/linkcard/src/screens/AGENTS.md

Shared and iOS-native Discover screen implementations.

## Members

```
discover-screen-base.tsx: Shared feed engine — swipe gestures, batch rotation, bookmark handling, toolbar
discover-screen.tsx:      Shared/non-iOS shell — AdaptiveGlass CTA bar over the shared engine
discover-native-screen.tsx: iOS-native shell — SwiftUI glass CTA bar over the shared engine
```

Principles: keep route files empty of business logic; keep swipe/feed state single-sourced; isolate platform UI differences to a thin shell.
