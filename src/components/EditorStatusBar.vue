<template>
  <div class="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-500">
    <!-- Stats -->
    <div class="flex items-center gap-4">
      <span>{{ lineCount }} 行</span>
      <span>{{ wordCount }} 字</span>
      <span>{{ charCount }} 字符</span>
      <span v-if="readingTime">约 {{ readingTime }} 分钟阅读</span>
    </div>

    <!-- Right Info -->
    <div class="flex items-center gap-4">
      <slot name="right">
        <span>{{ language }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lineCount?: number
  wordCount?: number
  charCount?: number
  readingTime?: number
  language?: string
}

withDefaults(defineProps<Props>(), {
  lineCount: 0,
  wordCount: 0,
  charCount: 0,
  readingTime: 0,
  language: 'Markdown',
})
</script>
