<template>
  <div class="theme-front-matter-editor bg-white h-full flex flex-col">
    <!-- 主题选择器 -->
    <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ currentThemeConfig?.icon }}</span>
          <span class="font-medium text-gray-800">{{ currentThemeConfig?.name }}</span>
        </div>
        <select
          v-model="selectedTheme"
          @change="handleThemeChange"
          class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="theme in availableThemes" :key="theme.id" :value="theme.id">
            {{ theme.icon }} {{ theme.name }}
          </option>
        </select>
      </div>
      <p class="text-xs text-gray-500 mt-1">{{ currentThemeConfig?.description }}</p>
    </div>

    <!-- 字段列表 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="field in currentThemeConfig?.frontMatterFields"
        :key="field.key"
        class="field-group"
      >
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-500">*</span>
        </label>
        
        <!-- 文本输入 -->
        <input
          v-if="field.type === 'text'"
          :value="localData[field.key]"
          @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
          type="text"
          :placeholder="field.placeholder"
          class="field-input"
        />

        <!-- 文本域 -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :value="localData[field.key]"
          @input="updateField(field.key, ($event.target as HTMLTextAreaElement).value)"
          :placeholder="field.placeholder"
          rows="2"
          class="field-input resize-none"
        ></textarea>

        <!-- 日期 -->
        <input
          v-else-if="field.type === 'date'"
          :value="formatDateValue(localData[field.key])"
          @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
          type="datetime-local"
          class="field-input"
        />

        <!-- 布尔值 -->
        <label
          v-else-if="field.type === 'boolean'"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            :checked="localData[field.key]"
            @change="updateField(field.key, ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span class="text-sm text-gray-600">{{ field.description || '启用' }}</span>
        </label>

        <!-- 数字 -->
        <input
          v-else-if="field.type === 'number'"
          :value="localData[field.key]"
          @input="updateField(field.key, parseInt(($event.target as HTMLInputElement).value) || 0)"
          type="number"
          :placeholder="field.placeholder"
          class="field-input"
        />

        <!-- 选择器 -->
        <select
          v-else-if="field.type === 'select'"
          :value="localData[field.key]"
          @change="updateField(field.key, ($event.target as HTMLSelectElement).value)"
          class="field-input"
        >
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- 标签/数组 -->
        <div v-else-if="field.type === 'tags'" class="space-y-2">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(tag, index) in (localData[field.key] || [])"
              :key="index"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
            >
              {{ tag }}
              <button
                @click="removeArrayItem(field.key, Number(index))"
                class="hover:text-primary-900"
              >×</button>
            </span>
          </div>
          <div class="flex gap-1">
            <input
              :ref="el => tagInputRefs[field.key] = el as HTMLInputElement"
              @keyup.enter="addArrayItem(field.key)"
              type="text"
              :placeholder="field.placeholder || '输入后按回车'"
              class="flex-1 field-input"
            />
            <button
              @click="addArrayItem(field.key)"
              class="px-3 py-1.5 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 transition"
            >
              +
            </button>
          </div>
        </div>

        <!-- 图片 -->
        <div v-else-if="field.type === 'image'" class="space-y-2">
          <div class="flex gap-2">
            <input
              :value="localData[field.key]"
              @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
              type="text"
              :placeholder="field.placeholder || '图片 URL'"
              class="flex-1 field-input"
            />
            <button
              @click="selectImage(field.key)"
              class="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition text-sm"
            >
              📁
            </button>
          </div>
          <!-- 图片预览 -->
          <div v-if="localData[field.key]" class="relative">
            <img
              :src="localData[field.key]"
              :alt="field.label"
              class="w-full h-32 object-cover rounded border border-gray-200"
              @error="handleImageError"
            />
            <button
              @click="updateField(field.key, '')"
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>

        <!-- 字段描述 -->
        <p v-if="field.description && field.type !== 'boolean'" class="text-xs text-gray-500 mt-1">
          {{ field.description }}
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between">
      <button
        @click="resetToDefaults"
        class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
      >
        重置默认
      </button>
      <button
        @click="$emit('toggle')"
        class="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 transition"
      >
        收起面板
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { 
  THEME_CONFIGS, 
  getDefaultFrontMatter,
  type HugoTheme,
  type ThemeInfo
} from '@/utils/themeConfig'

interface Props {
  theme?: HugoTheme
  data: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
})

const emit = defineEmits<{
  update: [data: Record<string, any>]
  'theme-change': [theme: HugoTheme]
  toggle: []
}>()

const selectedTheme = ref<HugoTheme>(props.theme)
const localData = reactive<Record<string, any>>({ ...props.data })
const tagInputRefs: Record<string, HTMLInputElement | null> = {}

const availableThemes = computed((): ThemeInfo[] => {
  return Object.values(THEME_CONFIGS)
})

const currentThemeConfig = computed(() => {
  return THEME_CONFIGS[selectedTheme.value]
})

// 监听外部数据变化
watch(() => props.data, (newData) => {
  Object.assign(localData, newData)
}, { deep: true })

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  selectedTheme.value = newTheme
})

// 更新字段
function updateField(key: string, value: any) {
  localData[key] = value
  emit('update', { ...localData })
}

// 格式化日期
function formatDateValue(value: any): string {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

// 添加数组项
function addArrayItem(key: string) {
  const input = tagInputRefs[key]
  if (!input) return
  
  const value = input.value.trim()
  if (!value) return

  if (!localData[key]) {
    localData[key] = []
  }
  
  if (!localData[key].includes(value)) {
    localData[key].push(value)
    emit('update', { ...localData })
  }
  
  input.value = ''
}

// 删除数组项
function removeArrayItem(key: string, index: number) {
  if (localData[key] && Array.isArray(localData[key])) {
    localData[key].splice(index, 1)
    emit('update', { ...localData })
  }
}

// 选择图片
async function selectImage(key: string) {
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: '图片',
        extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
      }]
    })
    
    if (selected) {
      updateField(key, selected)
    }
  } catch (err) {
    console.error('选择图片失败:', err)
  }
}

// 图片加载错误
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">图片加载失败</text></svg>'
}

// 处理主题变更
function handleThemeChange() {
  emit('theme-change', selectedTheme.value)
  
  // 合并新主题的默认值
  const defaults = getDefaultFrontMatter(selectedTheme.value)
  Object.assign(localData, defaults)
  emit('update', { ...localData })
}

// 重置为默认值
function resetToDefaults() {
  const defaults = getDefaultFrontMatter(selectedTheme.value)
  Object.keys(localData).forEach(key => {
    if (key !== 'title' && key !== 'date') {
      delete localData[key]
    }
  })
  Object.assign(localData, defaults)
  emit('update', { ...localData })
}
</script>

<style scoped>
.field-input {
  @apply w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.field-group {
  @apply space-y-1;
}
</style>
