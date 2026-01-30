<template>
  <div class="h-full flex">
    <!-- Sidebar -->
    <aside class="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h2 class="font-bold text-lg text-gray-800 truncate">{{ currentProject?.name }}</h2>
        <p class="text-xs text-gray-500 truncate">{{ currentProject?.path }}</p>
        <div class="flex items-center gap-2 mt-2">
          <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{{ currentProject?.engine }}</span>
          <span v-if="currentProject?.theme" class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
            {{ currentProject?.theme }}
          </span>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-4 overflow-y-auto">
        <button
          @click="showNewPostDialog = true"
          class="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
        >
          ✍️ 新建文章
        </button>

        <!-- Content Structure -->
        <div class="space-y-3">
          <!-- Posts Section -->
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                📝 <span>文章</span>
              </h3>
              <span class="text-xs text-gray-500">{{ postsByCategory.posts?.length || 0 }}</span>
            </div>
            <div v-if="loadingPosts" class="text-sm text-gray-500">加载中...</div>
            <div v-else-if="!postsByCategory.posts?.length" class="text-sm text-gray-500">暂无文章</div>
            <div v-else class="space-y-1 max-h-48 overflow-y-auto">
              <div
                v-for="post in postsByCategory.posts"
                :key="post.path"
                class="group flex items-center gap-1"
              >
                <button
                  @click="openPost(post)"
                  class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-white transition text-gray-700 truncate"
                >
                  {{ post.title }}
                </button>
                <button
                  @click.stop="confirmDeletePost(post)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                  title="删除文章"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Pages Section -->
          <div v-if="postsByCategory.pages?.length" class="bg-yellow-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                📄 <span>页面</span>
              </h3>
              <span class="text-xs text-gray-500">{{ postsByCategory.pages?.length }}</span>
            </div>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div
                v-for="page in postsByCategory.pages"
                :key="page.path"
                class="group flex items-center gap-1"
              >
                <button
                  @click="openPost(page)"
                  class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-white transition text-gray-700 truncate"
                >
                  {{ page.title }}
                </button>
                <button
                  @click.stop="confirmDeletePost(page)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                  title="删除页面"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Docs Section (for Docsy) -->
          <div v-if="postsByCategory.docs?.length" class="bg-blue-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                📖 <span>文档</span>
              </h3>
              <span class="text-xs text-gray-500">{{ postsByCategory.docs?.length }}</span>
            </div>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div
                v-for="doc in postsByCategory.docs"
                :key="doc.path"
                class="group flex items-center gap-1"
              >
                <button
                  @click="openPost(doc)"
                  class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-white transition text-gray-700 truncate"
                >
                  {{ doc.title }}
                </button>
                <button
                  @click.stop="confirmDeletePost(doc)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                  title="删除文档"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Blog Section (for Docsy) -->
          <div v-if="postsByCategory.blog?.length" class="bg-green-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                📰 <span>博客</span>
              </h3>
              <span class="text-xs text-gray-500">{{ postsByCategory.blog?.length }}</span>
            </div>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div
                v-for="post in postsByCategory.blog"
                :key="post.path"
                class="group flex items-center gap-1"
              >
                <button
                  @click="openPost(post)"
                  class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-white transition text-gray-700 truncate"
                >
                  {{ post.title }}
                </button>
                <button
                  @click.stop="confirmDeletePost(post)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                  title="删除博客"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- Other Content -->
          <div v-if="postsByCategory.other?.length" class="bg-gray-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                📁 <span>其他</span>
              </h3>
              <span class="text-xs text-gray-500">{{ postsByCategory.other?.length }}</span>
            </div>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              <div
                v-for="item in postsByCategory.other"
                :key="item.path"
                class="group flex items-center gap-1"
              >
                <button
                  @click="openPost(item)"
                  class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-white transition text-gray-700 truncate"
                >
                  {{ item.title }}
                </button>
                <button
                  @click.stop="confirmDeletePost(item)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition"
                  title="删除文件"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="p-4 border-t border-gray-200 space-y-2">
        <button
          @click="showSettingsDialog = true"
          class="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          ⚙️ 项目设置
        </button>
        <button
          @click="handleBuild"
          :disabled="building"
          class="w-full px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition text-sm disabled:opacity-50"
        >
          {{ building ? '🔄 构建中...' : '🚀 构建网站' }}
        </button>
        <button
          @click="handleServe"
          class="w-full px-4 py-2 text-white rounded-lg transition text-sm"
          :class="serving ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'"
        >
          {{ serving ? '⏹ 停止预览' : '▶ 预览网站' }}
        </button>
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

    <!-- Project Settings Dialog -->
    <ProjectSettings
      v-if="showSettingsDialog"
      :project-path="currentProject?.path || ''"
      @close="showSettingsDialog = false"
      @saved="handleSettingsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useProject } from '@/composables/useProject'
