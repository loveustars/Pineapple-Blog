export interface Project {
  id: string
  name: string
  path: string
  engine: 'Hugo' | 'Zola'
  theme?: string
  config: ProjectConfig
  created_at: string
  updated_at: string
}

export interface ProjectConfig {
  title: string
  base_url: string
  language: string
  description?: string
}

export interface BuildOptions {
  minify: boolean
  clean: boolean
  draft: boolean
}

export interface BuildResult {
  success: boolean
  duration: number
  output: string
  errors: string[]
}

export interface PostInfo {
  title: string
  path: string
  date?: string
}

export interface Post {
  title: string
  path: string
  content: string
  front_matter: FrontMatter
}

export interface FrontMatter {
  title: string
  date: string
  draft: boolean
  tags: string[]
  categories: string[]
  description?: string
}
