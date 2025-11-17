import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '@/types'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const recentProjects = ref<Project[]>([])

  const setCurrentProject = (project: Project | null) => {
    currentProject.value = project
    if (project) {
      addToRecent(project)
    }
  }

  const addProject = (project: Project) => {
    const index = projects.value.findIndex((p: Project) => p.id === project.id)
    if (index >= 0) {
      projects.value[index] = project
    } else {
      projects.value.push(project)
    }
  }

  const removeProject = (projectId: string) => {
    projects.value = projects.value.filter((p: Project) => p.id !== projectId)
    recentProjects.value = recentProjects.value.filter((p: Project) => p.id !== projectId)
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
    }
  }

  const addToRecent = (project: Project) => {
    recentProjects.value = recentProjects.value.filter((p: Project) => p.id !== project.id)
    recentProjects.value.unshift(project)
    if (recentProjects.value.length > 5) {
      recentProjects.value = recentProjects.value.slice(0, 5)
    }
    saveRecentProjects()
  }

  const loadRecentProjects = () => {
    const stored = localStorage.getItem('recent-projects')
    if (stored) {
      try {
        recentProjects.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load recent projects:', e)
      }
    }
  }

  const saveRecentProjects = () => {
    localStorage.setItem('recent-projects', JSON.stringify(recentProjects.value))
  }

  return {
    projects,
    currentProject,
    recentProjects,
    setCurrentProject,
    addProject,
    removeProject,
    loadRecentProjects,
  }
})
