<template>
  <div class="wysiwyg-editor h-full flex flex-col bg-white">
    <!-- 工具栏 -->
    <div class="toolbar bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-1 flex-wrap">
      <!-- 格式化工具组 -->
      <div class="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          @click="formatText('bold')"
          :class="['toolbar-btn', { 'active': activeFormats.bold }]"
          title="粗体 (Ctrl+B)"
        >
          <span class="font-bold">B</span>
        </button>
        <button
          @click="formatText('italic')"
          :class="['toolbar-btn', { 'active': activeFormats.italic }]"
          title="斜体 (Ctrl+I)"
        >
          <span class="italic">I</span>
        </button>
        <button
          @click="formatText('strikethrough')"
          :class="['toolbar-btn', { 'active': activeFormats.strikethrough }]"
          title="删除线"
        >
          <span class="line-through">S</span>
        </button>
        <button
          @click="formatText('code')"
          :class="['toolbar-btn', { 'active': activeFormats.code }]"
          title="行内代码"
        >
          <span class="font-mono">&lt;/&gt;</span>
        </button>
      </div>

      <!-- 标题工具组 -->
      <div class="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <select
          @change="insertHeading($event)"
          class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">标题</option>
          <option value="1">H1 标题</option>
          <option value="2">H2 标题</option>
          <option value="3">H3 标题</option>
          <option value="4">H4 标题</option>
          <option value="5">H5 标题</option>
          <option value="6">H6 标题</option>
        </select>
      </div>

      <!-- 列表工具组 -->
      <div class="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          @click="insertList('unordered')"
          class="toolbar-btn"
          title="无序列表"
        >
          <span>≡</span>
        </button>
        <button
          @click="insertList('ordered')"
          class="toolbar-btn"
          title="有序列表"
        >
          <span>1.</span>
        </button>
        <button
          @click="insertBlockquote"
          class="toolbar-btn"
          title="引用"
        >
          <span>❝</span>
        </button>
      </div>

      <!-- 插入工具组 -->
      <div class="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          @click="insertLink"
          class="toolbar-btn"
          title="插入链接"
        >
          <span>🔗</span>
        </button>
        <button
          @click="insertImage"
          class="toolbar-btn"
          title="插入图片"
        >
          <span>🖼️</span>
        </button>
        <button
          @click="insertCodeBlock"
          class="toolbar-btn"
          title="代码块"
        >
          <span>{ }</span>
        </button>
        <button
          @click="insertTable"
          class="toolbar-btn"
          title="插入表格"
        >
          <span>▦</span>
        </button>
        <button
          @click="insertHorizontalRule"
          class="toolbar-btn"
          title="分隔线"
        >
          <span>―</span>
        </button>
      </div>

      <!-- 编辑模式切换 -->
      <div class="flex items-center gap-1 ml-auto">
        <button
          @click="editorMode = 'wysiwyg'"
          :class="['toolbar-btn px-3', { 'active': editorMode === 'wysiwyg' }]"
          title="所见即所得"
        >
          所见即所得
        </button>
        <button
          @click="editorMode = 'source'"
          :class="['toolbar-btn px-3', { 'active': editorMode === 'source' }]"
          title="源码模式"
        >
          源码
        </button>
        <button
          @click="editorMode = 'split'"
          :class="['toolbar-btn px-3', { 'active': editorMode === 'split' }]"
          title="分屏模式"
        >
          分屏
        </button>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- WYSIWYG 编辑器 -->
      <div
        v-show="editorMode === 'wysiwyg' || editorMode === 'split'"
        :class="['flex-1 overflow-auto', editorMode === 'split' ? 'border-r border-gray-200' : '']"
      >
        <div
          ref="editorRef"
          class="editor-content prose prose-lg max-w-none p-8 min-h-full focus:outline-none"
          contenteditable="true"
          @input="handleInput"
          @keydown="handleKeydown"
          @paste="handlePaste"
          @mouseup="updateActiveFormats"
          @keyup="updateActiveFormats"
          spellcheck="false"
        ></div>
      </div>

      <!-- 源码编辑器 -->
      <div
        v-show="editorMode === 'source' || editorMode === 'split'"
        :class="['flex-1 overflow-auto', editorMode === 'split' ? '' : '']"
      >
        <textarea
          ref="sourceRef"
          v-model="markdownSource"
          @input="handleSourceInput"
          class="w-full h-full p-8 font-mono text-sm resize-none focus:outline-none bg-gray-50"
          placeholder="在这里编写 Markdown..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { marked } from 'marked'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const sourceRef = ref<HTMLTextAreaElement | null>(null)
