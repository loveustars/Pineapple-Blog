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
    />

    <!-- Editor Container -->
    <div class="flex-1 relative overflow-hidden">
      <textarea
        v-model="content"
        @input="handleContentChange"
        class="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none bg-white"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { useMarkdownStats } from '@/composables/useEditor'
import EditorToolbar from '@/components/EditorToolbar.vue'
import EditorStatusBar from '@/components/EditorStatusBar.vue'

const router = useRouter()
const route = useRoute()

const filePath = ref('')
const fileName = ref('未命名文档')
const content = ref('')
const originalContent = ref('')
const saving = ref(false)
const lastSaved = ref<Date | null>(null)

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
  } catch (err) {
    console.error('读取文件失败:', err)
    alert(`读取文件失败: ${err}`)
    router.back()
  }
}

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
