import type { FrontMatter } from '@/types'

/**
 * 检测字符串是否看起来像日期
 */
function isDateLikeString(value: string): boolean {
  // 匹配常见日期格式: 2026-01-29, 2026-01-29T16:55, ISO 格式等
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,                    // 2026-01-29
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,        // 2026-01-29T16:55
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,   // ISO 格式
  ]
  return datePatterns.some(pattern => pattern.test(value))
}

/**
 * 解析 Hugo 文章内容，分离 Front Matter 和 Markdown 内容
 * 支持 YAML (---) 和 TOML (+++) 两种格式
 */
export function parseHugoPost(content: string): {
  frontMatter: FrontMatter
  markdown: string
  format: 'yaml' | 'toml'
} {
  // 尝试匹配 YAML 格式 (---)
  const yamlRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/
  const yamlMatch = content.match(yamlRegex)

  if (yamlMatch) {
    try {
      const frontMatter = parseYamlFrontMatter(yamlMatch[1])
      return { frontMatter, markdown: yamlMatch[2], format: 'yaml' }
    } catch (err) {
      console.error('Failed to parse YAML front matter:', err)
    }
  }

  // 尝试匹配 TOML 格式 (+++)
  const tomlRegex = /^\+\+\+\n([\s\S]*?)\n\+\+\+\n?([\s\S]*)$/
  const tomlMatch = content.match(tomlRegex)

  if (tomlMatch) {
    try {
      const frontMatter = parseTomlFrontMatter(tomlMatch[1])
      return { frontMatter, markdown: tomlMatch[2], format: 'toml' }
    } catch (err) {
      console.error('Failed to parse TOML front matter:', err)
    }
  }

  // 没有 Front Matter，创建默认值
  return {
    frontMatter: createDefaultFrontMatter(),
    markdown: content,
    format: 'yaml',
  }
}

/**
 * 序列化 Front Matter 和 Markdown 内容为完整的 Hugo 文章
 * 默认使用 YAML 格式
 */
export function serializeHugoPost(
  frontMatter: FrontMatter, 
  markdown: string, 
  format: 'yaml' | 'toml' = 'yaml'
): string {
  if (format === 'toml') {
    const frontMatterText = serializeTomlFrontMatter(frontMatter)
    return `+++\n${frontMatterText}\n+++\n${markdown}`
  }
  const frontMatterText = serializeYamlFrontMatter(frontMatter)
  return `---\n${frontMatterText}\n---\n${markdown}`
}

/**
 * 解析 TOML Front Matter 文本
 */
function parseTomlFrontMatter(text: string): FrontMatter {
  const frontMatter: Partial<FrontMatter> = {}
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim()
      let value = trimmed.substring(eqIndex + 1).trim()

      // 移除引号
      value = value.replace(/^['"]|['"]$/g, '')

      switch (key) {
        case 'title':
          frontMatter.title = value
          break
        case 'date':
          frontMatter.date = value
          break
        case 'draft':
          frontMatter.draft = value === 'true'
          break
        case 'description':
          frontMatter.description = value
          break
        case 'tags':
        case 'categories':
          // 解析数组格式 ['tag1', 'tag2']
          const arrayMatch = value.match(/\[(.*?)\]/)
          if (arrayMatch) {
            frontMatter[key] = arrayMatch[1]
              .split(',')
              .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
              .filter(v => v)
          } else {
            frontMatter[key] = []
          }
          break
        default:
          // 存储其他字段
          (frontMatter as any)[key] = value
      }
    }
  }

  return {
    title: frontMatter.title || '',
    date: frontMatter.date || new Date().toISOString(),
    draft: frontMatter.draft ?? true,
    tags: frontMatter.tags || [],
    categories: frontMatter.categories || [],
    description: frontMatter.description,
    ...frontMatter,
  }
}

/**
 * 序列化 Front Matter 为 TOML 格式
 */
function serializeTomlFrontMatter(frontMatter: FrontMatter): string {
  const lines: string[] = []

  // 基本字段
  lines.push(`title = '${frontMatter.title}'`)
  lines.push(`date = '${formatDateForHugo(frontMatter.date)}'`)
  lines.push(`draft = ${frontMatter.draft}`)

  if (frontMatter.description) {
    lines.push(`description = '${frontMatter.description}'`)
  }

  // 数组字段
  if (frontMatter.tags && frontMatter.tags.length > 0) {
    lines.push(`tags = ['${frontMatter.tags.join("', '")}']`)
  }

  if (frontMatter.categories && frontMatter.categories.length > 0) {
    lines.push(`categories = ['${frontMatter.categories.join("', '")}']`)
  }

  // 其他自定义字段
  const standardKeys = ['title', 'date', 'draft', 'description', 'tags', 'categories']
  // 日期相关的字段名
  const dateFieldNames = ['lastmod', 'publishDate', 'expiryDate', 'lastModified', 'updated', 'modified']
  
  for (const [key, value] of Object.entries(frontMatter)) {
    if (standardKeys.includes(key)) continue
    if (value === undefined || value === null || value === '') continue

    if (typeof value === 'boolean') {
      lines.push(`${key} = ${value}`)
    } else if (typeof value === 'number') {
      lines.push(`${key} = ${value}`)
    } else if (Array.isArray(value)) {
      const arrayStr = value.map(v => `'${v}'`).join(', ')
      lines.push(`${key} = [${arrayStr}]`)
    } else if (typeof value === 'string') {
      // 检查是否是日期字段
      if (dateFieldNames.includes(key) || isDateLikeString(value)) {
        lines.push(`${key} = '${formatDateForHugo(value)}'`)
      } else {
        lines.push(`${key} = '${value}'`)
      }
    } else {
      lines.push(`${key} = '${value}'`)
    }
  }

  return lines.join('\n')
}

