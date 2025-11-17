<template>
  <div class="h-full flex flex-col items-center justify-center p-8">
    <div class="max-w-4xl w-full">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-800 mb-4">欢迎使用 Pineappleblog Editor</h2>
        <p class="text-gray-600 text-lg">轻松创建和管理您的静态博客</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <button
          @click="showCreateDialog = true"
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-primary-200 hover:border-primary-400 group"
        >
          <div class="text-6xl mb-4">📦</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-primary-600">创建新项目</h3>
          <p class="text-gray-600">从头开始创建一个全新的博客项目</p>
        </button>

        <button
          @click="handleOpenProject"
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-green-200 hover:border-green-400 group"
        >
          <div class="text-6xl mb-4">📂</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">打开项目</h3>
          <p class="text-gray-600">打开现有的 Hugo 或 Zola 项目</p>
        </button>
      </div>

      <!-- Recent Projects -->
      <div v-if="recentProjects.length > 0" class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">最近的项目</h3>
        <div class="space-y-2">
          <button
            v-for="project in recentProjects"
            :key="project.id"
            @click="handleOpenRecentProject(project)"
            class="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-primary-300"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-800">{{ project.name }}</div>
                <div class="text-sm text-gray-500">{{ project.path }}</div>
              </div>
              <div class="text-sm text-gray-400">
                {{ project.engine }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Project Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-2xl font-bold mb-6">创建新项目</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="my-blog"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">项目路径</label>
            <input
              v-model="newProject.path"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="/Users/username/projects"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">静态引擎</label>
            <select
              v-model="newProject.engine"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Hugo">Hugo</option>
              <option value="Zola">Zola</option>
            </select>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showCreateDialog = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="handleCreateProject"
            :disabled="loading || !newProject.name || !newProject.path"
            class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '创建中...' : '创建项目' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-dialog'
import { useProjectStore } from '@/stores/projectStore'
import { useProject } from '@/composables/useProject'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const { createProject, openProject, loading, error } = useProject()

const showCreateDialog = ref(false)
const newProject = ref({
  name: '',
  path: '',
  engine: 'Hugo' as 'Hugo' | 'Zola',
})

const recentProjects = computed(() => projectStore.recentProjects)

const handleCreateProject = async () => {
  const project = await createProject(
    newProject.value.name,
    newProject.value.path,
    newProject.value.engine
  )

  if (project) {
    projectStore.setCurrentProject(project)
    projectStore.addProject(project)
    showCreateDialog.value = false
    router.push({ name: 'project', params: { id: project.id } })
  }
}

const handleOpenProject = async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择项目文件夹',
  })

  if (selected && typeof selected === 'string') {
    const project = await openProject(selected)
    if (project) {
      projectStore.setCurrentProject(project)
      projectStore.addProject(project)
      router.push({ name: 'project', params: { id: project.id } })
    }
  }
}

const handleOpenRecentProject = async (project: Project) => {
  projectStore.setCurrentProject(project)
  router.push({ name: 'project', params: { id: project.id } })
}
</script>
