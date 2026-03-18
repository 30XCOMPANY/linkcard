# app/
> L2 | 父级: /Users/henry/PARA/01-Projects/Vibe/linkcard/AGENTS.md

成员清单
`_layout.tsx`: 根路由壳，挂接全局导航与平台级入口。
`index.tsx`: 入口重定向或首屏选择，决定用户首先落在哪条流程。
`onboarding/`: 新用户引导与资料采集流，负责通过单一路径从空状态生成第一张卡。
`(tabs)/`: 主应用标签导航，承载 home/share/settings 三条稳定工作流。

法则: 路由即模块边界；页面只编排状态与导航；共享 UI 下沉到 `src/`

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
