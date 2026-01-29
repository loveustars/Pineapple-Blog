// Hugo 主题配置和适配器
import type { FrontMatter } from '@/types'

// 主题类型定义
export type HugoTheme = 
  | 'stack'
  | 'papermod'
  | 'loveit'
  | 'blowfish'
  | 'congo'
  | 'docsy'
  | 'default'

// 主题信息
export interface ThemeInfo {
  id: HugoTheme
  name: string
  description: string
  icon: string
  features: string[]
  frontMatterFields: FrontMatterFieldConfig[]
  editorLayout: 'standard' | 'card' | 'documentation'
}

// Front Matter 字段配置
export interface FrontMatterFieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'boolean' | 'tags' | 'select' | 'number' | 'image'
  required?: boolean
  placeholder?: string
  description?: string
  options?: { value: string; label: string }[]
  defaultValue?: any
}

// 主题配置库
export const THEME_CONFIGS: Record<HugoTheme, ThemeInfo> = {
  stack: {
    id: 'stack',
    name: 'Hugo Stack',
    description: '现代化的博客主题，支持系列文章、TOC、搜索等',
    icon: '📚',
    features: ['series', 'toc', 'search', 'comments', 'gallery'],
    editorLayout: 'card',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'description', label: '描述', type: 'textarea', placeholder: '文章摘要' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'image', label: '封面图片', type: 'image', placeholder: '文章封面图片 URL' },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { 
        key: 'series', 
        label: '系列', 
        type: 'tags',
        description: '将文章归入某个系列'
      },
      { key: 'weight', label: '权重', type: 'number', description: '排序权重，数字越小越靠前' },
      { key: 'math', label: '启用数学公式', type: 'boolean', defaultValue: false },
      { key: 'toc', label: '显示目录', type: 'boolean', defaultValue: true },
      { 
        key: 'comments', 
        label: '允许评论', 
        type: 'boolean', 
        defaultValue: true 
      },
      {
        key: 'license',
        label: '许可证',
        type: 'select',
        options: [
          { value: '', label: '使用默认' },
          { value: 'CC BY-NC-SA 4.0', label: 'CC BY-NC-SA 4.0' },
          { value: 'CC BY-SA 4.0', label: 'CC BY-SA 4.0' },
          { value: 'CC BY 4.0', label: 'CC BY 4.0' },
        ]
      },
    ],
  },

  papermod: {
    id: 'papermod',
    name: 'PaperMod',
    description: '简洁优雅的博客主题',
    icon: '📄',
    features: ['search', 'toc', 'reading-time', 'share-buttons'],
    editorLayout: 'standard',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'summary', label: '摘要', type: 'textarea', placeholder: '文章摘要，显示在列表页' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'lastmod', label: '最后修改', type: 'date' },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'author', label: '作者', type: 'text' },
      { key: 'cover', label: '封面图片', type: 'image', description: '可设置 image, alt, caption, relative' },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { key: 'ShowToc', label: '显示目录', type: 'boolean', defaultValue: true },
      { key: 'TocOpen', label: '默认展开目录', type: 'boolean', defaultValue: false },
      { key: 'ShowReadingTime', label: '显示阅读时间', type: 'boolean', defaultValue: true },
      { key: 'ShowShareButtons', label: '显示分享按钮', type: 'boolean', defaultValue: true },
      { key: 'ShowCodeCopyButtons', label: '显示代码复制按钮', type: 'boolean', defaultValue: true },
      { key: 'weight', label: '权重', type: 'number' },
    ],
  },

  loveit: {
    id: 'loveit',
    name: 'LoveIt',
    description: '功能丰富的现代主题',
    icon: '❤️',
    features: ['search', 'toc', 'comments', 'analytics', 'social-share'],
    editorLayout: 'card',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'subtitle', label: '副标题', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'lastmod', label: '最后修改', type: 'date' },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'author', label: '作者', type: 'text' },
      { key: 'featuredImage', label: '特色图片', type: 'image' },
      { key: 'featuredImagePreview', label: '预览图片', type: 'image' },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { 
        key: 'series', 
        label: '系列', 
        type: 'tags' 
      },
      { key: 'toc', label: '显示目录', type: 'boolean', defaultValue: true },
      { key: 'math', label: '启用数学公式', type: 'boolean', defaultValue: false },
      { key: 'lightgallery', label: '启用图片画廊', type: 'boolean', defaultValue: false },
      { key: 'linkToMarkdown', label: '显示 Markdown 链接', type: 'boolean', defaultValue: true },
      { 
        key: 'share', 
        label: '分享选项',
        type: 'select',
        options: [
          { value: 'true', label: '启用' },
          { value: 'false', label: '禁用' },
        ]
      },
      { 
        key: 'comment', 
        label: '评论',
        type: 'select',
        options: [
          { value: 'true', label: '启用' },
          { value: 'false', label: '禁用' },
        ]
      },
    ],
  },

  blowfish: {
    id: 'blowfish',
    name: 'Blowfish',
    description: '强大而灵活的主题，支持多语言',
    icon: '🐡',
    features: ['multilingual', 'search', 'analytics', 'comments', 'series'],
    editorLayout: 'card',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'lastmod', label: '最后修改', type: 'date' },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'externalUrl', label: '外部链接', type: 'text', description: '如果设置，点击将跳转到外部链接' },
      { key: 'showDate', label: '显示日期', type: 'boolean', defaultValue: true },
      { key: 'showDateUpdated', label: '显示更新日期', type: 'boolean', defaultValue: false },
      { key: 'showAuthor', label: '显示作者', type: 'boolean', defaultValue: true },
      { key: 'showReadingTime', label: '显示阅读时间', type: 'boolean', defaultValue: true },
      { key: 'showEdit', label: '显示编辑链接', type: 'boolean', defaultValue: false },
      { key: 'showSummary', label: '在列表显示摘要', type: 'boolean', defaultValue: true },
      { key: 'showTableOfContents', label: '显示目录', type: 'boolean', defaultValue: true },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { key: 'series', label: '系列', type: 'tags' },
      { key: 'series_order', label: '系列顺序', type: 'number' },
      { 
        key: 'featureimage', 
        label: '特色图片', 
        type: 'image' 
      },
      {
        key: 'featureimageAlt',
        label: '特色图片替代文本',
        type: 'text'
      },
    ],
  },

  congo: {
    id: 'congo',
    name: 'Congo',
    description: '简单强大的 Tailwind CSS 主题',
    icon: '🌴',
    features: ['tailwind', 'dark-mode', 'search', 'analytics'],
    editorLayout: 'standard',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'summary', label: '摘要', type: 'textarea' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'lastmod', label: '最后修改', type: 'date' },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'externalUrl', label: '外部链接', type: 'text' },
      { key: 'showDate', label: '显示日期', type: 'boolean', defaultValue: true },
      { key: 'showAuthor', label: '显示作者', type: 'boolean', defaultValue: true },
      { key: 'showReadingTime', label: '显示阅读时间', type: 'boolean', defaultValue: true },
      { key: 'showTableOfContents', label: '显示目录', type: 'boolean', defaultValue: true },
      { key: 'showTaxonomies', label: '显示分类标签', type: 'boolean', defaultValue: true },
      { key: 'showWordCount', label: '显示字数', type: 'boolean', defaultValue: false },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { key: 'series', label: '系列', type: 'tags' },
      { key: 'featureImage', label: '特色图片', type: 'image' },
      { key: 'featureImageAlt', label: '图片替代文本', type: 'text' },
    ],
  },

  docsy: {
    id: 'docsy',
    name: 'Docsy',
    description: '技术文档专用主题',
    icon: '📖',
    features: ['documentation', 'versioning', 'search', 'feedback'],
    editorLayout: 'documentation',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'linkTitle', label: '导航标题', type: 'text', description: '在导航中显示的简短标题' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'date', label: '发布日期', type: 'date' },
      { key: 'weight', label: '权重', type: 'number', description: '在侧边栏中的排序权重' },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'toc_hide', label: '隐藏目录', type: 'boolean', defaultValue: false },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      {
        key: 'type',
        label: '页面类型',
        type: 'select',
        options: [
          { value: 'docs', label: '文档' },
          { value: 'blog', label: '博客' },
        ]
      },
      { key: 'simple_list', label: '简单列表', type: 'boolean', description: '使用简单列表显示子页面' },
      { key: 'no_list', label: '不显示子页面列表', type: 'boolean' },
    ],
  },

  default: {
    id: 'default',
    name: '默认主题',
    description: '通用 Hugo 主题配置',
    icon: '🎨',
    features: [],
    editorLayout: 'standard',
    frontMatterFields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'date', label: '发布日期', type: 'date', required: true },
      { key: 'draft', label: '草稿', type: 'boolean', defaultValue: true },
      { key: 'categories', label: '分类', type: 'tags' },
      { key: 'tags', label: '标签', type: 'tags' },
      { key: 'weight', label: '权重', type: 'number' },
    ],
  },
}

