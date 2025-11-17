<template>
  <div id="app" class="h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-6 py-3">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-primary-600">🍍 Pineappleblog Editor</h1>
          <span class="text-sm text-gray-500">v1.0.0</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="currentProject"
            @click="handleBuild"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            :disabled="isBuilding"
          >
            {{ isBuilding ? '构建中...' : '构建站点' }}
          </button>
          <button
            v-if="currentProject"
            @click="handleServe"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            :disabled="isServing"
          >
            {{ isServing ? '运行中...' : '启动预览' }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>

    <footer class="bg-white border-t border-gray-200 px-6 py-2 text-xs text-gray-500 flex items-center justify-between">
      <div>
        <span v-if="currentProject">当前项目: {{ currentProject.name }}</span>
        <span v-else>未打开项目</span>
      </div>
      <div v-if="statusMessage" class="text-primary-600">
        {{ statusMessage }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useProject } from '@/composables/useProject'

const projectStore = useProjectStore()
const { buildProject, serveProject } = useProject()

const isBuilding = ref(false)
const isServing = ref(false)
const statusMessage = ref('')

const currentProject = computed(() => projectStore.currentProject)

const handleBuild = async () => {
  if (!currentProject.value) return

  isBuilding.value = true
  statusMessage.value = '正在构建站点...'

  const result = await buildProject(currentProject.value.path, currentProject.value.engine, {
    minify: true,
    clean: true,
    draft: false,
  })

  isBuilding.value = false

  if (result?.success) {
    statusMessage.value = `构建成功！耗时 ${result.duration.toFixed(2)}s`
    setTimeout(() => {
      statusMessage.value = ''
    }, 5000)
  } else {
    statusMessage.value = '构建失败，请查看控制台'
  }
}

const handleServe = async () => {
  if (!currentProject.value) return

  isServing.value = true
  statusMessage.value = '正在启动预览服务器...'

  const success = await serveProject(currentProject.value.path, currentProject.value.engine, 1313)

  if (success) {
    statusMessage.value = '预览服务器已启动: http://localhost:1313'
  } else {
    isServing.value = false
    statusMessage.value = '启动失败'
  }
}

onMounted(() => {
  projectStore.loadRecentProjects()
})
</script>
