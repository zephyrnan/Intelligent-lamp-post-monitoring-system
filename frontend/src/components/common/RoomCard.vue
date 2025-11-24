<template>
  <div class="room-card" :class="`room-card--${room.status}`" @click="$emit('click', room)">
    <div class="room-card__header">
      <div class="room-card__info">
        <h3 class="room-card__name">{{ room.name }}</h3>
        <p v-if="room.location" class="room-card__location">
          <el-icon><Location /></el-icon>
          {{ room.location }}
        </p>
      </div>
      <el-tag :type="statusType" size="small">
        {{ statusText }}
      </el-tag>
    </div>

    <div class="room-card__metrics">
      <div class="room-card__metric">
        <div class="room-card__metric-icon temp">
          <el-icon><Sunny /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.temperature }}°C</span>
          <span class="room-card__metric-label">温度</span>
        </div>
      </div>

      <div class="room-card__metric">
        <div class="room-card__metric-icon humidity">
          <el-icon><Drizzling /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.humidity }}%</span>
          <span class="room-card__metric-label">湿度</span>
        </div>
      </div>

      <div class="room-card__metric">
        <div class="room-card__metric-icon air">
          <el-icon><Cloudy /></el-icon>
        </div>
        <div class="room-card__metric-info">
          <span class="room-card__metric-value">{{ room.airQuality }}</span>
          <span class="room-card__metric-label">空气质量</span>
        </div>
      </div>
    </div>

    <div class="room-card__footer">
      <div v-if="room.deviceCount" class="room-card__devices">
        <el-icon><Monitor /></el-icon>
        <span>{{ room.deviceCount }} 台设备</span>
      </div>
      <div class="room-card__time">
        <el-icon><Clock /></el-icon>
        <span>{{ formatTime(room.lastUpdateTime) }}</span>
      </div>
    </div>
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
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 4px solid;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    box-shadow: var(--shadow-2xl);
    transform: translateY(-8px) scale(1.02);

    &::before {
      opacity: 1;
    }
  }

  &--normal {
    border-color: var(--success-color);

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(103, 194, 58, 0.3);
    }
  }

  &--warning {
    border-color: var(--warning-color);

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(230, 162, 60, 0.3);
    }
  }

  &--error {
    border-color: var(--error-color);

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(245, 108, 108, 0.3);
    }
  }

  &--offline {
    border-color: var(--info-color);
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-lg);
  }

  &__name {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  &__location {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &__metrics {
    display: grid;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(247, 250, 252, 0.8) 100%);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
      background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 250, 252, 1) 100%);
      box-shadow: var(--shadow-md);
    }
  }

  &__metric-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &.temp {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.05) 100%);
      color: #f56c6c;

      &::after {
        background: radial-gradient(circle, rgba(245, 108, 108, 0.2) 0%, transparent 70%);
      }
    }

    &.humidity {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
      color: #409eff;

      &::after {
        background: radial-gradient(circle, rgba(64, 158, 255, 0.2) 0%, transparent 70%);
      }
    }

    &.air {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
      color: #67c23a;

      &::after {
        background: radial-gradient(circle, rgba(103, 194, 58, 0.2) 0%, transparent 70%);
      }
    }

    .room-card__metric:hover & {
      transform: scale(1.1) rotate(5deg);

      &::after {
        opacity: 1;
      }
    }
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
    letter-spacing: -0.5px;
  }

  &__metric-label {
    font-size: 12px;
    color: var(--text-tertiary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
    padding-top: var(--space-md);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__devices,
  &__time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .room-card {
    padding: var(--space-md);

    &__header {
      flex-direction: column;
      gap: var(--space-sm);
    }

    &__name {
      font-size: 18px;
    }

    &__metric-icon {
      width: 36px;
      height: 36px;
    }

    &__metric-value {
      font-size: 16px;
    }

    &__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-xs);
    }
  }
}
</style>
