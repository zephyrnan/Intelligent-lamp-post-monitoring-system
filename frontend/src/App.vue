<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useWebSocketStore } from '@/stores'

const wsStore = useWebSocketStore()

onMounted(() => {
  wsStore.connect()
})
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<style>
/* CSS 变量定义 */
:root {
  /* 主色调 */
  --primary-color: #409eff;
  --primary-color-light: #79bbff;
  --primary-color-lighter: #a0cfff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --error-color: #f56c6c;
  --info-color: #909399;

  /* 渐变色 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  --gradient-warning: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --gradient-error: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  --gradient-info: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);

  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-hover: rgba(64, 158, 255, 0.05);

  /* 文字颜色 */
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;

  /* 边框颜色 */
  --border-light: #dcdfe6;
  --border-medium: #c0c4cc;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1d1d1d;
    --bg-secondary: #2d2d2d;
    --text-primary: #e8e8e8;
    --text-secondary: #b8b8b8;
    --border-light: #3d3d3d;
  }
}

/* 全局重置 */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 基础样式 */
html, body {
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background: #f0f2f5;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Element Plus 组件基础样式 */
.el-card {
  border-radius: var(--radius-md);
  transition: box-shadow 0.3s;
}

.el-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.el-button {
  border-radius: var(--radius-sm);
  transition: all 0.3s;
}

/* 全局动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes loading-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-sm);
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* 选中文本样式 */
::selection {
  background: rgba(102, 126, 234, 0.3);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  html, body {
    font-size: 13px;
  }
}
</style>
