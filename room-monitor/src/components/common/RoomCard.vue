<template>
  <div class="room-card" :class="`room-card--${room.status}`" @click="$emit('click', room)">
    <div class="room-card__glow"></div>
    <div class="room-card__background-pattern"></div>

    <div class="room-card__header">
      <div class="room-card__info">
        <h3 class="room-card__name">{{ room.name }}</h3>
        <p v-if="room.location" class="room-card__location">
          <el-icon><Location /></el-icon>
          {{ room.location }}
        </p>
      </div>
      <div class="room-card__status">
        <div class="room-card__status-indicator" :class="`room-card__status-indicator--${room.status}`">
          <div class="room-card__status-dot"></div>
        </div>
        <el-tag :type="statusType" size="small" class="room-card__status-tag">
          {{ statusText }}
        </el-tag>
      </div>
    </div>

    <div class="room-card__metrics">
      <div class="room-card__metric">
        <div class="room-card__metric-icon room-card__metric-icon--temperature">
          <div class="room-card__metric-icon-bg"></div>
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.temperature }}°C</span>
          <span class="room-card__metric-label">温度</span>
          <div class="room-card__metric-progress">
            <div class="room-card__metric-progress-bar" :style="{ width: `${Math.min((room.temperature / 50) * 100, 100)}%` }"></div>
          </div>
        </div>
      </div>

      <div class="room-card__metric">
        <div class="room-card__metric-icon room-card__metric-icon--humidity">
          <div class="room-card__metric-icon-bg"></div>
          <el-icon><Drizzling /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.humidity }}%</span>
          <span class="room-card__metric-label">湿度</span>
          <div class="room-card__metric-progress">
            <div class="room-card__metric-progress-bar" :style="{ width: `${room.humidity}%` }"></div>
          </div>
        </div>
      </div>

      <div class="room-card__metric">
        <div class="room-card__metric-icon room-card__metric-icon--air">
          <div class="room-card__metric-icon-bg"></div>
          <el-icon><Cloudy /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.airQuality }}</span>
          <span class="room-card__metric-label">空气质量</span>
          <div class="room-card__metric-progress">
            <div class="room-card__metric-progress-bar" :style="{ width: `${Math.min((room.airQuality / 500) * 100, 100)}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="room-card__footer">
      <div class="room-card__devices" v-if="room.deviceCount">
        <div class="room-card__devices-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span>{{ room.deviceCount }} 台设备</span>
      </div>
      <div class="room-card__time">
        <div class="room-card__time-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <span>{{ formatTime(room.lastUpdateTime) }}</span>
      </div>
    </div>

    <div class="room-card__overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Location, Sunny, Drizzling, Cloudy, Monitor, Clock } from '@element-plus/icons-vue'
import type { Room } from '@/types'

interface Props {
  room: Room
}

interface Emits {
  (e: 'click', room: Room): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const statusType = computed(() => {
  const typeMap = {
    normal: 'success',
    warning: 'warning',
    error: 'danger',
    offline: 'info'
  }
  return typeMap[props.room.status] as any
})

const statusText = computed(() => {
  const textMap = {
    normal: '正常',
    warning: '警告',
    error: '异常',
    offline: '离线'
  }
  return textMap[props.room.status]
})

function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped lang="scss">
.room-card {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow-2xl);

    .room-card__glow {
      opacity: 1;
      transform: scale(1.1);
    }

    .room-card__background-pattern {
      opacity: 0.6;
      transform: scale(1.05) rotate(2deg);
    }

    .room-card__metric-icon {
      transform: scale(1.1);
    }

    .room-card__overlay {
      opacity: 1;
    }

    .room-card__status-dot {
      animation: pulse-dot 2s infinite;
    }
  }

  &--normal {
    border-top: 3px solid var(--success-color);

    .room-card__glow {
      background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    }

    .room-card__status-indicator--normal {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);

      .room-card__status-dot {
        background: var(--success-color);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
      }
    }
  }

  &--warning {
    border-top: 3px solid var(--warning-color);

    .room-card__glow {
      background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
    }

    .room-card__status-indicator--warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);

      .room-card__status-dot {
        background: var(--warning-color);
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
      }
    }
  }

  &--error {
    border-top: 3px solid var(--error-color);

    .room-card__glow {
      background: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 70%);
    }

    .room-card__status-indicator--error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);

      .room-card__status-dot {
        background: var(--error-color);
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
      }
    }
  }

  &--offline {
    border-top: 3px solid var(--info-color);
    opacity: 0.8;

    .room-card__glow {
      background: radial-gradient(circle at 50% 50%, rgba(107, 114, 128, 0.15) 0%, transparent 70%);
    }

    .room-card__status-indicator--offline {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.1) 100%);

      .room-card__status-dot {
        background: var(--info-color);
        box-shadow: 0 0 10px rgba(107, 114, 128, 0.5);
      }
    }
  }

  &__glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 0;
  }

  &__background-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    opacity: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 0;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-xl);
    position: relative;
    z-index: 2;
  }

  &__name {
    margin: 0 0 var(--space-xs) 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__location {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  &__status-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }

  &__status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  &__status-tag {
    font-weight: 600;
    backdrop-filter: blur(10px);
  }

  &__metrics {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    position: relative;
    z-index: 2;
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm);
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
      transform: translateX(4px);
    }
  }

  &__metric-icon {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    &--temperature {
      color: #ef4444;

      .room-card__metric-icon-bg {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.25) 100%);
      }
    }

    &--humidity {
      color: #3b82f6;

      .room-card__metric-icon-bg {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.25) 100%);
      }
    }

    &--air {
      color: #10b981;

      .room-card__metric-icon-bg {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%);
      }
    }
  }

  &__metric-icon-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--radius-md);
    z-index: -1;
  }

  &__metric-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__metric-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  &__metric-label {
    font-size: 12px;
    color: var(--text-tertiary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__metric-progress {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: var(--space-xs);
  }

  &__metric-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, currentColor 0%, rgba(255, 255, 255, 0.3) 100%);
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: var(--text-secondary);
    position: relative;
    z-index: 2;
  }

  &__devices,
  &__time {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    font-weight: 500;
  }

  &__devices-icon,
  &__time-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: 1;
  }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .room-card {
    padding: var(--space-lg);

    &__name {
      font-size: 18px;
    }

    &__metric-value {
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .room-card {
    padding: var(--space-md);

    &__header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    &__status {
      align-self: flex-start;
    }

    &__name {
      font-size: 18px;
    }

    &__metrics {
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
    }

    &__metric {
      padding: var(--space-sm);
    }

    &__metric-icon {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    &__metric-value {
      font-size: 16px;
    }

    &__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm);
    }
  }
}

@media (max-width: 480px) {
  .room-card {
    padding: var(--space-md);

    &__header {
      text-align: center;
      align-items: center;
    }

    &__info {
      text-align: center;
    }

    &__status {
      align-self: center;
    }

    &__metrics {
      gap: var(--space-xs);
    }

    &__footer {
      text-align: center;
      align-items: center;
    }
  }
}
</style>