/**
 * 解析 YAML Front Matter 文本
 */
function parseYamlFrontMatter(text: string): FrontMatter {
  const lines = text.split('\n')
  const frontMatter: Partial<FrontMatter> = {}
  let currentKey = ''
  let currentArray: string[] = []
  let inArray = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed || trimmed.startsWith('#')) continue

    // 处理数组结束
    if (inArray && !trimmed.startsWith('-')) {
      if (currentKey === 'tags') {
        frontMatter.tags = currentArray
      } else if (currentKey === 'categories') {
        frontMatter.categories = currentArray
      }
      inArray = false
      currentArray = []
    }

    // 处理数组项
    if (trimmed.startsWith('-')) {
      const value = trimmed.substring(1).trim().replace(/^["']|["']$/g, '')
      currentArray.push(value)
      continue
    }

    // 处理键值对
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      if (key === 'tags' || key === 'categories') {
        currentKey = key
        if (value === '[]' || value === '') {
          frontMatter[key] = []
        } else if (value.startsWith('[')) {
          // 内联数组格式: [tag1, tag2]
          const arrayMatch = value.match(/\[(.*?)\]/)
          if (arrayMatch) {
            frontMatter[key] = arrayMatch[1]
              .split(',')
              .map(v => v.trim().replace(/^["']|["']$/g, ''))
              .filter(v => v)
          }
        } else {
          inArray = true
          currentArray = []
        }
      } else if (key === 'draft') {
        frontMatter.draft = value === 'true'
      } else if (key === 'title') {
        frontMatter.title = value.replace(/^["']|["']$/g, '')
      } else if (key === 'date') {
        frontMatter.date = value.replace(/^["']|["']$/g, '')
      } else if (key === 'description') {
        frontMatter.description = value.replace(/^["']|["']$/g, '')
      }
    }
  }

  // 处理最后的数组
  if (inArray && currentArray.length > 0) {
    if (currentKey === 'tags') {
      frontMatter.tags = currentArray
    } else if (currentKey === 'categories') {
      frontMatter.categories = currentArray
    }
  }

  return {
    title: frontMatter.title || '',
    date: frontMatter.date || new Date().toISOString(),
    draft: frontMatter.draft ?? true,
    tags: frontMatter.tags || [],
    categories: frontMatter.categories || [],
    description: frontMatter.description,
    ...frontMatter,
  }
}

/**
 * 序列化 Front Matter 为 YAML 格式
 */
function serializeYamlFrontMatter(frontMatter: FrontMatter): string {
  const lines: string[] = []

  lines.push(`title: "${frontMatter.title}"`)
  lines.push(`date: ${formatDateForHugo(frontMatter.date)}`)
  lines.push(`draft: ${frontMatter.draft}`)

  if (frontMatter.description) {
    lines.push(`description: "${frontMatter.description}"`)
  }

  if (frontMatter.tags && frontMatter.tags.length > 0) {
    lines.push('tags:')
    frontMatter.tags.forEach(tag => {
      lines.push(`  - ${tag}`)
    })
  } else {
    lines.push('tags: []')
  }

  if (frontMatter.categories && frontMatter.categories.length > 0) {
    lines.push('categories:')
    frontMatter.categories.forEach(category => {
      lines.push(`  - ${category}`)
    })
  } else {
    lines.push('categories: []')
  }

  // 其他自定义字段
  const standardKeys = ['title', 'date', 'draft', 'description', 'tags', 'categories']
  // 日期相关的字段名
  const dateFieldNames = ['lastmod', 'publishDate', 'expiryDate', 'lastModified', 'updated', 'modified']
  
  for (const [key, value] of Object.entries(frontMatter)) {
    if (standardKeys.includes(key)) continue
    if (value === undefined || value === null || value === '') continue

    if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`)
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`)
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`)
      value.forEach(v => lines.push(`  - ${v}`))
    } else if (typeof value === 'string') {
      // 检查是否是日期字段
      if (dateFieldNames.includes(key) || isDateLikeString(value)) {
        lines.push(`${key}: ${formatDateForHugo(value)}`)
      } else {
        lines.push(`${key}: "${value}"`)
      }
    } else {
      lines.push(`${key}: "${value}"`)
    }
  }

  return lines.join('\n')
}

/**
 * 创建默认 Front Matter
 */
function createDefaultFrontMatter(): FrontMatter {
  return {
    title: '未命名文章',
    date: new Date().toISOString(),
    draft: true,
    tags: [],
    categories: [],
  }
}

/**
 * 格式化日期为 datetime-local 输入框格式
 */
export function formatDateForInput(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) {
      return formatDateForInput(new Date().toISOString())
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (err) {
    console.error('Date format error:', err)
    return formatDateForInput(new Date().toISOString())
  }
}

/**
 * 将 datetime-local 格式转换为 Hugo 兼容的 ISO 日期格式
 */
export function formatDateForHugo(dateString: string): string {
  try {
    // 如果已经是 ISO 格式，直接返回
    if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 11))) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    // datetime-local 格式: 2026-01-29T14:30
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return new Date().toISOString()
    }
    return date.toISOString()
  } catch (err) {
    console.error('Date format error:', err)
    return new Date().toISOString()
  }
}
