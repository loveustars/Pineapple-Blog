<template>
  <div class="h-full overflow-y-auto flex flex-col items-center justify-center p-8">
    <div class="max-w-4xl w-full">
      <!-- Welcome Section -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-800 mb-4">🍍 欢迎使用 Pineappleblog Editor</h2>
        <p class="text-gray-600 text-lg">轻松创建和管理您的静态博客</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          @click="$router.push('/create-blog')"
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-primary-200 hover:border-primary-400 group"
        >
          <div class="text-6xl mb-4">✨</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-primary-600">创建新博客</h3>
          <p class="text-gray-600">选择主题，生成完整的博客项目</p>
        </button>

        <button
          @click="showCreateDialog = true"
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-blue-200 hover:border-blue-400 group"
        >
          <div class="text-6xl mb-4">📦</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">空白项目</h3>
          <p class="text-gray-600">用 Hugo 初始化空项目</p>
        </button>

        <button
          @click="handleOpenProject"
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-green-200 hover:border-green-400 group"
        >
          <div class="text-6xl mb-4">📂</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600">打开项目</h3>
          <p class="text-gray-600">打开现有的 Hugo 项目</p>
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
            :disabled="installingTheme"
            class="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition border border-gray-200 hover:border-primary-300 disabled:opacity-50"
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
      
      <!-- 主题安装进度对话框 -->
      <div v-if="installingTheme" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold mb-4">正在安装主题</h3>
          <div class="flex items-center gap-3">
            <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            <span class="text-gray-600">{{ installProgress }}</span>
          </div>
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
            <div class="flex gap-2">
              <input
                v-model="newProject.path"
                type="text"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/Users/username/projects"
              />
              <button
                @click="selectProjectPath"
                type="button"
                class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
              >
                📁 浏览...
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">静态网站引擎</label>
            <div class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-2xl">⚡</span>
                <div>
                  <div class="font-medium text-gray-800">Hugo</div>
                  <div class="text-xs text-gray-500">快速灵活的静态网站生成器</div>
                </div>
              </div>
            </div>
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
import { open, message, confirm } from '@tauri-apps/plugin-dialog'
import { Command } from '@tauri-apps/plugin-shell'
import { invoke } from '@tauri-apps/api/core'
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
  engine: 'Hugo' as 'Hugo',
})

// 主题安装状态
const installingTheme = ref(false)
const installProgress = ref('')

const recentProjects = computed(() => projectStore.recentProjects)

// 主题仓库信息（按用户手动操作的四步流程配置）
const themeRepoInfo: Record<string, { repo: string; tag?: string; branch?: string; folder: string }> = {
  stack: { repo: 'https://github.com/CaiJimmy/hugo-theme-stack', tag: 'v3.34.1', folder: 'hugo-theme-stack' },
  papermod: { repo: 'https://github.com/adityatelange/hugo-PaperMod', folder: 'PaperMod' },
  loveit: { repo: 'https://github.com/dillonzq/LoveIt', tag: 'v0.3.0', folder: 'LoveIt' },
  blowfish: { repo: 'https://github.com/nunocoracao/blowfish', branch: 'main', folder: 'blowfish' },
  congo: { repo: 'https://github.com/jpanther/congo', folder: 'congo' },
  docsy: { repo: 'https://github.com/google/docsy', folder: 'docsy' },
}

// 检查主题是否已安装
async function checkThemeInstalled(projectPath: string, theme: string): Promise<boolean> {
  if (!theme || theme === 'default') return true
  
  const themeInfo = themeRepoInfo[theme.toLowerCase()]
  if (!themeInfo) return true // 未知主题，假设已安装
  
  try {
    // 检查 themes 文件夹下是否有主题
    const exists = await invoke<boolean>('check_path_exists', { 
      path: `${projectPath}/themes/${themeInfo.folder}`
    })
    return exists
  } catch (e) {
    // 如果命令不存在，fallback
    return true
  }
}

