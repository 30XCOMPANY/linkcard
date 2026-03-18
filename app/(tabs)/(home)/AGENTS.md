# (home)/
> L2 | 父级: /Users/nora/Desktop/linkcard/app/(tabs)/AGENTS.md

成员清单
`_layout.tsx`: Home stack 壳，提供大标题与原生导航行为。
`index.tsx`: 首页编排器，只管理版本选择、store action 连接与 header 挂载。
`editor.tsx`: 深度编辑页，承担设置式细项配置，不与首页轻编辑混写。
`versions.ios.tsx`: iOS route 壳，直接转发到 `src/screens/home/versions-native-screen.tsx`。
`versions.tsx`: 通用 route 壳，转发到 `src/screens/home/versions-screen.tsx`。
`social-links.ios.tsx`: iOS route 壳，直连 ExpoUI 社交链接列表。
`social-links.tsx`: 通用 route 壳，保留非 iOS 后备实现。
`social-link-picker.ios.tsx`: iOS route 壳，直连 ExpoUI 平台选择器。
`social-link-picker.tsx`: 通用 route 壳，保留非 iOS 后备实现。
`publication-detail.tsx`: 文章详情编辑页，当前仍是原生 SwiftUI 表单实现。
`social-link-detail.tsx`: 社交链接详情编辑页，当前仍是原生 SwiftUI 表单实现。

法则: `app/` 目录只留 route 文件；编辑零件进入 `src/screens/home/`；iOS route 确认原生主线后不再做能力探测；route 文件保持薄壳

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
