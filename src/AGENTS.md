# src/
> L2 | 父级: /Users/henry/PARA/01-Projects/Vibe/linkcard/app/AGENTS.md

成员清单
`design-system/`: 设置页与共享界面原语，负责平台一致的视觉骨架。
`components/`: 纯展示组件，承担卡片、头像、二维码等可复用视图。
`stores/`: Zustand 持久化状态与业务写操作，保持单一真相源。
`services/`: Supabase、分享、钱包、通知、离线同步等副作用边界。
`lib/`: 图标、触感、配色、排版、卡片背景预设等轻量工具与常量。
`types/`: 领域类型定义，约束卡片、资料与共享数据结构。
`tw/`: react-native-css 包装层，统一 View/Text 等基础节点入口。
`screens/`: 从路由中抽离的屏幕级共享实现，供 platform route 壳复用。

法则: `src/` 只放可复用实现，不放 route；屏幕级共享逻辑进入 `screens/`，避免平台文件互相解析递归

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
