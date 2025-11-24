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
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border-left: 5px solid;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    opacity: 0.05;
    transition: all 0.4s ease;
  }

  &:hover {
    box-shadow: var(--shadow-2xl);
    transform: translateY(-6px) scale(1.02);

    &::before {
      transform: scale(1.3);
      opacity: 0.08;
    }
  }

  &--success {
    border-color: var(--success-color);

    &::before {
      background: radial-gradient(circle, var(--success-color) 0%, transparent 70%);
      right: -30px;
      top: -30px;
    }

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(103, 194, 58, 0.25);
    }
  }

  &--warning {
    border-color: var(--warning-color);

    &::before {
      background: radial-gradient(circle, var(--warning-color) 0%, transparent 70%);
      right: -30px;
      top: -30px;
    }

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(230, 162, 60, 0.25);
    }
  }

  &--error {
    border-color: var(--error-color);

    &::before {
      background: radial-gradient(circle, var(--error-color) 0%, transparent 70%);
      right: -30px;
      top: -30px;
    }

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(245, 108, 108, 0.25);
    }
  }

  &--info {
    border-color: var(--info-color);

    &::before {
      background: radial-gradient(circle, var(--info-color) 0%, transparent 70%);
      right: -30px;
      top: -30px;
    }

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(144, 147, 153, 0.25);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-lg);
    position: relative;
    transition: all 0.4s ease;

    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    &--success {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
      color: var(--success-color);

      &::before {
        background: linear-gradient(135deg, var(--success-color), rgba(103, 194, 58, 0.3));
        filter: blur(8px);
      }
    }

    &--warning {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.05) 100%);
      color: var(--warning-color);

      &::before {
        background: linear-gradient(135deg, var(--warning-color), rgba(230, 162, 60, 0.3));
        filter: blur(8px);
      }
    }

    &--error {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.05) 100%);
      color: var(--error-color);

      &::before {
        background: linear-gradient(135deg, var(--error-color), rgba(245, 108, 108, 0.3));
        filter: blur(8px);
      }
    }

    &--info {
      background: linear-gradient(135deg, rgba(144, 147, 153, 0.15) 0%, rgba(144, 147, 153, 0.05) 100%);
      color: var(--info-color);

      &::before {
        background: linear-gradient(135deg, var(--info-color), rgba(144, 147, 153, 0.3));
        filter: blur(8px);
      }
    }

    .status-card:hover & {
      transform: scale(1.1) rotate(-5deg);

      &::before {
        opacity: 1;
      }
    }
  }

  &__title {
    flex: 1;
    position: relative;

    h3 {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-md);
    position: relative;
    z-index: 1;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  &__number {
    font-size: 36px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -1px;
    line-height: 1;
  }

  &__unit {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 700;

    &--up {
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%);
      color: var(--success-color);
    }

    &--down {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.15) 0%, rgba(245, 108, 108, 0.05) 100%);
      color: var(--error-color);
    }
  }

  &__description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }
}

@media (max-width: 768px) {
  .status-card {
    padding: var(--space-lg);

    &__number {
      font-size: 30px;
    }

    &__icon {
      width: 48px;
      height: 48px;
    }
  }
}
</style>
