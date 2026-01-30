<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">⚙️ 项目设置</h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span class="ml-3 text-gray-600">加载配置中...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
          <button
            @click="loadConfig"
            class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            重试
          </button>
        </div>

        <!-- Config Editor -->
        <div v-else class="space-y-6">
          <!-- Config File Info -->
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <span class="text-gray-500">配置文件：</span>
            <span class="font-mono text-gray-700">{{ configInfo?.path }}</span>
            <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs uppercase">
              {{ configInfo?.format }}
            </span>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200">
            <nav class="flex gap-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Social Links Tab -->
          <div v-if="activeTab === 'social'" class="space-y-4">
            <p class="text-sm text-gray-600">
              配置您的社交链接，这些链接将显示在网站的页脚或侧边栏。
            </p>

            <!-- Existing Links -->
            <div class="space-y-3">
              <div
                v-for="(link, index) in socialLinks"
                :key="index"
                class="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
              >
                <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                  {{ getSocialIcon(link.name) }}
                </div>
                <div class="flex-1 grid grid-cols-2 gap-3">
                  <select
                    v-model="link.name"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option v-for="social in availableSocials" :key="social.id" :value="social.id">
                      {{ social.icon }} {{ social.label }}
                    </option>
                  </select>
                  <input
                    v-model="link.url"
                    type="url"
                    placeholder="https://..."
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  @click="removeSocialLink(index)"
                  class="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Add New Link -->
            <button
              @click="addSocialLink"
              class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition flex items-center justify-center gap-2"
            >
              <span>➕</span>
              <span>添加社交链接</span>
            </button>
          </div>

          <!-- Basic Settings Tab -->
          <div v-if="activeTab === 'basic'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">网站标题</label>
              <input
                v-model="basicSettings.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="我的博客"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
              <textarea
                v-model="basicSettings.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="这是一个使用 Hugo 搭建的博客..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                v-model="basicSettings.baseURL"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">语言</label>
              <select
                v-model="basicSettings.languageCode"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="zh-cn">简体中文</option>
                <option value="zh-tw">繁体中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <!-- Raw Config Tab -->
          <div v-if="activeTab === 'raw'" class="space-y-4">
            <p class="text-sm text-gray-600">
              直接编辑配置文件内容。请确保格式正确（{{ configInfo?.format?.toUpperCase() }}）。
            </p>
            <textarea
              v-model="rawConfig"
              rows="20"
              class="w-full px-4 py-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-gray-50"
              spellcheck="false"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
        <span v-if="hasChanges" class="text-sm text-amber-600">
          ⚠️ 有未保存的更改
        </span>
        <span v-else class="text-sm text-gray-500"></span>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            @click="saveConfig"
            :disabled="saving || !hasChanges"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '保存中...' : '保存更改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'

interface SocialLink {
  name: string
  url: string
}

interface BasicSettings {
  title: string
  description: string
  baseURL: string
  languageCode: string
}

interface ConfigInfo {
  path: string
  format: string
  content: string
}

