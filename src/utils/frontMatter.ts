import type { FrontMatter } from '@/types'

/**
 * 解析 Hugo 文章内容，分离 Front Matter 和 Markdown 内容
 */
export function parseHugoPost(content: string): {
  frontMatter: FrontMatter
  markdown: string
} {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    // 没有 Front Matter，创建默认值
    return {
      frontMatter: createDefaultFrontMatter(),
      markdown: content,
    }
  }

  const frontMatterText = match[1]
  const markdown = match[2]

  try {
    const frontMatter = parseFrontMatter(frontMatterText)
    return { frontMatter, markdown }
  } catch (err) {
    console.error('Failed to parse front matter:', err)
    return {
      frontMatter: createDefaultFrontMatter(),
      markdown: content,
    }
  }
}

/**
 * 序列化 Front Matter 和 Markdown 内容为完整的 Hugo 文章
 */
export function serializeHugoPost(frontMatter: FrontMatter, markdown: string): string {
  const frontMatterText = serializeFrontMatter(frontMatter)
  return `---\n${frontMatterText}\n---\n${markdown}`
}

/**
 * 解析 YAML Front Matter 文本
 */
function parseFrontMatter(text: string): FrontMatter {
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
  }
}

/**
 * 序列化 Front Matter 为 YAML 格式
 */
function serializeFrontMatter(frontMatter: FrontMatter): string {
  const lines: string[] = []

  lines.push(`title: "${frontMatter.title}"`)
  lines.push(`date: ${frontMatter.date}`)
  lines.push(`draft: ${frontMatter.draft}`)

  if (frontMatter.description) {
    lines.push(`description: "${frontMatter.description}"`)
  }

  if (frontMatter.tags.length > 0) {
    lines.push('tags:')
    frontMatter.tags.forEach(tag => {
      lines.push(`  - ${tag}`)
    })
  } else {
    lines.push('tags: []')
  }

  if (frontMatter.categories.length > 0) {
    lines.push('categories:')
    frontMatter.categories.forEach(category => {
      lines.push(`  - ${category}`)
    })
  } else {
    lines.push('categories: []')
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