import { invoke } from '@tauri-apps/api/core'
import type { Project, PostInfo } from '@/types'
import ProjectSettings from '@/components/ProjectSettings.vue'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const { createPost, listPosts, loading, error } = useProject()

const showNewPostDialog = ref(false)
const showSettingsDialog = ref(false)
const newPostTitle = ref('')
const successMessage = ref('')
const posts = ref<PostInfo[]>([])
const loadingPosts = ref(false)
const building = ref(false)
const serving = ref(false)
const buildOutput = ref('')
const serveUrl = ref('')

const currentProject = computed(() => projectStore.currentProject)

// Categorize posts by their path
const postsByCategory = computed(() => {
  const categories: {
    posts: PostInfo[];
    pages: PostInfo[];
    docs: PostInfo[];
    blog: PostInfo[];
    other: PostInfo[];
  } = {
    posts: [],
    pages: [],
    docs: [],
    blog: [],
    other: []
  }

  for (const post of posts.value) {
    const path = post.path.toLowerCase().replace(/\\/g, '/')
    
    if (path.includes('/posts/') || path.includes('/post/')) {
      categories.posts.push(post)
    } else if (path.includes('/page/') || path.includes('/pages/') || 
               path.endsWith('/about/index.md') || path.endsWith('/archives.md') || 
               path.endsWith('/search.md') || path.endsWith('/links.md')) {
      categories.pages.push(post)
    } else if (path.includes('/docs/')) {
      categories.docs.push(post)
    } else if (path.includes('/blog/')) {
      categories.blog.push(post)
    } else {
      categories.other.push(post)
    }
  }

  return categories
})

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

// 确认删除文章
const confirmDeletePost = async (post: PostInfo) => {
  if (!confirm(`确定要删除 "${post.title}" 吗？此操作不可恢复！`)) {
    return
  }
  
  try {
    await invoke('delete_post', { filePath: post.path })
    alert('删除成功！')
    await loadPosts()
  } catch (err) {
    alert(`删除失败: ${err}`)
  }
}

// 处理设置保存
const handleSettingsSaved = () => {
  alert('设置已保存！')
  showSettingsDialog.value = false
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

const handleBuild = async () => {
  if (!currentProject.value) return
  
  building.value = true
  buildOutput.value = ''
  
  try {
    const result = await invoke<{ success: boolean; output: string; error?: string }>('build_site', {
      projectPath: currentProject.value.path,
      engineType: currentProject.value.engine
    })
    
    if (result.success) {
      buildOutput.value = '✅ 构建成功！'
      alert('网站构建成功！输出目录: public/')
    } else {
      buildOutput.value = `❌ 构建失败: ${result.error || result.output}`
      alert(`构建失败: ${result.error || result.output}`)
    }
  } catch (e: any) {
    buildOutput.value = `❌ 构建错误: ${e}`
    alert(`构建错误: ${e}`)
  } finally {
    building.value = false
  }
}

const handleServe = async () => {
  if (!currentProject.value) return
  
  // 如果已经在运行，则停止服务器
  if (serving.value) {
    try {
      await invoke('stop_serve', { projectPath: currentProject.value.path })
      serving.value = false
      serveUrl.value = ''
    } catch (e: any) {
      alert(`停止预览服务器失败: ${e}`)
    }
    return
  }
  
  // 启动服务器
  serving.value = true
  
  try {
    const result = await invoke<{ success: boolean; url?: string; error?: string }>('serve_site', {
      projectPath: currentProject.value.path,
      engineType: currentProject.value.engine,
      port: 1313
    })
    
    if (result.success && result.url) {
      serveUrl.value = result.url
      // Open in system browser
      window.open(result.url, '_blank')
    } else {
      alert(`启动预览服务器失败: ${result.error}`)
      serving.value = false
    }
  } catch (e: any) {
    alert(`启动预览服务器错误: ${e}`)
    serving.value = false
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

onUnmounted(() => {
  // Stop serve if running
  if (serving.value && currentProject.value) {
    invoke('stop_serve', { projectPath: currentProject.value.path }).catch(() => {})
    serving.value = false
  }
})
</script>
