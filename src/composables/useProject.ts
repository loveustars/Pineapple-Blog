import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Project, BuildOptions, BuildResult, PostInfo } from '@/types'

export function useProject() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createProject = async (
    name: string,
    path: string,
    engine: 'Hugo' | 'Zola'
  ): Promise<Project | null> => {
    loading.value = true
    error.value = null

    try {
      const project = await invoke<Project>('create_project', {
        name,
        path,
        engine,
      })
      return project
    } catch (e) {
      error.value = String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  const openProject = async (path: string): Promise<Project | null> => {
    loading.value = true
    error.value = null

    try {
      const project = await invoke<Project>('open_project', { path })
      return project
    } catch (e) {
      error.value = String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  const buildProject = async (
    projectPath: string,
    engine: 'Hugo' | 'Zola',
    options: BuildOptions
  ): Promise<BuildResult | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await invoke<BuildResult>('build_project', {
        projectPath,
        engine,
        options,
      })
      return result
    } catch (e) {
      error.value = String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  const serveProject = async (
    projectPath: string,
    engine: 'Hugo' | 'Zola',
    port: number = 1313
  ): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await invoke('serve_project', {
        projectPath,
        engine,
        port,
      })
      return true
    } catch (e) {
      error.value = String(e)
      return false
    } finally {
      loading.value = false
    }
  }

  const createPost = async (
    projectPath: string,
    engine: 'Hugo' | 'Zola',
    title: string
  ): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const postPath = await invoke<string>('create_post', {
        projectPath,
        engine,
        title,
      })
      return postPath
    } catch (e) {
      error.value = String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  const getEngineVersion = async (engine: 'Hugo' | 'Zola'): Promise<string | null> => {
    try {
      const version = await invoke<string>('get_engine_version', { engine })
      return version
    } catch (e) {
      error.value = String(e)
      return null
    }
  }

  const listPosts = async (
    projectPath: string,
    engine: 'Hugo' | 'Zola'
  ): Promise<PostInfo[]> => {
    loading.value = true
    error.value = null

    try {
      const posts = await invoke<PostInfo[]>('list_posts', {
        projectPath,
        engine,
      })
      return posts
    } catch (e) {
      error.value = String(e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createProject,
    openProject,
    buildProject,
    serveProject,
    createPost,
    getEngineVersion,
    listPosts,
  }
}
