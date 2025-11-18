<template>
  <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
    <button
      v-for="tool in tools"
      :key="tool.name"
      @click="tool.action"
      :title="tool.tooltip"
      class="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition flex items-center gap-1 whitespace-nowrap"
    >
      <span>{{ tool.icon }}</span>
      <span class="hidden sm:inline">{{ tool.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  textareaRef?: HTMLTextAreaElement | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  insert: [text: string, offset?: number]
}>()

interface Tool {
  name: string
  icon: string
  tooltip: string
  action: () => void
}

const insertAtCursor = (before: string, after: string = '', defaultText: string = '') => {
  if (!props.textareaRef) {
    emit('insert', before + defaultText + after, -after.length)
    return
  }

  const textarea = props.textareaRef
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)
  const textToInsert = selectedText || defaultText
  
  const insertText = before + textToInsert + after
  emit('insert', insertText, selectedText ? 0 : -after.length)
}

const tools: Tool[] = [
  {
    name: '粗体',
    icon: '𝐁',
    tooltip: '粗体文本 (Ctrl+B)',
    action: () => insertAtCursor('**', '**', '粗体文本'),
  },
  {
    name: '斜体',
    icon: '𝐼',
    tooltip: '斜体文本 (Ctrl+I)',
    action: () => insertAtCursor('*', '*', '斜体文本'),
  },
  {
    name: '标题',
    icon: 'H',
    tooltip: '插入标题',
    action: () => emit('insert', '\n## ', 0),
  },
  {
    name: '链接',
    icon: '🔗',
    tooltip: '插入链接',
    action: () => insertAtCursor('[', '](https://example.com)', '链接文本'),
  },
  {
    name: '图片',
    icon: '🖼️',
    tooltip: '插入图片',
    action: () => emit('insert', '\n![图片描述](https://example.com/image.jpg)\n', 0),
  },
  {
    name: '代码',
    icon: '</\\>',
    tooltip: '插入代码块',
    action: () => emit('insert', '\n```\n代码\n```\n', 0),
  },
  {
    name: '引用',
    icon: '❝',
    tooltip: '插入引用',
    action: () => emit('insert', '\n> ', 0),
  },
  {
    name: '列表',
    icon: '≡',
    tooltip: '插入无序列表',
    action: () => emit('insert', '\n- ', 0),
  },
  {
    name: '有序',
    icon: '1.',
    tooltip: '插入有序列表',
    action: () => emit('insert', '\n1. ', 0),
  },
  {
    name: '任务',
    icon: '☑',
    tooltip: '插入任务列表',
    action: () => emit('insert', '\n- [ ] ', 0),
  },
  {
    name: '表格',
    icon: '⊞',
    tooltip: '插入表格',
    action: () => emit('insert', '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n', 0),
  },
  {
    name: '分割线',
    icon: '―',
    tooltip: '插入分割线',
    action: () => emit('insert', '\n---\n', 0),
  },
]
</script>
