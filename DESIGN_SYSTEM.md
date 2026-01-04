# LinkCard 设计系统文档

## 📐 设计系统架构

LinkCard 采用统一的玻璃态设计语言（Glassmorphism），确保整个产品的视觉一致性。

### 核心设计原则

1. **玻璃态美学** - 毛玻璃效果贯穿始终
2. **渐变背景** - 柔和的蓝白渐变营造高级感
3. **一致的间距** - 使用 token 系统确保视觉节奏
4. **清晰的层次** - 通过阴影和透明度建立信息层级
5. **流畅的动画** - 提升交互体验的愉悦感

---

## 🎨 设计 Tokens

### Colors (`src/design-system/tokens/colors.ts`)
```typescript
{
  white: '#FFFFFF',
  black: '#000000',
  dark: '#1a1a1a',
  text: '#333333',
  textMuted: '#666666',
  error: '#EF4444',
  // ...
}
```

### Spacing (`src/design-system/tokens/spacing.ts`)
```typescript
{
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  // ...
}
```

### Shadows (`src/design-system/tokens/shadows.ts`)
```typescript
{
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, ... },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, ... },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, ... }
}
```

### Gradients (`src/design-system/tokens/effects.ts`)
```typescript
{
  lightGlass: ['#E0F2FE', '#FFFFFF', '#F0F9FF', '#E0F2FE'],
  ocean: ['#0F172A', '#1E293B', '#334155'],
  purple: ['#4C1D95', '#5B21B6', '#6D28D9'],
  // ... 更多渐变选项
}
```

---

## 🧩 基础组件 (Primitives)

### Box
通用容器组件，支持所有基础样式属性。

```tsx
<Box flex={1} px="lg" py="md" borderRadius="xl">
  {/* 内容 */}
</Box>
```

### Text
统一的文本组件，支持预设的 variant。

```tsx
<Text variant="h1" weight="bold" color="text">
  标题文本
</Text>
```

**可用 variants:**
- `h1`, `h2`, `h3` - 标题
- `body` - 正文
- `caption` - 说明文字
- `label` - 标签
- `button` - 按钮文字

### VStack / HStack
垂直和水平布局组件。

```tsx
<VStack gap="md" align="center">
  <Text>项目 1</Text>
  <Text>项目 2</Text>
</VStack>
```

---

## 🎭 模式组件 (Patterns)

### GlassCard
玻璃态卡片容器，核心UI组件。

```tsx
<GlassCard padding="lg" borderRadius="xl">
  {/* 卡片内容 */}
</GlassCard>
```

**Props:**
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `borderRadius`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'pill'

### GlassButton
玻璃态按钮组件。

```tsx
<GlassButton onPress={handlePress} variant="primary">
  <Text variant="button">点击我</Text>
</GlassButton>
```

### GlassToggle ✨ 新组件
现代化、精致的开关组件。

```tsx
<GlassToggle value={enabled} onValueChange={setEnabled} />
```

**特点:**
- 流畅的弹性动画
- 细腻的尺寸 (44x26px)
- 支持深色/浅色背景
- 触觉反馈 (移动端)

---

## 📱 布局组件 (Layouts)

### GlassScreenLayout ⭐ 新组件
统一的页面布局模板，确保所有页面设计一致。

```tsx
<GlassScreenLayout 
  title="页面标题"
  showBackButton={true}
  rightElement={<CustomButton />}
>
  {/* 页面内容 */}
</GlassScreenLayout>
```

**功能:**
- 自动应用渐变背景（从 cardStore 同步）
- 标准 header 布局
- 可选的返回按钮
- 可选的右侧元素（如添加按钮）
- 可滚动 / 固定内容区域
- 动态文本颜色（根据背景自动调整）

**Props:**
- `title`: string - 页面标题
- `showBackButton?`: boolean - 显示返回按钮
- `backIcon?`: string - 返回按钮图标名称
- `onBack?`: () => void - 自定义返回逻辑
- `rightElement?`: ReactNode - 右侧元素
- `scrollable?`: boolean - 内容是否可滚动

---

## 🔄 状态管理

### cardStore
全局状态存储，管理卡片数据和UI设置。

```typescript
const { 
  card,                    // 卡片数据
  currentGradient,         // 当前背景渐变 ⭐
  setCurrentGradient,      // 设置背景渐变 ⭐
  accentColor,            // 强调色
  setAccentColor,         // 设置强调色
} = useCardStore();
```

