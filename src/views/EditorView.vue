<template>
  <div class="h-full flex items-center justify-center p-8 bg-gray-50">
    <div class="text-center max-w-md">
      <div class="text-6xl mb-4">🚧</div>
      <h3 class="text-2xl font-bold text-gray-800 mb-2">编辑器功能开发中</h3>
      <p class="text-gray-600 mb-6">
        Markdown 编辑器功能将在后续版本中推出，敬请期待！
      </p>
      <button
        @click="router.push('/')"
        class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
