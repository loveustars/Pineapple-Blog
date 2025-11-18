// Markdown 预览相关的组合式函数
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function useMarkdownPreview() {
  const parse = async (markdown: string): Promise<string> => {
    try {
      return await marked.parse(markdown)
    } catch (err) {
      console.error('Markdown parse error:', err)
      return '<p class="text-red-500">解析错误</p>'
    }
  }

  return {
    parse,
    debounce,
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = window.setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