const editorMode = ref<'wysiwyg' | 'source' | 'split'>('wysiwyg')
const markdownSource = ref(props.modelValue)
const isUpdating = ref(false)

const activeFormats = ref({
  bold: false,
  italic: false,
  strikethrough: false,
  code: false,
})

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

// 初始化编辑器内容
onMounted(async () => {
  await nextTick()
  if (editorRef.value && props.modelValue) {
    const html = await marked.parse(props.modelValue)
    editorRef.value.innerHTML = html
  }
})

// 监听外部值变化
watch(() => props.modelValue, async (newValue) => {
  if (isUpdating.value) return
  markdownSource.value = newValue
  if (editorRef.value) {
    const html = await marked.parse(newValue)
    editorRef.value.innerHTML = html
  }
}, { immediate: false })

// 从 HTML 转换为 Markdown
function htmlToMarkdown(html: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const children = Array.from(element.childNodes).map(processNode).join('')

    switch (tagName) {
      case 'h1': return `# ${children}\n\n`
      case 'h2': return `## ${children}\n\n`
      case 'h3': return `### ${children}\n\n`
      case 'h4': return `#### ${children}\n\n`
      case 'h5': return `##### ${children}\n\n`
      case 'h6': return `###### ${children}\n\n`
      case 'p': return `${children}\n\n`
      case 'br': return '\n'
      case 'strong':
      case 'b': return `**${children}**`
      case 'em':
      case 'i': return `*${children}*`
      case 'del':
      case 's': return `~~${children}~~`
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          return children
        }
        return `\`${children}\``
      case 'pre':
        const codeElement = element.querySelector('code')
        const language = codeElement?.className.match(/language-(\w+)/)?.[1] || ''
        const codeContent = codeElement?.textContent || children
        return `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`
      case 'blockquote': return `> ${children.trim().replace(/\n/g, '\n> ')}\n\n`
      case 'ul':
        return Array.from(element.children)
          .map(li => `- ${processNode(li).trim()}`)
          .join('\n') + '\n\n'
      case 'ol':
        return Array.from(element.children)
          .map((li, i) => `${i + 1}. ${processNode(li).trim()}`)
          .join('\n') + '\n\n'
      case 'li': return children
      case 'a':
        const href = element.getAttribute('href') || ''
        return `[${children}](${href})`
      case 'img':
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || ''
        return `![${alt}](${src})`
      case 'hr': return '\n---\n\n'
      case 'table':
        return processTable(element)
      case 'div':
      case 'span':
        return children
      default:
        return children
    }
  }

  function processTable(table: HTMLElement): string {
    const rows = Array.from(table.querySelectorAll('tr'))
    if (rows.length === 0) return ''

    const result: string[] = []
    
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td'))
      const cellContents = cells.map(cell => processNode(cell).trim())
      result.push(`| ${cellContents.join(' | ')} |`)
      
      if (rowIndex === 0) {
        result.push(`| ${cells.map(() => '---').join(' | ')} |`)
      }
    })

    return result.join('\n') + '\n\n'
  }

  return processNode(tempDiv).trim()
}

// 处理编辑器输入
const handleInput = () => {
  if (!editorRef.value || isUpdating.value) return
  
  isUpdating.value = true
  const html = editorRef.value.innerHTML
  const markdown = htmlToMarkdown(html)
  markdownSource.value = markdown
  emit('update:modelValue', markdown)
  emit('change', markdown)
  
  nextTick(() => {
    isUpdating.value = false
  })
}

