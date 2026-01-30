<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Toolbar -->
    <EditorToolbar
      :file-name="fileName"
      :file-path="filePath"
      :has-unsaved-changes="hasUnsavedChanges"
      :saving="saving"
      :last-saved="lastSaved"
      @back="handleBack"
      @save="handleSave"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <!-- 编辑器模式切换 -->
          <div class="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              @click="editorType = 'wysiwyg'"
              :class="[
                'px-3 py-1.5 text-sm rounded-md transition-all',
                editorType === 'wysiwyg' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              📝 所见即所得
            </button>
            <button
              @click="editorType = 'classic'"
              :class="[
                'px-3 py-1.5 text-sm rounded-md transition-all',
                editorType === 'classic' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              📄 经典模式
            </button>
          </div>
        </div>
      </template>
    </EditorToolbar>

    <!-- Editor Container -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- 侧边栏：Front Matter 编辑器 -->
      <div 
        class="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0 transition-all duration-300"
        :class="frontMatterCollapsed ? 'w-0' : 'w-80'"
      >
        <ThemeFrontMatterEditor
          v-show="!frontMatterCollapsed"
          :theme="currentTheme"
          :data="frontMatter"
          :readonly-theme="true"
          @update="handleFrontMatterUpdate"
          @toggle="frontMatterCollapsed = !frontMatterCollapsed"
        />
      </div>

      <!-- 折叠按钮 -->
      <button
        @click="frontMatterCollapsed = !frontMatterCollapsed"
        class="w-6 flex-shrink-0 bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-r border-gray-200 transition-colors"
        :title="frontMatterCollapsed ? '展开元数据' : '收起元数据'"
      >
        <span class="transform transition-transform" :class="{ 'rotate-180': frontMatterCollapsed }">
          ◀
        </span>
      </button>

      <!-- 主编辑区域 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- WYSIWYG 编辑器 -->
        <WysiwygEditor
          v-if="editorType === 'wysiwyg'"
          ref="wysiwygEditorRef"
          v-model="markdownContent"
          @change="handleContentChange"
          class="flex-1"
        />

        <!-- 经典模式：源码 + 预览 -->
        <div v-else class="flex-1 flex overflow-hidden">
          <!-- Markdown 源码编辑器 -->
          <div class="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
            <!-- Markdown 工具栏 -->
            <MarkdownToolbar
              :textarea-ref="textareaRef"
              @insert="handleInsertText"
            />

            <!-- 源码编辑 -->
            <textarea
              ref="textareaRef"
              v-model="markdownContent"
              @input="handleContentChange"
              class="flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none bg-white overflow-y-auto"
              placeholder="在这里开始写作...

# 我的第一篇文章

这是一个段落。

## 二级标题

- 列表项 1
- 列表项 2

**粗体** 和 *斜体*"
              spellcheck="false"
            ></textarea>
          </div>

          <!-- 预览面板 -->
          <div class="flex-1 overflow-hidden">
            <MarkdownPreview :html="previewHtml" />
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <EditorStatusBar
      :line-count="stats.lineCount"
      :word-count="stats.wordCount"
      :char-count="stats.charCount"
      :reading-time="stats.readingTime"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { useMarkdownStats } from '@/composables/useEditor'
import { useMarkdownPreview } from '@/composables/useMarkdownPreview'
import { parseHugoPost, serializeHugoPost, formatDateForInput } from '@/utils/frontMatter'
import { useProjectStore } from '@/stores/projectStore'
import EditorToolbar from '@/components/EditorToolbar.vue'
import EditorStatusBar from '@/components/EditorStatusBar.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import FrontMatterEditor from '@/components/FrontMatterEditor.vue'
import MarkdownToolbar from '@/components/MarkdownToolbar.vue'
import WysiwygEditor from '@/components/WysiwygEditor.vue'
import ThemeFrontMatterEditor from '@/components/ThemeFrontMatterEditor.vue'
import type { FrontMatter } from '@/types'
import type { HugoTheme } from '@/utils/themeConfig'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const { parse, debounce } = useMarkdownPreview()

