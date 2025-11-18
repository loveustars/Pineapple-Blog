<template>
  <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <!-- Left Section -->
    <div class="flex items-center gap-4">
      <button
        v-if="showBackButton"
        @click="$emit('back')"
        class="text-gray-600 hover:text-gray-800 transition"
      >
        ← 返回
      </button>
      <div v-if="showBackButton" class="h-6 w-px bg-gray-300"></div>
      
      <div class="text-sm">
        <div class="font-medium text-gray-800 truncate max-w-md">{{ fileName }}</div>
        <div v-if="filePath" class="text-xs text-gray-500 truncate max-w-md">{{ filePath }}</div>
      </div>
    </div>
    
    <!-- Right Section -->
    <div class="flex items-center gap-4">
      <!-- Status Indicator -->
      <div class="flex items-center gap-2">
        <span v-if="hasUnsavedChanges" class="text-xs text-orange-600 flex items-center gap-1">
          <span class="inline-block w-2 h-2 bg-orange-600 rounded-full"></span>
          未保存
        </span>
        <span v-else-if="lastSaved" class="text-xs text-green-600 flex items-center gap-1">
          <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
          已保存
        </span>
      </div>

      <!-- Actions -->
      <slot name="actions">
        <button
          @click="$emit('save')"
          :disabled="!hasUnsavedChanges || saving"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  fileName?: string
  filePath?: string
  hasUnsavedChanges?: boolean
  saving?: boolean
  lastSaved?: Date | null
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  fileName: '未命名文档',
  filePath: '',
  hasUnsavedChanges: false,
  saving: false,
  lastSaved: null,
  showBackButton: true,
})

defineEmits<{
  back: []
  save: []
}>()
</script>
