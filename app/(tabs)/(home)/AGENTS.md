# (home)/
> L2 | 父级: /Users/henry/PARA/01-Projects/Vibe/linkcard/app/(tabs)/AGENTS.md

成员清单
`_layout.tsx`: Home stack 壳，提供大标题与原生导航行为。
`index.tsx`: 首页编排器，只管理版本选择、图片挑选、store action 连接。
`profile-header.tsx`: 导航头部，封装版本切换与快捷动作菜单。
`profile-card-editor.tsx`: 可编辑卡片主体，组合 banner、文案、标签、链接与列表区块。
`editable-text.tsx`: 行内文字编辑原语，统一 tap-edit-blur-save 流程。
`editable-tag-list.tsx`: 标签编辑器，处理长按进入编辑、重命名、删除、添加。
`editor.tsx`: 深度编辑页，承担设置式细项配置，不与首页轻编辑混写。
`versions.ios.tsx`: iOS route 壳，转发到 `src/screens/home/versions-screen.tsx`，避免平台解析自递归。
`versions.tsx`: 通用 route 壳，转发到 `src/screens/home/versions-screen.tsx`。

法则: `index.tsx` 不写大块视觉树；可复用交互原语独立成文件；tag 编辑必须连到持久化状态；route 文件保持薄壳，屏幕共享实现进入 `src/screens/`

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