const props = defineProps<{
  projectPath: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const configInfo = ref<ConfigInfo | null>(null)
const rawConfig = ref('')
const originalConfig = ref('')
const activeTab = ref('social')

const socialLinks = ref<SocialLink[]>([])
const basicSettings = ref<BasicSettings>({
  title: '',
  description: '',
  baseURL: '',
  languageCode: 'zh-cn'
})

const tabs = [
  { id: 'social', label: '社交链接', icon: '🔗' },
  { id: 'basic', label: '基本设置', icon: '📝' },
  { id: 'raw', label: '原始配置', icon: '📄' },
]

const availableSocials = [
  { id: 'github', label: 'GitHub', icon: '💻' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
  { id: 'bilibili', label: 'Bilibili', icon: '📺' },
  { id: 'weibo', label: '微博', icon: '🔴' },
  { id: 'zhihu', label: '知乎', icon: '💙' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'rss', label: 'RSS', icon: '📡' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'discord', label: 'Discord', icon: '💬' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘' },
]

const getSocialIcon = (name: string): string => {
  const social = availableSocials.find(s => s.id === name.toLowerCase())
  return social?.icon || '🔗'
}

const hasChanges = computed(() => {
  return rawConfig.value !== originalConfig.value
})

const addSocialLink = () => {
  socialLinks.value.push({ name: 'github', url: '' })
  updateRawConfigFromUI()
}

const removeSocialLink = (index: number) => {
  socialLinks.value.splice(index, 1)
  updateRawConfigFromUI()
}

// Watch for UI changes and update raw config
watch([socialLinks, basicSettings], () => {
  updateRawConfigFromUI()
}, { deep: true })

const updateRawConfigFromUI = () => {
  if (!configInfo.value) return
  
  const format = configInfo.value.format
  
  if (format === 'yaml' || format === 'yml') {
    rawConfig.value = generateYamlConfig()
  } else if (format === 'toml') {
    rawConfig.value = generateTomlConfig()
  }
}

const generateYamlConfig = (): string => {
  // 解析现有配置，只更新相关部分
  let lines = originalConfig.value.split('\n')
  let newLines: string[] = []
  let inSocialIcons = false
  let socialIconsIndent = 0
  let skipUntilNextKey = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // 检测 socialIcons 开始
    if (trimmed === 'socialIcons:' || trimmed.startsWith('socialIcons:')) {
      inSocialIcons = true
      socialIconsIndent = line.indexOf('socialIcons')
      // 添加新的 socialIcons
      newLines.push(line.substring(0, socialIconsIndent) + 'socialIcons:')
      for (const link of socialLinks.value) {
        if (link.url) {
          newLines.push(' '.repeat(socialIconsIndent + 2) + '- name: ' + link.name)
          newLines.push(' '.repeat(socialIconsIndent + 4) + 'url: "' + link.url + '"')
        }
      }
      skipUntilNextKey = true
      continue
    }
    
    // 跳过旧的 socialIcons 内容
    if (skipUntilNextKey) {
      if (trimmed.startsWith('-') || trimmed.startsWith('name:') || trimmed.startsWith('url:') || trimmed === '') {
        continue
      }
      // 检查是否是新的顶级键
      if (!line.startsWith(' ') || (line.match(/^\s*/)?.[0]?.length || 0) <= socialIconsIndent) {
        skipUntilNextKey = false
        inSocialIcons = false
      } else {
        continue
      }
    }
    
    // 更新基本设置
    if (trimmed.startsWith('title:')) {
      newLines.push(line.substring(0, line.indexOf('title:')) + 'title: "' + basicSettings.value.title + '"')
      continue
    }
    if (trimmed.startsWith('baseURL:')) {
      newLines.push(line.substring(0, line.indexOf('baseURL:')) + 'baseURL: "' + basicSettings.value.baseURL + '"')
      continue
    }
    if (trimmed.startsWith('languageCode:')) {
      newLines.push(line.substring(0, line.indexOf('languageCode:')) + 'languageCode: "' + basicSettings.value.languageCode + '"')
      continue
    }
    
    newLines.push(line)
  }
  
  // 如果原配置中没有 socialIcons，添加到 params 下
  if (!originalConfig.value.includes('socialIcons:') && socialLinks.value.length > 0) {
    // 查找 params: 位置
    let paramsIndex = newLines.findIndex(l => l.trim() === 'params:' || l.trim().startsWith('params:'))
    if (paramsIndex >= 0) {
      let insertIndex = paramsIndex + 1
      // 跳过 params 下的现有内容
      while (insertIndex < newLines.length && (newLines[insertIndex].startsWith('  ') || newLines[insertIndex].trim() === '')) {
        insertIndex++
      }
      // 插入 socialIcons
      let socialIconsLines = ['  socialIcons:']
      for (const link of socialLinks.value) {
        if (link.url) {
          socialIconsLines.push('    - name: ' + link.name)
          socialIconsLines.push('      url: "' + link.url + '"')
        }
      }
      newLines.splice(insertIndex, 0, ...socialIconsLines)
    }
  }
  
  return newLines.join('\n')
}

const generateTomlConfig = (): string => {
  // 简单的 TOML 生成
  let lines = originalConfig.value.split('\n')
  let newLines: string[] = []
  let inSocialIcons = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 检测 [[params.socialIcons]] 开始
    if (trimmed === '[[params.socialIcons]]') {
      if (!inSocialIcons) {
        inSocialIcons = true
        // 添加所有社交链接
        for (const link of socialLinks.value) {
          if (link.url) {
            newLines.push('[[params.socialIcons]]')
            newLines.push('name = "' + link.name + '"')
            newLines.push('url = "' + link.url + '"')
            newLines.push('')
          }
        }
      }
      continue
    }
    
    // 跳过旧的社交链接内容
    if (inSocialIcons && (trimmed.startsWith('name =') || trimmed.startsWith('url ='))) {
      continue
    }
    
    if (inSocialIcons && trimmed !== '' && !trimmed.startsWith('name =') && !trimmed.startsWith('url =')) {
      inSocialIcons = false
    }
    
    // 更新基本设置
    if (trimmed.startsWith('title =')) {
      newLines.push('title = "' + basicSettings.value.title + '"')
      continue
    }
    if (trimmed.startsWith('baseURL =')) {
      newLines.push('baseURL = "' + basicSettings.value.baseURL + '"')
      continue
    }
    if (trimmed.startsWith('languageCode =')) {
      newLines.push('languageCode = "' + basicSettings.value.languageCode + '"')
      continue
    }
    
    newLines.push(line)
  }
  
  return newLines.join('\n')
}

const parseConfigToUI = () => {
  if (!configInfo.value) return
  
  const content = configInfo.value.content
  const format = configInfo.value.format
  
  if (format === 'yaml' || format === 'yml') {
    parseYamlConfig(content)
  } else if (format === 'toml') {
    parseTomlConfig(content)
  }
}

const parseYamlConfig = (content: string) => {
  const lines = content.split('\n')
  let inSocialIcons = false
  let currentSocial: SocialLink | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 基本设置
    if (trimmed.startsWith('title:')) {
      basicSettings.value.title = extractYamlValue(trimmed)
    }
    if (trimmed.startsWith('baseURL:')) {
      basicSettings.value.baseURL = extractYamlValue(trimmed)
    }
    if (trimmed.startsWith('languageCode:')) {
      basicSettings.value.languageCode = extractYamlValue(trimmed)
    }
    if (trimmed.startsWith('description:')) {
      basicSettings.value.description = extractYamlValue(trimmed)
    }
    
    // 社交链接
    if (trimmed === 'socialIcons:' || trimmed.startsWith('socialIcons:')) {
      inSocialIcons = true
      continue
    }
    
    if (inSocialIcons) {
      if (trimmed.startsWith('- name:') || trimmed === '- name:') {
        if (currentSocial) {
          socialLinks.value.push(currentSocial)
        }
        currentSocial = { name: extractYamlValue(trimmed.replace('- ', '')), url: '' }
      } else if (trimmed.startsWith('name:') && currentSocial === null) {
        currentSocial = { name: extractYamlValue(trimmed), url: '' }
      } else if (trimmed.startsWith('url:') && currentSocial) {
        currentSocial.url = extractYamlValue(trimmed)
      } else if (!trimmed.startsWith('-') && !trimmed.startsWith('name:') && !trimmed.startsWith('url:') && trimmed !== '' && !line.startsWith('    ') && !line.startsWith('      ')) {
        // 遇到新的顶级键，结束 socialIcons
        if (currentSocial) {
          socialLinks.value.push(currentSocial)
          currentSocial = null
        }
        inSocialIcons = false
      }
    }
  }
  
  // 添加最后一个
  if (currentSocial) {
    socialLinks.value.push(currentSocial)
  }
}

