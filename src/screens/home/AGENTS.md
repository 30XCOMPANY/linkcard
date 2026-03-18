# home/
> L2 | 父级: /Users/nora/Desktop/linkcard/src/screens/AGENTS.md

成员清单
`versions-screen.tsx`: 版本管理共享屏幕，负责默认版本选择、删除确认与顺序调整。
`versions-native-screen.tsx`: iOS 原生版本管理屏幕，依赖 ExpoUI Host 提供左滑删除与编辑重排。
`profile-header.tsx`: 首页导航头部，承载版本切换、编辑入口、账户快捷入口。
`profile-card-editor.tsx`: 卡片编辑主体，组合 banner、avatar、文案、标签、社交链接。
`editable-text.tsx`: 行内文字编辑原语，统一 tap-edit-blur-save 流程。
`editable-tag-list.tsx`: 标签编辑器，处理长按进入编辑、重命名、删除、添加。

法则: 这里放 route 共享实现与非 route 编辑零件，不直接声明 Expo Router 文件名；页面状态尽量从 store 读取，不复制第二真相源；iOS route 确认原生主线后不再做能力探测

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
