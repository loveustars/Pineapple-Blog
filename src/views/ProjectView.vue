<template>
  <div class="h-full flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h2 class="font-bold text-lg text-gray-800 truncate">{{ currentProject?.name }}</h2>
        <p class="text-xs text-gray-500 truncate">{{ currentProject?.path }}</p>
      </div>

      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          @click="showNewPostDialog = true"
          class="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
        >
          ✍️ 新建文章
        </button>

        <div class="pt-4">
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">文章列表</h3>
          <div v-if="loadingPosts" class="text-sm text-gray-500">
            <p>加载中...</p>
          </div>
          <div v-else-if="posts.length === 0" class="text-sm text-gray-600">
            <p>暂无文章</p>
          </div>
          <div v-else class="space-y-1">
            <button
              v-for="post in posts"
              :key="post.path"
              @click="openPost(post)"
              class="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition text-gray-700 truncate"
            >
              📄 {{ post.title }}
            </button>
          </div>
        </div>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <button
          @click="router.push('/')"
          class="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          ← 返回首页
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col bg-gray-50">
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center max-w-md">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">开始创作</h3>
          <p class="text-gray-600 mb-6">点击"新建文章"按钮开始编写您的第一篇博客文章</p>
          
          <div class="bg-white rounded-lg p-6 shadow-sm space-y-3 text-left">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚙️</span>
              <div>
                <div class="font-medium text-gray-800">引擎</div>
                <div class="text-sm text-gray-500">{{ currentProject?.engine }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎨</span>
              <div>
                <div class="font-medium text-gray-800">主题</div>
                <div class="text-sm text-gray-500">{{ currentProject?.theme || '默认主题' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- New Post Dialog -->
    <div v-if="showNewPostDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-2xl font-bold mb-6">新建文章</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
            <input
              v-model="newPostTitle"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="我的第一篇文章"
              @keyup.enter="handleCreatePost"
            />
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {{ successMessage }}
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showNewPostDialog = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="handleCreatePost"
            :disabled="loading || !newPostTitle"
            class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useProject } from '@/composables/useProject'
import type { Project, PostInfo } from '@/types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const { createPost, listPosts, loading, error } = useProject()

const showNewPostDialog = ref(false)
const newPostTitle = ref('')
const successMessage = ref('')
const posts = ref<PostInfo[]>([])
const loadingPosts = ref(false)

const currentProject = computed(() => projectStore.currentProject)

const loadPosts = async () => {
  if (!currentProject.value) return
  
  loadingPosts.value = true
  posts.value = await listPosts(
    currentProject.value.path,
    currentProject.value.engine
  )
  loadingPosts.value = false
}

const openPost = (post: PostInfo) => {
  // Store selected post and navigate to editor
  router.push({
    name: 'editor',
    params: { id: currentProject.value?.id },
    query: { postPath: post.path }
  })
}

const handleCreatePost = async () => {
  if (!currentProject.value || !newPostTitle.value) return

  successMessage.value = ''
  const postPath = await createPost(
    currentProject.value.path,
    currentProject.value.engine,
    newPostTitle.value
  )

  if (postPath) {
    successMessage.value = `文章创建成功: ${postPath}`
    // Reload posts list
    await loadPosts()
    setTimeout(() => {
      showNewPostDialog.value = false
      newPostTitle.value = ''
      successMessage.value = ''
    }, 2000)
  }
}

onMounted(async () => {
  // Load project if not already loaded
  if (!currentProject.value) {
    const projectId = route.params.id
    // Try to find in recent projects
    const project = projectStore.recentProjects.find((p: Project) => p.id === projectId)
    if (project) {
      projectStore.setCurrentProject(project)
    }
  }
  
  // Load posts
  await loadPosts()
})
</script>