const parseTomlConfig = (content: string) => {
  const lines = content.split('\n')
  let inSocialIcon = false
  let currentSocial: SocialLink | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 基本设置
    if (trimmed.startsWith('title =')) {
      basicSettings.value.title = extractTomlValue(trimmed)
    }
    if (trimmed.startsWith('baseURL =')) {
      basicSettings.value.baseURL = extractTomlValue(trimmed)
    }
    if (trimmed.startsWith('languageCode =')) {
      basicSettings.value.languageCode = extractTomlValue(trimmed)
    }
    
    // 社交链接
    if (trimmed === '[[params.socialIcons]]') {
      if (currentSocial) {
        socialLinks.value.push(currentSocial)
      }
      currentSocial = { name: '', url: '' }
      inSocialIcon = true
      continue
    }
    
    if (inSocialIcon && currentSocial) {
      if (trimmed.startsWith('name =')) {
        currentSocial.name = extractTomlValue(trimmed)
      }
      if (trimmed.startsWith('url =')) {
        currentSocial.url = extractTomlValue(trimmed)
      }
    }
  }
  
  // 添加最后一个
  if (currentSocial) {
    socialLinks.value.push(currentSocial)
  }
}

const extractYamlValue = (line: string): string => {
  const match = line.match(/:\s*["']?([^"'\n]*)["']?/)
  return match ? match[1].trim() : ''
}

const extractTomlValue = (line: string): string => {
  const match = line.match(/=\s*["']([^"']*)["']/)
  return match ? match[1] : ''
}

const loadConfig = async () => {
  loading.value = true
  error.value = ''
  
  try {
    configInfo.value = await invoke('read_hugo_config', { projectPath: props.projectPath })
    if (configInfo.value) {
      rawConfig.value = configInfo.value.content
      originalConfig.value = configInfo.value.content
      
      // 解析配置到 UI
      socialLinks.value = []
      parseConfigToUI()
    }
  } catch (err) {
    error.value = String(err)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  if (!configInfo.value || !hasChanges.value) return
  
  saving.value = true
  
  try {
    await invoke('save_hugo_config', {
      configPath: configInfo.value.path,
      content: rawConfig.value
    })
    originalConfig.value = rawConfig.value
    emit('saved')
  } catch (err) {
    error.value = String(err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>