// 检测项目使用的主题
export async function detectTheme(projectPath: string): Promise<HugoTheme> {
  // TODO: 从项目配置文件 (config.toml/yaml/json) 读取主题信息
  // 暂时返回默认值
  return 'default'
}

// 获取主题的默认 Front Matter
export function getDefaultFrontMatter(theme: HugoTheme): Partial<FrontMatter> {
  const config = THEME_CONFIGS[theme]
  const frontMatter: Record<string, any> = {}

  for (const field of config.frontMatterFields) {
    if (field.defaultValue !== undefined) {
      frontMatter[field.key] = field.defaultValue
    }
  }

  return frontMatter as Partial<FrontMatter>
}

// 序列化主题特定的 Front Matter
export function serializeThemeFrontMatter(
  theme: HugoTheme,
  data: Record<string, any>
): string {
  const config = THEME_CONFIGS[theme]
  const lines: string[] = ['---']

  for (const field of config.frontMatterFields) {
    const value = data[field.key]
    if (value === undefined || value === null || value === '') continue

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'image':
        lines.push(`${field.key}: "${value}"`)
        break
      case 'date':
        lines.push(`${field.key}: ${value}`)
        break
      case 'boolean':
        lines.push(`${field.key}: ${value}`)
        break
      case 'number':
        lines.push(`${field.key}: ${value}`)
        break
      case 'tags':
        if (Array.isArray(value) && value.length > 0) {
          lines.push(`${field.key}:`)
          for (const item of value) {
            lines.push(`  - "${item}"`)
          }
        }
        break
      case 'select':
        lines.push(`${field.key}: ${value}`)
        break
    }
  }

  lines.push('---')
  return lines.join('\n')
}

