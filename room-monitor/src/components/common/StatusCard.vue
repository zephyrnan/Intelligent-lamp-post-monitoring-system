<template>
  <div class="status-card" :class="`status-card--${status}`">
    <div class="status-card__background"></div>

    <div class="status-card__header">
      <div class="status-card__icon-wrapper">
        <div class="status-card__icon" :class="`status-card__icon--${status}`">
          <el-icon :size="iconSize">
            <component :is="statusIcon" />
          </el-icon>
        </div>
        <div class="status-card__pulse" :class="`status-card__pulse--${status}`"></div>
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

      <div v-if="trend !== undefined" class="status-card__trend" :class="`status-card__trend--${trendDirection}`">
        <div class="status-card__trend-icon">
          <el-icon :size="12">
            <ArrowUp v-if="trendDirection === 'up'" />
            <ArrowDown v-if="trendDirection === 'down'" />
            <Minus v-if="trendDirection === 'stable'" />
          </el-icon>
        </div>
        <span class="status-card__trend-text">{{ Math.abs(trend) }}%</span>
      </div>
    </div>

    <div v-if="description" class="status-card__description">
      {{ description }}
    </div>

    <div class="status-card__decoration"></div>
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
  ArrowDown,
  Minus
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
  iconSize: 28
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
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
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
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--shadow-2xl);

    .status-card__background {
      opacity: 0.1;
      transform: scale(1.1);
    }

    .status-card__icon {
      transform: scale(1.1);
    }

    .status-card__pulse {
      animation: pulse-ring 1.5s infinite;
    }
  }

  &--success {
    border-left: 4px solid var(--success-color);

    .status-card__background {
      background: var(--gradient-success);
    }
  }

  &--warning {
    border-left: 4px solid var(--warning-color);

    .status-card__background {
      background: var(--gradient-warning);
    }
  }

  &--error {
    border-left: 4px solid var(--error-color);

    .status-card__background {
      background: var(--gradient-error);
    }
  }

  &--info {
    border-left: 4px solid var(--info-color);

    .status-card__background {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }
  }

  &__background {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-lg);
    position: relative;
    z-index: 1;
  }

  &__icon-wrapper {
    position: relative;
    margin-right: var(--space-md);
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%);
      color: var(--success-color);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
    }

    &--warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%);
      color: var(--warning-color);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.25);
    }

    &--error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.25) 100%);
      color: var(--error-color);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25);
    }

    &--info {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.25) 100%);
      color: var(--info-color);
      box-shadow: 0 8px 25px rgba(107, 114, 128, 0.25);
    }
  }

  &__pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    transform: translate(-50%, -50%);
    z-index: 1;
    opacity: 0.6;

    &--success {
      background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
    }

    &--warning {
      background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
    }

    &--error {
      background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
    }

    &--info {
      background: radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, transparent 70%);
    }
  }

  &__title {
    flex: 1;

    h3 {
      margin: 0 0 var(--space-xs) 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 14px;
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
    gap: var(--space-xs);
  }

  &__number {
    font-size: 36px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &__unit {
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    backdrop-filter: blur(10px);

    &--up {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%);
      color: var(--success-color);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    &--down {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
      color: var(--error-color);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    &--stable {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.2) 100%);
      color: var(--text-secondary);
      border: 1px solid rgba(107, 114, 128, 0.2);
    }
  }

  &__trend-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__trend-text {
    font-variant-numeric: tabular-nums;
  }

  &__description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    position: relative;
    z-index: 1;
    margin: 0;
  }

  &__decoration {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .status-card {
    padding: var(--space-lg);

    &__number {
      font-size: 32px;
    }
  }
}

@media (max-width: 768px) {
  .status-card {
    padding: var(--space-md);

    &__header {
      margin-bottom: var(--space-md);
    }

    &__icon {
      width: 48px;
      height: 48px;
    }

    &__pulse {
      width: 48px;
      height: 48px;
    }

    &__title h3 {
      font-size: 16px;
    }

    &__number {
      font-size: 28px;
    }

    &__content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm);
    }

    &__trend {
      align-self: flex-end;
    }
  }
}

@media (max-width: 480px) {
  .status-card {
    padding: var(--space-md);

    &__header {
      flex-direction: column;
      align-items: flex-start;
      text-align: center;
      gap: var(--space-sm);
    }

    &__icon-wrapper {
      margin-right: 0;
      align-self: center;
    }

    &__title {
      text-align: center;
    }

    &__content {
      text-align: center;
    }

    &__trend {
      align-self: center;
    }
  }
}
</style>