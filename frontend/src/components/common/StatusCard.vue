<template>
  <div class="status-card" :class="`status-card--${status}`">
    <div class="status-card__header">
      <div class="status-card__icon" :class="`status-card__icon--${status}`">
        <el-icon :size="iconSize">
          <component :is="statusIcon" />
        </el-icon>
      </div>
      <div class="status-card__title">
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="status-card__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="status-card__content">
      <div class="status-card__value">
        <span class="status-card__number">{{ value }}</span>
        <span v-if="unit" class="status-card__unit">{{ unit }}</span>
      </div>

      <div v-if="trend !== undefined && trend !== 0" class="status-card__trend" :class="`status-card__trend--${trendDirection}`">
        <el-icon :size="12">
          <ArrowUp v-if="trendDirection === 'up'" />
          <ArrowDown v-if="trendDirection === 'down'" />
        </el-icon>
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>

    <div v-if="description" class="status-card__description">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

interface Props {
  title: string
  subtitle?: string
  value: number | string
  unit?: string
  status: 'success' | 'warning' | 'error' | 'info'
  trend?: number
  description?: string
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 24
})

const statusIcon = computed(() => {
  const icons = {
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    info: InfoFilled
  }
  return icons[props.status]
})

const trendDirection = computed(() => {
  if (props.trend === undefined || props.trend === 0) return 'stable'
  return props.trend > 0 ? 'up' : 'down'
})
</script>

<style scoped lang="scss">
.status-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--border-medium);
  }

  &--success { border-left: 3px solid var(--success-color); }
  &--warning { border-left: 3px solid var(--warning-color); }
  &--error { border-left: 3px solid var(--error-color); }
  &--info { border-left: 3px solid var(--info-color); }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-md);

    &--success { background: rgba(80, 227, 194, 0.1); color: var(--success-color); }
    &--warning { background: rgba(245, 166, 35, 0.1); color: var(--warning-color); }
    &--error { background: rgba(238, 0, 0, 0.08); color: var(--error-color); }
    &--info { background: rgba(136, 136, 136, 0.1); color: var(--info-color); }
  }

  &__title {
    flex: 1;

    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__number {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    line-height: 1;
  }

  &__unit {
    font-size: 14px;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-weight: 600;

    &--up { background: rgba(80, 227, 194, 0.1); color: var(--success-color); }
    &--down { background: rgba(238, 0, 0, 0.08); color: var(--error-color); }
  }

  &__description {
    font-size: 12px;
    color: var(--text-tertiary);
    line-height: 1.5;
  }
}

@media (max-width: 768px) {
  .status-card {
    padding: var(--space-md);

    &__number {
      font-size: 28px;
    }

    &__icon {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