// 安装主题
async function installTheme(projectPath: string, theme: string): Promise<boolean> {
  const themeInfo = themeRepoInfo[theme.toLowerCase()]
  if (!themeInfo) return false

  installingTheme.value = true
  installProgress.value = '步骤 1/4: 正在初始化 Git 仓库...'
  
  try {
    // 步骤 1: git init
    try {
      const gitInit = Command.create('run-git', ['init'], { cwd: projectPath })
      const initResult = await gitInit.execute()
      console.log('git init:', initResult.code, initResult.stdout, initResult.stderr)
    } catch (e) {
      console.log('git init 跳过')
    }
    
    installProgress.value = `步骤 2/4: 正在下载 ${theme} 主题...`
    
    // 步骤 2: git submodule add
    const submoduleArgs = ['submodule', 'add']
    if (themeInfo.branch) {
      submoduleArgs.push('-b', themeInfo.branch)
    }
    submoduleArgs.push(themeInfo.repo, `themes/${themeInfo.folder}`)
    
    console.log('执行命令: git', submoduleArgs.join(' '))
    const gitSubmodule = Command.create('run-git', submoduleArgs, { cwd: projectPath })
    const output = await gitSubmodule.execute()
    
    console.log('git submodule add:', output.code, output.stdout, output.stderr)
    
    if (output.code !== 0) {
      const errorMsg = output.stderr || ''
      if (errorMsg.includes('already exists')) {
        installProgress.value = '主题目录已存在，尝试更新...'
        const gitUpdate = Command.create('run-git', ['submodule', 'update', '--init', '--recursive'], { cwd: projectPath })
        await gitUpdate.execute()
      } else {
        console.error('Git submodule 错误:', errorMsg)
        throw new Error(errorMsg || '添加 submodule 失败')
      }
    }
    
    // 步骤 3: cd themes/xxx
    const themePath = `${projectPath}/themes/${themeInfo.folder}`
    
    // 步骤 4: git checkout tag
    if (themeInfo.tag) {
      installProgress.value = `步骤 3/4: 正在切换到 ${themeInfo.tag} 版本...`
      const gitCheckout = Command.create('run-git', ['checkout', themeInfo.tag], { cwd: themePath })
      const checkoutResult = await gitCheckout.execute()
      console.log('git checkout:', checkoutResult.code, checkoutResult.stdout, checkoutResult.stderr)
    }
    
    installProgress.value = '步骤 4/4: 主题安装完成！'
    return true
  } catch (err) {
    console.error('主题安装失败:', err)
    installProgress.value = `安装失败: ${err}`
    return false
  } finally {
    installingTheme.value = false
  }
}

const selectProjectPath = async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择项目父目录',
  })

  if (selected && typeof selected === 'string') {
    newProject.value.path = selected
  }
}

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
      // 检查主题是否已安装
      if (project.theme && project.theme !== 'default') {
        const themeInstalled = await checkThemeInstalled(project.path, project.theme)
        
        if (!themeInstalled) {
          const shouldInstall = await confirm(
            `检测到项目使用 ${project.theme} 主题，但主题文件不存在。\n是否自动下载并安装主题？`,
            { title: '安装主题', kind: 'info' }
          )
          
          if (shouldInstall) {
            const success = await installTheme(project.path, project.theme)
            if (!success) {
              await message(
                `主题安装失败，请手动安装：\ngit submodule add <theme-repo> themes/<theme-folder>`,
                { title: '提示', kind: 'warning' }
              )
            }
          }
        }
      }
      
      projectStore.setCurrentProject(project)
      projectStore.addProject(project)
      router.push({ name: 'project', params: { id: project.id } })
    }
  }
}

const handleOpenRecentProject = async (project: Project) => {
  // 检查主题是否已安装
  if (project.theme && project.theme !== 'default') {
    const themeInstalled = await checkThemeInstalled(project.path, project.theme)
    
    if (!themeInstalled) {
      const shouldInstall = await confirm(
        `检测到项目使用 ${project.theme} 主题，但主题文件不存在。\n是否自动下载并安装主题？`,
        { title: '安装主题', kind: 'info' }
      )
      
      if (shouldInstall) {
        const success = await installTheme(project.path, project.theme)
        if (!success) {
          await message(
            `主题安装失败，请手动安装：\ngit submodule add <theme-repo> themes/<theme-folder>`,
            { title: '提示', kind: 'warning' }
          )
        }
      }
    }
  }
  
  projectStore.setCurrentProject(project)
  router.push({ name: 'project', params: { id: project.id } })
}
</script>