// 解析主题特定的 Front Matter
export function parseThemeFrontMatter(
  theme: HugoTheme,
  content: string
): { frontMatter: Record<string, any>; markdown: string } {
  const config = THEME_CONFIGS[theme]
  const frontMatter: Record<string, any> = {}
  
  // 匹配 YAML front matter
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  
  if (!match) {
    return { frontMatter: getDefaultFrontMatter(theme) as Record<string, any>, markdown: content }
  }

  const yaml = match[1]
  const markdown = match[2]

  // 简单的 YAML 解析
  const lines = yaml.split('\n')
  let currentKey = ''
  let currentArray: string[] = []
  let inArray = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('- ')) {
      // 数组项
      if (inArray && currentKey) {
        const value = trimmed.substring(2).replace(/^["']|["']$/g, '')
        currentArray.push(value)
      }
    } else if (trimmed.includes(':')) {
      // 保存之前的数组
      if (inArray && currentKey) {
        frontMatter[currentKey] = currentArray
        currentArray = []
        inArray = false
      }

      const colonIndex = trimmed.indexOf(':')
      const key = trimmed.substring(0, colonIndex).trim()
      let value = trimmed.substring(colonIndex + 1).trim()

      if (value === '') {
        // 可能是数组开始
        currentKey = key
        inArray = true
        currentArray = []
      } else {
        // 移除引号
        value = value.replace(/^["']|["']$/g, '')
        
        // 类型转换
        const fieldConfig = config.frontMatterFields.find(f => f.key === key)
        if (fieldConfig) {
          switch (fieldConfig.type) {
            case 'boolean':
              frontMatter[key] = value === 'true'
              break
            case 'number':
              frontMatter[key] = parseInt(value, 10)
              break
            default:
              frontMatter[key] = value
          }
        } else {
          frontMatter[key] = value
        }
      }
    }
  }

  // 处理最后一个数组
  if (inArray && currentKey) {
    frontMatter[currentKey] = currentArray
  }

  return { frontMatter, markdown }
}
