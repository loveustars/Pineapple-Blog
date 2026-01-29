<template>
  <div class="h-screen overflow-y-auto bg-gradient-to-br from-green-50 to-blue-50 p-8">
    <div class="max-w-4xl mx-auto pb-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">🍍 创建新博客</h1>
        <p class="text-gray-600">选择主题并配置您的博客</p>
      </div>

      <!-- Steps -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center space-x-4">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex items-center"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all',
                currentStep > index 
                  ? 'bg-green-500 text-white' 
                  : currentStep === index 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              ]"
            >
              <span v-if="currentStep > index">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span 
              :class="[
                'ml-2 text-sm',
                currentStep >= index ? 'text-gray-800' : 'text-gray-400'
              ]"
            >
              {{ step }}
            </span>
            <div v-if="index < steps.length - 1" class="w-12 h-0.5 mx-3 bg-gray-200"></div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Step 1: Choose Theme -->
        <div v-if="currentStep === 0">
          <h2 class="text-xl font-semibold mb-6">选择博客主题</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="theme in themes"
              :key="theme.id"
              @click="selectTheme(theme.id)"
              :class="[
                'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg',
                selectedTheme === theme.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300'
              ]"
            >
              <div class="text-3xl mb-2">{{ theme.icon }}</div>
              <h3 class="font-medium text-gray-800">{{ theme.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ theme.description }}</p>
              <div class="flex flex-wrap gap-1 mt-2">
                <span 
                  v-for="feature in theme.features.slice(0, 3)" 
                  :key="feature"
                  class="text-xs px-2 py-0.5 bg-gray-100 rounded"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Blog Info -->
        <div v-else-if="currentStep === 1">
          <h2 class="text-xl font-semibold mb-6">博客基本信息</h2>
          <div class="space-y-4 max-w-md">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">博客名称 *</label>
              <input
                v-model="blogConfig.title"
                type="text"
                placeholder="我的技术博客"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">博客描述</label>
              <textarea
                v-model="blogConfig.description"
                placeholder="记录技术探索与生活感悟"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作者名称</label>
              <input
                v-model="blogConfig.author"
                type="text"
                placeholder="Your Name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">网站地址</label>
              <input
                v-model="blogConfig.baseURL"
                type="text"
                placeholder="https://yourblog.com/"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">语言</label>
              <select
                v-model="blogConfig.language"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="zh-cn">简体中文</option>
                <option value="zh-tw">繁体中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 3: Choose Location -->
        <div v-else-if="currentStep === 2">
          <h2 class="text-xl font-semibold mb-6">选择存储位置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">项目文件夹</label>
              <div class="flex gap-2">
                <input
                  v-model="projectPath"
                  type="text"
                  placeholder="选择或输入文件夹路径"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  @click="selectFolder"
                  class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                >
                  📁 选择
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">博客文件将创建在此文件夹中</p>
            </div>

            <!-- Directory Structure Preview -->
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-700 mb-2">目录结构预览</h3>
              <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <pre class="text-gray-600 whitespace-pre">{{ directoryPreview }}</pre>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ themeDescription }}</p>
            </div>
          </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div v-else-if="currentStep === 3">
          <h2 class="text-xl font-semibold mb-6">确认并创建</h2>
          
          <div class="bg-gray-50 rounded-xl p-6 space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">主题</span>
              <span class="font-medium">{{ selectedThemeInfo?.icon }} {{ selectedThemeInfo?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">博客名称</span>
              <span class="font-medium">{{ blogConfig.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">作者</span>
              <span class="font-medium">{{ blogConfig.author }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">位置</span>
              <span class="font-medium text-sm">{{ projectPath }}</span>
            </div>
          </div>

          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>📌 主题安装：</strong>创建完成后将自动下载并安装主题文件。
            </p>
          </div>

          <!-- Progress -->
          <div v-if="creating || installingTheme" class="mt-6">
            <div class="flex items-center gap-3">
              <div class="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <span class="text-gray-600">
                {{ installingTheme ? '正在下载主题...' : '正在创建博客...' }}
              </span>
            </div>
            <div v-if="installProgress" class="mt-2 text-sm text-gray-500">
              {{ installProgress }}
            </div>
          </div>

          <!-- Result -->
          <div v-if="createResult" class="mt-6">
            <div 
              :class="[
                'p-4 rounded-lg',
                createResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              ]"
            >
              <p :class="createResult.success ? 'text-green-800' : 'text-red-800'">
                {{ createResult.success ? '✅ 博客创建成功！' : '❌ 创建失败' }}
              </p>
              <p v-if="createResult.success" class="text-sm text-green-600 mt-1">
                已创建 {{ createResult.files_created.length }} 个文件
              </p>
              <p v-if="themeInstalled" class="text-sm text-green-600 mt-1">
                ✅ 主题已安装
              </p>
              <p v-if="themeInstallError" class="text-sm text-yellow-600 mt-1">
                ⚠️ 主题安装失败，请手动安装: <code class="bg-yellow-100 px-1 rounded">{{ themeInstallCommand }}</code>
              </p>
              <ul v-if="createResult.errors.length" class="text-sm text-red-600 mt-2 list-disc list-inside">
                <li v-for="err in createResult.errors" :key="err">{{ err }}</li>
              </ul>
            </div>
            
            <!-- 自动打开提示 -->
            <div v-if="createResult.success && autoOpenEnabled" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span class="text-blue-700 text-sm">
                {{ autoOpenCountdown > 0 ? `${autoOpenCountdown} 秒后自动打开项目...` : '正在打开项目...' }}
              </span>
              <button 
                @click="cancelAutoOpen" 
                class="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                取消
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            v-if="currentStep > 0 && !createResult?.success"
            @click="prevStep"
            class="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            ← 上一步
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button
              @click="goBack"
              class="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              {{ createResult?.success ? '返回首页' : '取消' }}
            </button>
            
            <button
              v-if="currentStep < steps.length - 1"
              @click="nextStep"
              :disabled="!canProceed"
              :class="[
                'px-6 py-2 rounded-lg font-medium transition',
                canProceed 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >
              下一步 →
            </button>
            
            <button
              v-else-if="!createResult?.success"
              @click="createBlogAndInstallTheme"
              :disabled="creating || installingTheme"
              class="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {{ creating ? '创建中...' : installingTheme ? '安装主题中...' : '🚀 创建博客' }}
            </button>

            <button
              v-else
              @click="openProject"
              class="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition"
            >
              打开项目 →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { Command } from '@tauri-apps/plugin-shell'
import { useProjectStore } from '@/stores/projectStore'
import { THEME_CONFIGS, type HugoTheme } from '@/utils/themeConfig'
import { getBlogTemplates, getThemeDirectoryInfo, getThemeInstallCommand, type BlogConfig } from '@/utils/blogTemplates'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()

const steps = ['选择主题', '基本信息', '存储位置', '确认创建']
const currentStep = ref(0)

const selectedTheme = ref<HugoTheme>('papermod')
const projectPath = ref('')
const creating = ref(false)
const installingTheme = ref(false)
const installProgress = ref('')
const themeInstalled = ref(false)
const themeInstallError = ref(false)
const createResult = ref<{ success: boolean; files_created: string[]; errors: string[] } | null>(null)

const blogConfig = ref<BlogConfig>({
  title: '我的博客',
  description: '记录技术探索与生活感悟',
  author: '',
  baseURL: 'https://example.com/',
  language: 'zh-cn',
  theme: 'papermod',
})

// 主题列表
const themes = computed(() => {
  return Object.values(THEME_CONFIGS).filter(t => t.id !== 'default')
})

const selectedThemeInfo = computed(() => {
  return THEME_CONFIGS[selectedTheme.value]
})

const directoryPreview = computed(() => {
  const info = getThemeDirectoryInfo(selectedTheme.value)
  return info.structure
})

const themeDescription = computed(() => {
  const info = getThemeDirectoryInfo(selectedTheme.value)
  return info.description
})

const themeInstallCommand = computed(() => {
  return getThemeInstallCommand(selectedTheme.value)
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return !!selectedTheme.value
    case 1:
      return !!blogConfig.value.title.trim()
    case 2:
      return !!projectPath.value.trim()
    default:
      return true
  }
})

function selectTheme(themeId: HugoTheme) {
  selectedTheme.value = themeId
  blogConfig.value.theme = themeId
}

function nextStep() {
  if (currentStep.value < steps.length - 1 && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function selectFolder() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择博客存储位置',
    })
    
    if (selected) {
      projectPath.value = selected as string
    }
  } catch (err) {
    console.error('选择文件夹失败:', err)
  }
}

// 主题安装信息
// 注意: tag 是 git tag，不能用 -b 参数，需要先 clone 再 checkout
const themeRepoInfo: Record<string, { repo: string; tag?: string; folder: string }> = {
  stack: { repo: 'https://github.com/CaiJimmy/hugo-theme-stack', tag: 'v3.34.1', folder: 'hugo-theme-stack' },
  papermod: { repo: 'https://github.com/adityatelange/hugo-PaperMod', folder: 'PaperMod' },
  loveit: { repo: 'https://github.com/dillonzq/LoveIt', tag: 'v0.3.0', folder: 'LoveIt' },
  blowfish: { repo: 'https://github.com/nunocoracao/blowfish', folder: 'blowfish' },
  congo: { repo: 'https://github.com/jpanther/congo', folder: 'congo' },
  docsy: { repo: 'https://github.com/google/docsy', folder: 'docsy' },
}

async function installTheme(): Promise<boolean> {
  const themeInfo = themeRepoInfo[selectedTheme.value]
  if (!themeInfo || selectedTheme.value === 'default') {
    return true // 默认主题无需安装
  }

  installingTheme.value = true
  installProgress.value = '正在初始化 Git 仓库...'
  
  try {
    // 1. 初始化 git 仓库（如果还没有）
    try {
      const gitInit = Command.create('git', ['init'], { cwd: projectPath.value })
      await gitInit.execute()
    } catch (e) {
      // 可能已经是 git 仓库，忽略错误
    }
    
    installProgress.value = `正在下载 ${selectedTheme.value} 主题...`
    
    // 2. 使用 git submodule add 安装主题（不带 -b 参数，因为可能是 tag）
    const submoduleArgs = ['submodule', 'add', themeInfo.repo, `themes/${themeInfo.folder}`]
    const gitSubmodule = Command.create('git', submoduleArgs, { cwd: projectPath.value })
    const output = await gitSubmodule.execute()
    
    // 检查是否需要添加已存在的 repo
    if (output.code !== 0 && output.stderr && output.stderr.includes('already exists')) {
      installProgress.value = '主题目录已存在，尝试添加到索引...'
      const addExisting = Command.create('git', ['submodule', 'add', themeInfo.repo, `themes/${themeInfo.folder}`], { cwd: projectPath.value })
      await addExisting.execute()
    }
    
    // 3. 如果指定了 tag，进入 submodule 目录并 checkout 到指定 tag
    if (themeInfo.tag) {
      installProgress.value = `正在切换到 ${themeInfo.tag} 版本...`
      const themePath = `${projectPath.value}/themes/${themeInfo.folder}`
      const gitCheckout = Command.create('git', ['checkout', themeInfo.tag], { cwd: themePath })
      const checkoutResult = await gitCheckout.execute()
      
      if (checkoutResult.code !== 0) {
        console.warn('Checkout warning:', checkoutResult.stderr)
        // checkout 可能会有 detached HEAD 警告，但不算失败
      }
    }
    
    themeInstalled.value = true
    installProgress.value = '主题安装完成！'
    return true
  } catch (err) {
    console.error('主题安装失败:', err)
    themeInstallError.value = true
    installProgress.value = `安装失败: ${err}`
    return false
  } finally {
    installingTheme.value = false
  }
}

// 自动打开项目设置
const autoOpenEnabled = ref(true)
const autoOpenCountdown = ref(3)
let countdownTimer: ReturnType<typeof setInterval> | null = null

async function createBlogAndInstallTheme() {
  if (!projectPath.value) return
  
  creating.value = true
  createResult.value = null
  themeInstalled.value = false
  themeInstallError.value = false
  
  try {
    // 获取模板文件列表
    const templates = getBlogTemplates(blogConfig.value)
    
    // 转换为后端需要的格式
    const files = templates.map(t => ({
      path: t.path,
      content: t.content,
    }))
    
    // 调用后端初始化博客
    const result = await invoke<{ success: boolean; files_created: string[]; errors: string[] }>('init_blog', {
      projectPath: projectPath.value,
      files,
    })
    
    createResult.value = result
    
    // 如果创建成功，自动安装主题
    if (result.success && selectedTheme.value !== 'default') {
      creating.value = false
      await installTheme()
    }
    
    // 创建成功后，启动倒计时自动打开项目
    if (result.success) {
      startAutoOpenCountdown()
    }
  } catch (err) {
    console.error('创建博客失败:', err)
    createResult.value = {
      success: false,
      files_created: [],
      errors: [String(err)],
    }
  } finally {
    creating.value = false
  }
}

function startAutoOpenCountdown() {
  autoOpenCountdown.value = 3
  countdownTimer = setInterval(() => {
    autoOpenCountdown.value--
    if (autoOpenCountdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
      if (autoOpenEnabled.value) {
        openProject()
      }
    }
  }, 1000)
}

function cancelAutoOpen() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  autoOpenEnabled.value = false
}

function goBack() {
  if (createResult.value?.success) {
    router.push('/')
  } else if (currentStep.value > 0) {
    // 如果在中间步骤，确认是否要取消
    if (confirm('确定要取消创建博客吗？')) {
      router.push('/')
    }
  } else {
    router.push('/')
  }
}

function openProject() {
  // 清理计时器
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  // 创建一个项目对象并保存到 store
  const project: Project = {
    id: Date.now().toString(),
    name: blogConfig.value.title,
    path: projectPath.value,
    engine: 'Hugo',
    theme: selectedTheme.value,
    config: {
      title: blogConfig.value.title,
      base_url: blogConfig.value.baseURL,
      language: blogConfig.value.language,
      description: blogConfig.value.description,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  // setCurrentProject 会自动添加到最近项目
  projectStore.setCurrentProject(project)
  projectStore.addProject(project)
  
  router.push({
    name: 'project',
    params: { id: project.id },
  })
}

// 清理计时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>
