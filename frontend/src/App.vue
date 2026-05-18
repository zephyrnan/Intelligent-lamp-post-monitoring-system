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
:root {
  --primary-color: #0070f3;
  --primary-color-light: #3291ff;
  --primary-color-lighter: #e8f4ff;
  --success-color: #50e3c2;
  --warning-color: #f5a623;
  --error-color: #ee0000;
  --info-color: #888;

  --gradient-primary: linear-gradient(135deg, #0070f3 0%, #0060df 100%);
  --gradient-success: linear-gradient(135deg, #50e3c2 0%, #40c4aa 100%);
  --gradient-warning: linear-gradient(135deg, #f5a623 0%, #e09520 100%);
  --gradient-error: linear-gradient(135deg, #ee0000 0%, #cc0000 100%);
  --gradient-info: linear-gradient(135deg, #888 0%, #666 100%);

  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-hover: rgba(0, 112, 243, 0.04);
  --bg-tertiary: #f5f5f5;

  --text-primary: #111111;
  --text-secondary: #666666;
  --text-tertiary: #888888;

  --border-light: #eaeaea;
  --border-medium: #d9d9d9;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 16px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  --shadow-sm: 0 0 1px rgba(0,0,0,0.08);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-lg: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-xl: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-2xl: 0 8px 24px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;
    --bg-secondary: #111111;
    --bg-tertiary: #1a1a1a;
    --text-primary: #ededed;
    --text-secondary: #a1a1a1;
    --text-tertiary: #666;
    --border-light: #333;
    --border-medium: #444;
  }
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.el-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: none;
  transition: border-color 0.15s ease;
}

.el-card:hover {
  border-color: var(--border-medium);
}

.el-button {
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.15s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes loading-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

::selection {
  background: rgba(0, 112, 243, 0.15);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  html, body {
    font-size: 13px;
  }
}
</style>
