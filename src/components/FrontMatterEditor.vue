<template>
  <div class="bg-white border-b border-gray-200 p-6 space-y-4">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>📝</span>
        <span>文章元数据 (Front Matter)</span>
      </h3>
      <button
        @click="$emit('toggle')"
        class="text-xs text-gray-500 hover:text-gray-700 transition"
      >
        {{ collapsed ? '展开' : '收起' }}
      </button>
    </div>

    <div v-if="!collapsed" class="space-y-4">
      <!-- 文章标题 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
        <input
          v-model="localFrontMatter.title"
          @input="emitUpdate"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          placeholder="文章标题"
        />
      </div>

      <!-- 日期 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">发布日期</label>
          <input
            v-model="localFrontMatter.date"
            @input="emitUpdate"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <div class="flex items-center gap-4 h-10">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="localFrontMatter.draft"
                @change="emitUpdate"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700">草稿</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          v-model="localFrontMatter.description"
          @input="emitUpdate"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
          placeholder="文章简短描述"
        ></textarea>
      </div>

      <!-- 标签 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="(tag, index) in localFrontMatter.tags"
            :key="index"
            class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
          >
            {{ tag }}
            <button
              @click="removeTag(index)"
              class="hover:text-primary-900 transition"
            >
              ×
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newTag"
            @keyup.enter="addTag"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="输入标签后按回车"
          />
          <button
            @click="addTag"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
          >
            添加
          </button>
        </div>
      </div>

      <!-- 分类 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="(category, index) in localFrontMatter.categories"
            :key="index"
            class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
          >
            {{ category }}
            <button
              @click="removeCategory(index)"
              class="hover:text-green-900 transition"
            >
              ×
            </button>
          </span>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newCategory"
            @keyup.enter="addCategory"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder="输入分类后按回车"
          />
          <button
            @click="addCategory"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FrontMatter } from '@/types'

interface Props {
  frontMatter: FrontMatter
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  update: [frontMatter: FrontMatter]
  toggle: []
}>()

const localFrontMatter = ref<FrontMatter>({ ...props.frontMatter })
const newTag = ref('')
const newCategory = ref('')

// 监听外部变化
watch(() => props.frontMatter, (newValue) => {
  localFrontMatter.value = { ...newValue }
}, { deep: true })

const emitUpdate = () => {
  emit('update', { ...localFrontMatter.value })
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !localFrontMatter.value.tags.includes(tag)) {
    localFrontMatter.value.tags.push(tag)
    newTag.value = ''
    emitUpdate()
  }
}

const removeTag = (index: number) => {
  localFrontMatter.value.tags.splice(index, 1)
  emitUpdate()
}

const addCategory = () => {
  const category = newCategory.value.trim()
  if (category && !localFrontMatter.value.categories.includes(category)) {
    localFrontMatter.value.categories.push(category)
    newCategory.value = ''
    emitUpdate()
  }
}

const removeCategory = (index: number) => {
  localFrontMatter.value.categories.splice(index, 1)
  emitUpdate()
}
</script>
