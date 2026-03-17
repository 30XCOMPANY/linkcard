# home/
> L2 | 父级: /Users/henry/PARA/01-Projects/Vibe/linkcard/src/screens/AGENTS.md

成员清单
`versions-screen.tsx`: 版本管理共享屏幕，负责默认版本选择、删除确认与顺序调整。
`versions-native-screen.tsx`: iOS 原生版本管理屏幕，依赖 ExpoUI Host 提供左滑删除与编辑重排。

法则: 这里放 route 共享实现，不直接声明 Expo Router 文件名；页面状态尽量从 store 读取，不复制第二真相源；原生实现必须显式依赖能力检测，不能假设 ExpoUI 一定存在

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
