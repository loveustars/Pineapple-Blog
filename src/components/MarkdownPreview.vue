<template>
  <div class="h-full overflow-y-auto bg-white">
    <div 
      class="markdown-body max-w-4xl mx-auto p-8 min-h-full"
      v-html="html"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  html: string
}

defineProps<Props>()
</script>

<style>
/* 引入 GitHub Markdown 样式 */
@import 'github-markdown-css/github-markdown.css';
@import 'highlight.js/styles/github.css';

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
}

/* 自定义滚动条 */
.markdown-body::-webkit-scrollbar {
  width: 8px;
}

.markdown-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.markdown-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.markdown-body::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
