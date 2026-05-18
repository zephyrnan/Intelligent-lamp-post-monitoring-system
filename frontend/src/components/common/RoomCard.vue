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
  if (isNaN(date.getTime())) return '未知时间'
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
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: border-color 0.15s ease;
  border: 1px solid var(--border-light);

  &:hover {
    border-color: var(--primary-color);
  }

  &--normal {}
  &--warning {}
  &--error {}
  &--offline { opacity: 0.7; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-md);
  }

  &__name {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__location {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &__metrics {
    display: grid;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    transition: background 0.15s ease;

    &:hover {
      background: var(--bg-tertiary);
    }
  }

  &__metric-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;

    &.temp { background: rgba(238, 0, 0, 0.06); color: var(--error-color); }
    &.humidity { background: rgba(0, 112, 243, 0.08); color: var(--primary-color); }
    &.air { background: rgba(80, 227, 194, 0.1); color: var(--success-color); }
  }

  &__metric-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__metric-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__metric-label {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-tertiary);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--border-light);
  }

  &__devices,
  &__time {
    display: flex;
    align-items: center;
    gap: 4px;
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
      font-size: 15px;
    }

    &__metric-icon {
      width: 28px;
      height: 28px;
    }

    &__metric-value {
      font-size: 14px;
    }

    &__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-xs);
    }
  }
}
</style>