**新增状态:**
- `currentGradient`: string - 全局背景渐变，所有页面共享
- `setCurrentGradient`: (gradient: string) => void - 更新背景渐变

---

## 📄 页面实现示例

### 使用新设计系统的页面

```tsx
import { GlassScreenLayout } from '@/src/design-system/layouts';
import { GlassCard, GlassToggle } from '@/src/design-system/patterns';
import { VStack, HStack, Text } from '@/src/design-system/primitives';

export default function MyScreen() {
  const [enabled, setEnabled] = useState(false);
  
  return (
    <GlassScreenLayout title="我的页面">
      <VStack gap="md">
        <GlassCard padding="lg" borderRadius="xl">
          <HStack align="center" style={{ justifyContent: 'space-between' }}>
            <Text variant="body">启用功能</Text>
            <GlassToggle value={enabled} onValueChange={setEnabled} />
          </HStack>
        </GlassCard>
      </VStack>
    </GlassScreenLayout>
  );
}
```

---

## ✅ 已统一的页面

1. ✅ **glass-home.tsx** - 主页
2. ✅ **settings.tsx** - 设置页
3. ✅ **share.tsx** - 分享页
4. ✅ **versions.tsx** - 版本管理页

所有这些页面现在都：
- 使用 `GlassScreenLayout` 布局
- 共享相同的背景渐变（通过 `currentGradient` 同步）
- 使用统一的设计系统组件
- 拥有一致的动画和交互

---

## 🎯 使用指南

### 创建新页面的步骤

1. **导入布局组件**
   ```tsx
   import { GlassScreenLayout } from '@/src/design-system/layouts';
   ```

2. **使用布局包裹内容**
   ```tsx
   <GlassScreenLayout title="页面标题">
     {/* 你的内容 */}
   </GlassScreenLayout>
   ```

3. **使用设计系统组件**
   ```tsx
   import { GlassCard } from '@/src/design-system/patterns';
   import { VStack, Text } from '@/src/design-system/primitives';
   ```

4. **遵循间距规范**
   ```tsx
   <VStack gap="md">  // 使用 token 而不是硬编码数值
     <GlassCard padding="lg">
       {/* 内容 */}
     </GlassCard>
   </VStack>
   ```

5. **使用动画增强体验**
   ```tsx
   <Animated.View entering={FadeInUp.delay(200).springify()}>
     {/* 内容 */}
   </Animated.View>
   ```

---

## 🔧 自定义和扩展

### 添加新的渐变背景

在 `src/design-system/tokens/effects.ts` 中添加：

```typescript
export const gradients = {
  // 现有渐变...
  myGradient: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
};
```

然后在任何页面使用：

```typescript
const { setCurrentGradient } = useCardStore();
setCurrentGradient('myGradient');
```

### 创建新的模式组件

1. 在 `src/design-system/patterns/` 创建组件文件
2. 遵循现有组件的结构和命名约定
3. 在 `patterns/index.ts` 中导出
4. 使用 design tokens 而不是硬编码值

---

## 📱 响应式设计

所有组件都支持移动端和 Web 端：

- **触觉反馈** - 移动端自动提供 haptic feedback
- **自适应布局** - 使用 flex 布局自动适应屏幕
- **动态文本颜色** - 根据背景自动调整对比度

---

## 🚀 性能优化

- **使用 useMemo** - 缓存计算结果
- **使用 useCallback** - 缓存回调函数
- **Reanimated** - 使用原生驱动的动画
- **延迟加载** - 使用 entering/exiting 动画渐进式渲染

---

## 📝 维护指南

1. **保持一致性** - 所有新功能都应使用设计系统组件
2. **文档更新** - 添加新组件时更新此文档
3. **版本控制** - 重要更改时更新版本号
4. **测试覆盖** - 确保组件在 iOS、Android 和 Web 上都能正常工作

---

## 🎨 设计原则总结

| 原则 | 实现 |
|-----|-----|
| **一致性** | 统一的设计语言和组件库 |
| **优雅性** | 玻璃态效果和流畅动画 |
| **可访问性** | 动态对比度和清晰的层次 |
| **可维护性** | Token 系统和组件化架构 |
| **可扩展性** | 模块化设计，易于添加新功能 |

---

最后更新: 2026-01-03
版本: 1.0.0
