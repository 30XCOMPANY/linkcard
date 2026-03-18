# lib/
> L2 | 父级: /Users/nora/Desktop/linkcard/src/AGENTS.md

成员清单
`accent-colors.ts`: 版本强调色常量，供编辑器与卡片装饰复用。
`card-presets.ts`: 卡片背景预设、默认版本工厂、旧数据归一化入口。
`cn.ts`: className 合并工具，隔离 Tailwind 字符串拼接噪音。
`haptics.ts`: 触感反馈边界，统一轻触/成功等手势回声。
`icons.tsx`: 跨平台图标适配层，封装 SF Symbols 与 Ionicons 差异。
`name-fonts.ts`: 名称排版字族映射，控制卡片标题气质。
`onboarding-profile.ts`: onboarding 资料穿梭器，在 legacy LinkedIn 导入页与预览页间传递完整资料对象。
`profile-tags.ts`: 从资料推导标签并解析用户自定义标签输入。
`springs.ts`: 命名动画弹簧参数，避免随手硬编码物理值。

法则: `lib/` 只放纯工具、常量、归一化逻辑；状态写入留在 `stores/`，副作用留在 `services/`

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