// 处理源码输入
const handleSourceInput = async () => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  emit('update:modelValue', markdownSource.value)
  emit('change', markdownSource.value)
  
  if (editorRef.value) {
    const html = await marked.parse(markdownSource.value)
    editorRef.value.innerHTML = html
  }
  
  nextTick(() => {
    isUpdating.value = false
  })
}

// 文本格式化 - 切换模式
function formatText(format: 'bold' | 'italic' | 'strikethrough' | 'code') {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  
  // 检查当前选中区域是否已经有该格式
  const tagMap = {
    bold: ['STRONG', 'B'],
    italic: ['EM', 'I'],
    strikethrough: ['DEL', 'S', 'STRIKE'],
    code: ['CODE'],
  }

  const targetTags = tagMap[format]
  
  // 查找父元素中是否有对应格式标签
  let parentWithFormat: HTMLElement | null = null
  let node: Node | null = range.commonAncestorContainer
  
  while (node && node !== editorRef.value) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      if (targetTags.includes(element.tagName)) {
        parentWithFormat = element
        break
      }
    }
    node = node.parentNode
  }

  if (parentWithFormat) {
    // 已有格式，移除它
    const parent = parentWithFormat.parentNode
    if (parent) {
      while (parentWithFormat.firstChild) {
        parent.insertBefore(parentWithFormat.firstChild, parentWithFormat)
      }
      parent.removeChild(parentWithFormat)
    }
  } else {
    // 没有格式，添加它
    const selectedText = range.toString()
    if (!selectedText) return

    let wrapper: HTMLElement
    switch (format) {
      case 'bold':
        wrapper = document.createElement('strong')
        break
      case 'italic':
        wrapper = document.createElement('em')
        break
      case 'strikethrough':
        wrapper = document.createElement('del')
        break
      case 'code':
        wrapper = document.createElement('code')
        break
    }

    try {
      range.surroundContents(wrapper)
    } catch (e) {
      // 如果 surroundContents 失败（跨越多个元素），使用替代方法
      const fragment = range.extractContents()
      wrapper.appendChild(fragment)
      range.insertNode(wrapper)
    }
  }
  
  handleInput()
  updateActiveFormats()
}

// 插入标题
function insertHeading(event: Event) {
  const select = event.target as HTMLSelectElement
  const level = select.value
  if (!level) return

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const selectedText = range.toString() || '标题'
  
  const heading = document.createElement(`h${level}`)
  heading.textContent = selectedText
  
  range.deleteContents()
  range.insertNode(heading)
  
  // 在标题后插入新段落
  const p = document.createElement('p')
  p.innerHTML = '<br>'
  heading.after(p)
  
  select.value = ''
  handleInput()
}

// 插入列表
function insertList(type: 'ordered' | 'unordered') {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const list = document.createElement(type === 'ordered' ? 'ol' : 'ul')
  const li = document.createElement('li')
  li.textContent = range.toString() || '列表项'
  list.appendChild(li)

  range.deleteContents()
  range.insertNode(list)
  handleInput()
}

// 插入引用
function insertBlockquote() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const blockquote = document.createElement('blockquote')
  const p = document.createElement('p')
  p.textContent = range.toString() || '引用文本'
  blockquote.appendChild(p)

  range.deleteContents()
  range.insertNode(blockquote)
  handleInput()
}

// 插入链接
function insertLink() {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || '链接文本'
  
  const url = prompt('请输入链接地址:', 'https://')
  if (!url) return

  const link = document.createElement('a')
  link.href = url
  link.textContent = selectedText
  link.target = '_blank'

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(link)
  }
  
  handleInput()
}

// 插入图片
function insertImage() {
  const url = prompt('请输入图片地址:', 'https://')
  if (!url) return

  const alt = prompt('请输入图片描述:', '图片')

  const img = document.createElement('img')
  img.src = url
  img.alt = alt || '图片'
  img.style.maxWidth = '100%'

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(img)
  }
  
  handleInput()
}

