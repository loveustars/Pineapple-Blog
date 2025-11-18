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
        <button
          @click="showPreview = !showPreview"
          class="px-3 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
          :class="showPreview ? 'bg-primary-100 text-primary-700' : 'text-gray-700'"
        >
          <span v-if="showPreview">👁️</span>
          <span v-else>👁️‍🗨️</span>
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </button>
      </template>
    </EditorToolbar>

    <!-- Editor Container -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- 编辑器面板 -->
      <div 
        class="flex flex-col overflow-hidden border-r border-gray-200 transition-all duration-300"
        :class="showPreview ? 'w-1/2' : 'w-full'"
      >
        <textarea
          v-model="content"
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
      <div 
        v-if="showPreview"
        class="w-1/2 overflow-hidden transition-all duration-300"
      >
        <MarkdownPreview :html="previewHtml" />
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
import EditorToolbar from '@/components/EditorToolbar.vue'
import EditorStatusBar from '@/components/EditorStatusBar.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'

const router = useRouter()
const route = useRoute()
const { parse, debounce } = useMarkdownPreview()

const filePath = ref('')
const fileName = ref('未命名文档')
const content = ref('')
const originalContent = ref('')
const saving = ref(false)
const lastSaved = ref<Date | null>(null)
const showPreview = ref(true)
const previewHtml = ref('')

const hasUnsavedChanges = computed(() => content.value !== originalContent.value)
const stats = computed(() => useMarkdownStats(content.value))

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

const handleSave = async () => {
  if (!filePath.value || saving.value) return
  
  saving.value = true
  try {
    await invoke('save_file', {
      filePath: filePath.value,
      content: content.value,
    })
    originalContent.value = content.value
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
  fileName.value = postPath.split('/').pop() || '未命名文档'

  try {
    const fileContent = await invoke<string>('read_file', {
      filePath: postPath,
    })
    content.value = fileContent
    originalContent.value = fileContent
    // 初始化预览
    previewHtml.value = await parse(fileContent)
  } catch (err) {
    console.error('读取文件失败:', err)
    alert(`读取文件失败: ${err}`)
    router.back()
  }
}

// 实时更新预览
const updatePreview = debounce(async () => {
  previewHtml.value = await parse(content.value)
}, 300)

watch(content, () => {
  if (showPreview.value) {
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
