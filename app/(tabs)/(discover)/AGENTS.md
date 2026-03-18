# (discover)/
> L2 | 父级: /Users/nora/Desktop/linkcard/app/(tabs)/AGENTS.md

成员清单
`_layout.tsx`: Discover stack 壳，负责大标题与推入式路由承载。
`index.tsx`: 通用 discover route 壳，只转发到 `src/screens/discover/discover-screen.tsx`。
`index.ios.tsx`: iOS discover route 壳，只转发到 `src/screens/discover/discover-native-screen.tsx`。
`collection.tsx`: 收藏联系人列表页，从 header 入口进入。

法则: route 文件保持薄壳；Discover 的 swipe/feed 逻辑不留在 `app/`；平台差异只存在于 `src/screens/discover`

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