// 插入代码块
function insertCodeBlock() {
  const language = prompt('请输入编程语言 (可选):', '')
  const code = prompt('请输入代码:', '// 代码')
  if (code === null) return

  const pre = document.createElement('pre')
  const codeElement = document.createElement('code')
  if (language) {
    codeElement.className = `language-${language}`
  }
  codeElement.textContent = code
  pre.appendChild(codeElement)

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(pre)
  }
  
  handleInput()
}

// 插入表格
function insertTable() {
  const rows = parseInt(prompt('行数:', '3') || '3')
  const cols = parseInt(prompt('列数:', '3') || '3')

  const table = document.createElement('table')
  table.className = 'border-collapse w-full'
  
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr')
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement(i === 0 ? 'th' : 'td')
      cell.className = 'border border-gray-300 px-4 py-2'
      cell.textContent = i === 0 ? `标题 ${j + 1}` : `单元格`
      tr.appendChild(cell)
    }
    table.appendChild(tr)
  }

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(table)
  }
  
  handleInput()
}

// 插入分隔线
function insertHorizontalRule() {
  const hr = document.createElement('hr')
  
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(hr)
  }
  
  handleInput()
}

// 键盘快捷键
function handleKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        formatText('bold')
        break
      case 'i':
        event.preventDefault()
        formatText('italic')
        break
      case 's':
        event.preventDefault()
        // 保存由父组件处理
        break
    }
  }
}

// 处理粘贴
function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

// 更新当前激活的格式
function updateActiveFormats() {
  activeFormats.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    strikethrough: document.queryCommandState('strikeThrough'),
    code: false, // code 没有对应的 queryCommandState
  }
}

// 暴露方法给父组件
defineExpose({
  getMarkdown: () => markdownSource.value,
  setMarkdown: async (markdown: string) => {
    markdownSource.value = markdown
    if (editorRef.value) {
      const html = await marked.parse(markdown)
      editorRef.value.innerHTML = html
    }
  },
  focus: () => {
    if (editorMode.value === 'source') {
      sourceRef.value?.focus()
    } else {
      editorRef.value?.focus()
    }
  },
})
</script>

<style scoped>
.toolbar-btn {
  @apply px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded transition min-w-[32px] h-8 flex items-center justify-center;
}

.toolbar-btn.active {
  @apply bg-primary-100 text-primary-700;
}

.editor-content {
  line-height: 1.8;
}

.editor-content:focus {
  outline: none;
}

/* Prose 样式覆盖 */
.editor-content :deep(h1) {
  @apply text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200;
}

.editor-content :deep(h2) {
  @apply text-2xl font-bold mt-5 mb-3 pb-1 border-b border-gray-100;
}

.editor-content :deep(h3) {
  @apply text-xl font-semibold mt-4 mb-2;
}

.editor-content :deep(h4) {
  @apply text-lg font-semibold mt-3 mb-2;
}

.editor-content :deep(p) {
  @apply my-3 leading-relaxed;
}

.editor-content :deep(blockquote) {
  @apply border-l-4 border-primary-400 pl-4 py-2 my-4 bg-gray-50 italic text-gray-700;
}

.editor-content :deep(code) {
  @apply bg-gray-100 text-primary-600 px-1.5 py-0.5 rounded text-sm font-mono;
}

.editor-content :deep(pre) {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto;
}

.editor-content :deep(pre code) {
  @apply bg-transparent text-inherit p-0;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  @apply my-3 pl-6;
}

.editor-content :deep(li) {
  @apply my-1;
}

.editor-content :deep(a) {
  @apply text-primary-600 hover:text-primary-700 underline;
}

.editor-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

.editor-content :deep(table) {
  @apply w-full border-collapse my-4;
}

.editor-content :deep(th),
.editor-content :deep(td) {
  @apply border border-gray-300 px-4 py-2 text-left;
}

.editor-content :deep(th) {
  @apply bg-gray-50 font-semibold;
}

.editor-content :deep(hr) {
  @apply my-6 border-gray-300;
}

.editor-content :deep(strong) {
  @apply font-bold;
}

.editor-content :deep(em) {
  @apply italic;
}

.editor-content :deep(del) {
  @apply line-through text-gray-500;
}
</style>
