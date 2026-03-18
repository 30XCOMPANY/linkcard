# (tabs)/
> L2 | 父级: /Users/nora/Desktop/linkcard/app/AGENTS.md

成员清单
`_layout.tsx`: 原生标签导航壳，使用 SF Symbols 定义 tab 图标、顺序与平台行为。
`_layout.web.tsx`: Web 回退标签壳，补齐浏览器端导航差异。
`(home)/`: 首页卡片工作台，资料预览、版本切换、轻量编辑入口。
`(discover)/`: Discover 工作台，刷卡式浏览与收藏联系人。
`(events)/`: Events 工作台，活动列表与时间维度浏览。
`(settings)/`: 设置工作台，账户、主题、偏好与系统级开关。

法则: 每个 tab 只保留自己的 stack；NativeTabs 优先使用 SF Symbols；跨 tab 共享规则不在页面里重复发明

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
