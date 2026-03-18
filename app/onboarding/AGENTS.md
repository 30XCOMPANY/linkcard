# onboarding/
> L2 | 父级: /Users/nora/Desktop/linkcard/app/AGENTS.md

成员清单
`_layout.tsx`: onboarding stack 壳，负责 headerless 单流导航。
`index.tsx`: 当前 onboarding 主入口，四页水平引导与资料接入 CTA。
`linkedin.tsx`: legacy LinkedIn URL 输入页，调用服务抓取资料并写入 onboarding bridge。
`preview.tsx`: legacy 资料预览页，确认后创建第一张卡。

法则: onboarding route 只编排流程；跨页大对象通过 `src/lib/onboarding-profile.ts` 传递，不在 `app/` 里藏共享模块

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
