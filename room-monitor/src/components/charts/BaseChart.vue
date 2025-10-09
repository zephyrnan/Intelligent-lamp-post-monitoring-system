<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div v-if="loading" class="chart-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </div>
    <div class="chart-content" :style="{ height: `${height}px` }">
      <v-chart
        v-if="!loading && chartData"
        :option="chartOption"
        :style="{ width: '100%', height: '100%' }"
        autoresize
      />
      <div v-else-if="!loading && !chartData" class="chart-empty">
        <el-empty description="暂无数据" />
      </div>
    </div>
    <div class="chart-decoration"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Loading } from '@element-plus/icons-vue'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

interface Props {
  title: string
  type: 'line' | 'bar' | 'pie'
  data: any
  loading?: boolean
  height?: number
  colors?: string[]
  showLegend?: boolean
  showDataZoom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: 300,
  colors: () => ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
  showLegend: true,
  showDataZoom: false
})

const chartData = computed(() => {
  if (!props.data) return null
  return props.data
})

const chartOption = computed((): EChartsOption => {
  if (!chartData.value) return {}

  const baseOption: EChartsOption = {
    color: props.colors,
    tooltip: {
      trigger: props.type === 'pie' ? 'item' : 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'transparent',
      borderRadius: 12,
      padding: [12, 16],
      textStyle: {
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: 500
      },
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      extraCssText: 'backdrop-filter: blur(10px);'
    },
    legend: props.showLegend ? {
      top: 10,
      textStyle: {
        color: 'var(--text-secondary)',
        fontSize: 14,
        fontWeight: 500
      },
      itemStyle: {
        borderRadius: 4
      }
    } : undefined,
    grid: props.type !== 'pie' ? {
      left: '3%',
      right: '4%',
      bottom: props.showDataZoom ? '15%' : '3%',
      top: props.showLegend ? '15%' : '3%',
      containLabel: true
    } : undefined
  }

  if (props.type === 'line') {
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: chartData.value.labels,
        axisLabel: {
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 500,
          margin: 12
        },
        axisLine: {
          lineStyle: {
            color: 'var(--border-light)',
            width: 2
          }
        },
        axisTick: {
          lineStyle: {
            color: 'var(--border-medium)'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 500,
          margin: 12
        },
        splitLine: {
          lineStyle: {
            color: 'var(--border-light)',
            type: 'dashed',
            opacity: 0.6
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: chartData.value.datasets.map((dataset: any, index: number) => ({
        ...dataset,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 4,
          shadowBlur: 8,
          shadowColor: props.colors[index % props.colors.length],
          shadowOffsetY: 2
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
          shadowBlur: 6,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        areaStyle: {
          opacity: 0.1,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.colors[index % props.colors.length] },
              { offset: 1, color: 'transparent' }
            ]
          }
        }
      })),
      dataZoom: props.showDataZoom ? [{
        type: 'slider',
        height: 40,
        bottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'var(--border-light)',
        handleStyle: {
          color: 'var(--primary-color)',
          borderColor: 'var(--primary-color)'
        },
        moveHandleStyle: {
          color: 'var(--primary-color-light)'
        },
        selectedDataBackground: {
          lineStyle: {
            color: 'var(--primary-color)',
            opacity: 0.3
          },
          areaStyle: {
            color: 'var(--primary-color)',
            opacity: 0.1
          }
        },
        dataBackground: {
          lineStyle: {
            color: 'var(--border-medium)',
            opacity: 0.5
          },
          areaStyle: {
            color: 'var(--bg-tertiary)',
            opacity: 0.3
          }
        },
        textStyle: {
          color: 'var(--text-secondary)',
          fontSize: 11
        }
      }] : undefined
    }
  }

  if (props.type === 'bar') {
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: chartData.value.labels,
        axisLabel: {
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 500,
          margin: 12
        },
        axisLine: {
          lineStyle: {
            color: 'var(--border-light)',
            width: 2
          }
        },
        axisTick: {
          lineStyle: {
            color: 'var(--border-medium)'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 500,
          margin: 12
        },
        splitLine: {
          lineStyle: {
            color: 'var(--border-light)',
            type: 'dashed',
            opacity: 0.6
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: chartData.value.datasets.map((dataset: any, index: number) => ({
        ...dataset,
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowOffsetY: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.colors[index % props.colors.length] },
              { offset: 1, color: 'rgba(255, 255, 255, 0.3)' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }))
    }
  }

  if (props.type === 'pie') {
    return {
      ...baseOption,
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '55%'],
        data: chartData.value.datasets[0].data.map((value: number, index: number) => ({
          name: chartData.value.labels[index],
          value
        })),
        itemStyle: {
          borderRadius: 12,
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowOffsetY: 4
        },
        label: {
          formatter: '{b}: {d}%',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 600,
          distance: 20
        },
        labelLine: {
          lineStyle: {
            color: 'var(--border-medium)',
            width: 2
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            fontSize: 16,
            fontWeight: 700
          }
        }
      }]
    }
  }

  return baseOption
})
</script>

<style scoped lang="scss">
.chart-container {
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
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: var(--shadow-2xl);

    .chart-decoration {
      opacity: 0.8;
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  position: relative;
  z-index: 1;
}

.chart-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--gradient-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 60px;
  }
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.2) 100%);
  color: var(--primary-color);
  font-size: 20px;
  animation: pulse-loading 2s infinite;

  .el-icon {
    animation: loading-spin 1.5s infinite linear;
  }
}

.chart-content {
  position: relative;
  z-index: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;

  :deep(.el-empty) {
    .el-empty__image {
      svg {
        fill: var(--text-tertiary);
      }
    }

    .el-empty__description {
      color: var(--text-secondary);
      font-weight: 500;
    }
  }
}

.chart-decoration {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(103, 194, 58, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-loading {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .chart-container {
    padding: var(--space-lg);
  }

  .chart-title {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .chart-container {
    padding: var(--space-md);
    margin: var(--space-sm);
  }

  .chart-header {
    margin-bottom: var(--space-md);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .chart-title {
    font-size: 16px;
  }

  .chart-loading {
    width: 36px;
    height: 36px;
    font-size: 18px;
    align-self: flex-end;
  }

  .chart-content {
    margin: 0 -var(--space-xs);
  }
}

@media (max-width: 480px) {
  .chart-container {
    padding: var(--space-sm);
  }

  .chart-title {
    font-size: 14px;
    text-align: center;
    align-self: center;
  }

  .chart-loading {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>