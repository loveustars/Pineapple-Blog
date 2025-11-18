// Editor 相关的组合式函数
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface EditorState {
  content: string
  filePath: string
  hasUnsavedChanges: boolean
  saving: boolean
}

export function useEditor(initialPath?: string) {
  const content = ref('')
  const originalContent = ref('')
  const filePath = ref(initialPath || '')
  const saving = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasUnsavedChanges = computed(() => content.value !== originalContent.value)

  const loadFile = async (path: string) => {
    loading.value = true
    error.value = null
    filePath.value = path

    try {
      const fileContent = await invoke<string>('read_file', { filePath: path })
      content.value = fileContent
      originalContent.value = fileContent
      return fileContent
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveFile = async () => {
    if (!filePath.value || saving.value) return false

    saving.value = true
    error.value = null

    try {
      await invoke('save_file', {
        filePath: filePath.value,
        content: content.value,
      })
      originalContent.value = content.value
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      saving.value = false
    }
  }

  const reset = () => {
    content.value = originalContent.value
  }

  return {
    content,
    filePath,
    hasUnsavedChanges,
    saving,
    loading,
    error,
    loadFile,
    saveFile,
    reset,
  }
}

// Markdown 统计相关
export function useMarkdownStats(content: string) {
  const lineCount = content.split('\n').length
  
  const wordCount = (() => {
    const text = content.trim()
    if (!text) return 0
    const chinese = text.match(/[\u4e00-\u9fa5]/g) || []
    const words = text.match(/[a-zA-Z]+/g) || []
    return chinese.length + words.length
  })()

  const charCount = content.length
  
  const readingTime = Math.ceil(wordCount / 200) // 假设每分钟阅读 200 字

  return {
    lineCount,
    wordCount,
    charCount,
    readingTime,
  }
}