const filePath = ref('')
const fileName = ref('未命名文档')
const markdownContent = ref('')
const frontMatter = ref<FrontMatter>({
  title: '',
  date: new Date().toISOString(),
  draft: true,
  tags: [],
  categories: [],
})
const originalContent = ref('')
const saving = ref(false)
const lastSaved = ref<Date | null>(null)
const previewHtml = ref('')
const frontMatterCollapsed = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const wysiwygEditorRef = ref<InstanceType<typeof WysiwygEditor> | null>(null)
const editorType = ref<'wysiwyg' | 'classic'>('wysiwyg')
// 从项目读取主题，默认为 default
const currentTheme = computed<HugoTheme>(() => {
  const theme = projectStore.currentProject?.theme?.toLowerCase() || 'default'
  return theme as HugoTheme
})
const frontMatterFormat = ref<'yaml' | 'toml'>('yaml') // 记住原始格式

const fullContent = computed(() => serializeHugoPost(frontMatter.value, markdownContent.value, frontMatterFormat.value))
const hasUnsavedChanges = computed(() => fullContent.value !== originalContent.value)
const stats = computed(() => useMarkdownStats(markdownContent.value))

let saveTimeout: number | null = null

const handleContentChange = () => {
  // 自动保存（3秒无操作后）
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = window.setTimeout(() => {
    if (hasUnsavedChanges.value) {
      handleSave()
    }
  }, 3000)
}

const handleFrontMatterUpdate = (updated: Record<string, any>) => {
  // 保留必要的基础字段，合并其他字段
  frontMatter.value = { 
    title: updated.title || frontMatter.value.title,
    date: updated.date || frontMatter.value.date,
    draft: updated.draft ?? frontMatter.value.draft,
    tags: updated.tags || frontMatter.value.tags,
    categories: updated.categories || frontMatter.value.categories,
    ...updated  // 包含主题特定的字段
  }
  handleContentChange()
}

const handleInsertText = (text: string, cursorOffset: number = 0) => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = markdownContent.value.substring(0, start)
  const after = markdownContent.value.substring(end)

  markdownContent.value = before + text + after

  // 设置光标位置
  setTimeout(() => {
    const newPosition = start + text.length + cursorOffset
    textarea.focus()
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)

  handleContentChange()
}

const handleSave = async () => {
  if (!filePath.value || saving.value) return
  
  saving.value = true
  try {
    await invoke('save_file', {
      filePath: filePath.value,
      content: fullContent.value,
    })
    originalContent.value = fullContent.value
    lastSaved.value = new Date()
  } catch (err) {
    console.error('保存失败:', err)
    alert(`保存失败: ${err}`)
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  if (hasUnsavedChanges.value) {
    if (!confirm('有未保存的更改，确定要离开吗？')) {
      return
    }
  }
  router.back()
}

const loadFile = async () => {
  const postPath = route.query.postPath as string
  if (!postPath) {
    alert('未指定文件路径')
    router.back()
    return
  }

  filePath.value = postPath
  fileName.value = postPath.split(/[/\\]/).pop() || '未命名文档'

  try {
    const fileContent = await invoke<string>('read_file', {
      filePath: postPath,
    })
    
    // 解析 Hugo 文章结构
    const parsed = parseHugoPost(fileContent)
    frontMatterFormat.value = parsed.format // 记住原始格式（yaml 或 toml）
    frontMatter.value = {
      ...parsed.frontMatter,
      date: formatDateForInput(parsed.frontMatter.date),
    }
    markdownContent.value = parsed.markdown
    originalContent.value = fileContent
    
    // 初始化预览
    previewHtml.value = await parse(parsed.markdown)
  } catch (err) {
    console.error('读取文件失败:', err)
    alert(`读取文件失败: ${err}`)
    router.back()
  }
}

// 实时更新预览
const updatePreview = debounce(async () => {
  previewHtml.value = await parse(markdownContent.value)
}, 300)

watch(markdownContent, () => {
  if (editorType.value === 'classic') {
    updatePreview()
  }
})

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => {
  loadFile()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  line-height: 1.6;
  tab-size: 2;
}
</style>
