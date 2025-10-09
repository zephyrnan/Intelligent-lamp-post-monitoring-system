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
  --primary-color: #4f46e5;
  --primary-color-light: #818cf8;
  --primary-color-dark: #3730a3;

  /* 功能色 */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #6b7280;

  /* 渐变色 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  --gradient-warning: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --gradient-error: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);

  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-glass: rgba(255, 255, 255, 0.25);

  /* 文字颜色 */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;

  /* 边框颜色 */
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;

  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* 圆角 */
  --radius-sm: 6px;
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

  /* 字体 */
  --font-family: 'Inter', 'SF Pro Display', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --bg-glass: rgba(15, 23, 42, 0.25);

    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;

    --border-light: #334155;
    --border-medium: #475569;
  }
}

/* 全局重置 */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* 基础样式 */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

/* Element Plus 组件自定义 */
.el-container {
  width: 100%;
  min-height: 100vh;
  background: transparent;
}

.el-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  background: var(--bg-glass);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.el-button {
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-button--primary {
  background: var(--gradient-primary);
  border: none;
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.el-input__wrapper {
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.el-input__wrapper:hover {
  box-shadow: var(--shadow-md);
}

.el-select .el-select__wrapper {
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.el-tag {
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.el-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.el-pagination {
  font-weight: 500;
}

/* 自定义动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-20px);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-10px);
  }
  90% {
    transform: translateY(-4px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1);
  }
}

@keyframes wobble {
  0% {
    transform: none;
  }
  15% {
    transform: translateX(-25%) rotate(-5deg);
  }
  30% {
    transform: translateX(20%) rotate(3deg);
  }
  45% {
    transform: translateX(-15%) rotate(-3deg);
  }
  60% {
    transform: translateX(10%) rotate(2deg);
  }
  75% {
    transform: translateX(-5%) rotate(-1deg);
  }
  100% {
    transform: none;
  }
}

@keyframes rubber {
  0% {
    transform: scaleX(1);
  }
  30% {
    transform: scaleX(1.25) scaleY(0.75);
  }
  40% {
    transform: scaleX(0.75) scaleY(1.25);
  }
  50% {
    transform: scaleX(1.15) scaleY(0.85);
  }
  65% {
    transform: scaleX(0.95) scaleY(1.05);
  }
  75% {
    transform: scaleX(1.05) scaleY(0.95);
  }
  100% {
    transform: scaleX(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px var(--primary-color);
  }
  50% {
    box-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
  }
}

/* 通用动画类 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-in-left {
  animation: fadeInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-in-right {
  animation: fadeInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-in-scale {
  animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-up {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-down {
  animation: slideInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-zoom-in {
  animation: zoomIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-bounce {
  animation: bounce 1s ease-in-out;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-heartbeat {
  animation: heartbeat 1.5s infinite;
}

.animate-wobble {
  animation: wobble 1s ease-in-out;
}

.animate-rubber {
  animation: rubber 1s ease-in-out;
}

.animate-shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* 延迟动画类 */
.animate-delay-1 {
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.animate-delay-2 {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.animate-delay-3 {
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.animate-delay-4 {
  animation-delay: 0.4s;
  animation-fill-mode: both;
}

.animate-delay-5 {
  animation-delay: 0.5s;
  animation-fill-mode: both;
}

/* 持续时间类 */
.animate-fast {
  animation-duration: 0.3s;
}

.animate-faster {
  animation-duration: 0.2s;
}

.animate-slow {
  animation-duration: 1s;
}

.animate-slower {
  animation-duration: 2s;
}

/* 悬停动画类 */
.hover-animate-pulse:hover {
  animation: pulse 1s ease-in-out;
}

.hover-animate-bounce:hover {
  animation: bounce 0.8s ease-in-out;
}

.hover-animate-shake:hover {
  animation: shake 0.5s ease-in-out;
}

.hover-animate-wobble:hover {
  animation: wobble 0.8s ease-in-out;
}

.hover-animate-rubber:hover {
  animation: rubber 0.8s ease-in-out;
}

.hover-animate-heartbeat:hover {
  animation: heartbeat 1s ease-in-out;
}

/* 加载动画增强 */
.animate-loading-dots {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 20px;
}

.animate-loading-dots div {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.animate-loading-dots div:nth-child(1) {
  left: 8px;
  animation: loading-dots1 0.6s infinite;
}

.animate-loading-dots div:nth-child(2) {
  left: 8px;
  animation: loading-dots2 0.6s infinite;
}

.animate-loading-dots div:nth-child(3) {
  left: 32px;
  animation: loading-dots2 0.6s infinite;
}

.animate-loading-dots div:nth-child(4) {
  left: 56px;
  animation: loading-dots3 0.6s infinite;
}

@keyframes loading-dots1 {
  0% {
    transform: scale(0) translateY(-50%);
  }
  100% {
    transform: scale(1) translateY(-50%);
  }
}

@keyframes loading-dots3 {
  0% {
    transform: scale(1) translateY(-50%);
  }
  100% {
    transform: scale(0) translateY(-50%);
  }
}

@keyframes loading-dots2 {
  0% {
    transform: translate(0, -50%);
  }
  100% {
    transform: translate(24px, -50%);
  }
}

/* 过渡效果增强 */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-opacity {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-shadow {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 可见性动画 */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 响应式断点 */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-md);
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 640px) {
  .container {
    max-width: 620px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 750px;
    padding: 0 var(--space-lg);
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 970px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1000px;
    padding: 0 var(--space-xl);
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1170px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1260px;
  }
}

@media (min-width: 1400px) {
  .container {
    max-width: 1380px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1520px;
  }
}

@media (min-width: 1920px) {
  .container {
    max-width: 1880px;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  html,
  body {
    font-size: 13px;
  }

  .el-card {
    margin: var(--space-xs);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
  }

  .el-button {
    min-height: 40px;
    font-size: 13px;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);

    &:active {
      transform: scale(0.95);
    }
  }

  .el-input__wrapper {
    min-height: 40px;
    border-radius: var(--radius-md);
  }

  /* 移动端触摸反馈 */
  .el-button,
  .el-card,
  [role="button"] {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  }

  /* 移动端滚动优化 */
  * {
    -webkit-overflow-scrolling: touch;
  }

  /* 移动端字体优化 */
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }
}

@media (max-width: 576px) {
  html,
  body {
    font-size: 13px;
  }

  .el-card {
    margin: var(--space-xs);
    border-radius: var(--radius-lg);
  }

  .el-button {
    min-height: 42px;
    font-size: 14px;
    border-radius: var(--radius-lg);
  }

  .el-input__wrapper {
    min-height: 42px;
    border-radius: var(--radius-lg);
  }

  /* 小屏幕导航优化 */
  .el-menu-item {
    padding: var(--space-md) var(--space-sm) !important;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  html,
  body {
    font-size: 14px;
  }

  .el-card {
    margin: var(--space-sm);
    border-radius: var(--radius-lg);
  }

  .el-button {
    min-height: 44px; /* 移动端触摸友好 */
    border-radius: var(--radius-lg);
  }

  .el-input__wrapper {
    min-height: 44px;
    border-radius: var(--radius-lg);
  }

  /* 移动端表格优化 */
  .el-table {
    font-size: 13px;

    .el-table__cell {
      padding: var(--space-sm) var(--space-xs);
    }
  }

  /* 移动端模态框优化 */
  .el-dialog {
    margin: var(--space-md) !important;
    width: calc(100% - var(--space-xl)) !important;
    max-height: 80vh;
  }

  /* 移动端分页优化 */
  .el-pagination {
    .el-pagination__sizes,
    .el-pagination__jump {
      display: none !important;
    }

    .el-pager {
      li {
        min-width: 32px;
        height: 32px;
        line-height: 30px;
        font-size: 13px;
      }
    }
  }
}

/* 平板端适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    padding: 0 var(--space-lg);
  }

  .el-card {
    margin: var(--space-md);
  }

  /* 平板端网格优化 */
  .stats-section,
  .room-grid {
    gap: var(--space-lg);
  }

  /* 平板端表单优化 */
  .el-form-item {
    margin-bottom: var(--space-lg);
  }

  .el-input,
  .el-select {
    font-size: 15px;
  }
}

/* 大屏适配 */
@media (min-width: 1400px) {
  html,
  body {
    font-size: 15px;
  }

  .container {
    padding: 0 var(--space-xl);
  }

  /* 大屏幕组件间距 */
  .el-card {
    margin: var(--space-lg);
  }

  .stats-section,
  .room-grid {
    gap: var(--space-xl);
  }
}

@media (min-width: 1920px) {
  html,
  body {
    font-size: 16px;
  }

  .container {
    padding: 0 var(--space-2xl);
  }

  /* 超大屏幕优化 */
  .el-card {
    margin: var(--space-xl);
  }

  .stats-section,
  .room-grid {
    gap: var(--space-2xl);
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  /* 移除 hover 效果，使用 active 效果 */
  .el-button:hover,
  .el-card:hover {
    transform: none;
  }

  .el-button:active,
  .el-card:active {
    transform: scale(0.98);
  }

  /* 增大触摸目标 */
  .el-button {
    min-height: 44px;
    padding: var(--space-sm) var(--space-lg);
  }

  .el-menu-item {
    min-height: 48px;
  }

  /* 触摸设备滚动条隐藏 */
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  /* 高DPI图标优化 */
  .el-icon {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 高DPI边框优化 */
  .el-card,
  .el-button,
  .el-input__wrapper {
    border-width: 0.5px;
  }
}

/* 暗色模式移动端适配 */
@media (prefers-color-scheme: dark) and (max-width: 768px) {
  .el-card {
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(20px);
  }

  .el-button--primary {
    background: var(--gradient-primary);
    border: none;
  }

  .el-input__wrapper {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
  }
}

/* 无障碍优化 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 横屏移动设备优化 */
@media (max-height: 500px) and (orientation: landscape) {
  .layout-header {
    height: 56px;
  }

  .main-container {
    height: calc(100vh - 56px);
  }

  .page-header {
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .stats-section {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
  }
}

/* 加载状态 */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 玻璃态效果 */
.glass-effect {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 工具类 */
.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shadow-glass {
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.5);
}
</style>
