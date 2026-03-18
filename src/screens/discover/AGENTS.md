# discover/
> L2 | 父级: /Users/nora/Desktop/linkcard/src/screens/AGENTS.md

成员清单
`discover-screen-base.tsx`: Discover 共享核心，持有 swipe/feed/store 状态与卡片骨架。
`discover-screen.tsx`: 非 iOS Discover 壳，使用 AdaptiveGlass CTA 复用共享核心。
`discover-native-screen.tsx`: iOS Discover 壳，使用 ExpoUI SwiftButton 复用共享核心。

法则: route 文件只做转发；共享状态只存在一份；平台差异只留在 action bar 这一层

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
