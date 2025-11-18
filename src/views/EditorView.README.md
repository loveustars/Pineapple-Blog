# Editor Module

简约风格的 Markdown 编辑器，设计注重可扩展性。

## 功能特性

### 核心功能
- ✅ 文件读取和保存
- ✅ 自动保存（3秒无操作后）
- ✅ Ctrl/Cmd + S 快捷键保存
- ✅ 未保存状态提示
- ✅ 实时统计（行数、字数、字符数、阅读时间）
- ✅ 离开前确认（未保存时）

### 可扩展设计

#### 1. 组件化设计
```
EditorView (主视图)
  ├── EditorToolbar (工具栏组件)
  ├── Editor Core (编辑器核心 - 可替换)
  └── EditorStatusBar (状态栏组件)
```

**优势**：
- 各组件独立，便于测试和维护
- 工具栏和状态栏可在其他视图复用
- 编辑器核心可轻松替换（textarea → Monaco → CodeMirror）

#### 2. Composables 抽象
- `useEditor.ts` - 编辑器状态管理
- `useMarkdownStats.ts` - Markdown 统计

**扩展示例**：
```typescript
// 未来可以添加更多 composables
import { useMarkdownPreview } from '@/composables/useMarkdownPreview'
import { useMarkdownShortcuts } from '@/composables/useMarkdownShortcuts'
import { useFrontMatter } from '@/composables/useFrontMatter'
```

#### 3. 插槽设计
工具栏和状态栏都支持插槽扩展：

```vue
<EditorToolbar>
  <template #actions>
    <!-- 自定义操作按钮 -->
    <button @click="preview">预览</button>
    <button @click="publish">发布</button>
  </template>
</EditorToolbar>

<EditorStatusBar>
  <template #right>
    <!-- 自定义右侧信息 -->
    <span>Git: main</span>
  </template>
</EditorStatusBar>
```

## 未来扩展方向

### 1. 高级编辑器（可选）
```typescript
// 可以轻松替换为 Monaco Editor
import MonacoEditor from '@/components/MonacoEditor.vue'

// 或 CodeMirror
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue'
```

### 2. Markdown 增强
- [ ] 语法高亮
- [ ] 实时预览
- [ ] 快捷键插入（表格、代码块、图片等）
- [ ] 图片拖拽上传
- [ ] Front Matter 可视化编辑

### 3. 协作功能
- [ ] 版本历史
- [ ] 多光标编辑
- [ ] 实时协作（未来）

### 4. 主题和样式
- [ ] 明暗主题切换
- [ ] 自定义编辑器字体和大小
- [ ] Zen 模式（专注写作）

## 使用方法

```typescript
// 在路由中使用
router.push({
  name: 'editor',
  params: { id: projectId },
  query: { postPath: '/path/to/post.md' }
})

// 使用 composable
import { useEditor } from '@/composables/useEditor'

const editor = useEditor()
await editor.loadFile('/path/to/file.md')
editor.content.value = 'New content'
await editor.saveFile()
```

## 设计原则

1. **简约优先**：核心功能专注于写作体验
2. **渐进增强**：基础功能完善后再添加高级特性
3. **可替换性**：每个组件都可以独立替换
4. **类型安全**：完整的 TypeScript 类型支持
