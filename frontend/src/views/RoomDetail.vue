<template>
  <div class="room-detail-page">
    <div v-if="roomStore.loading" class="loading-container">
      <el-skeleton :loading="true" animated>
        <template #template>
          <div class="skeleton-content">
            <el-skeleton-item variant="rect" style="width: 100%; height: 200px;" />
            <div style="padding: 14px;">
              <el-skeleton-item variant="h1" style="width: 50%" />
              <div style="display: flex; align-items: center; justify-items: space-between;">
                <el-skeleton-item variant="text" style="margin-right: 16px;" />
                <el-skeleton-item variant="text" style="width: 30%;" />
              </div>
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="roomStore.currentRoom">
      <div class="page-header">
        <div class="header-left">
          <el-button @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>

          <div class="room-info">
            <h1>{{ roomStore.currentRoom.name }}</h1>
            <div class="room-meta">
              <el-tag :type="statusType" size="large">
                {{ statusText }}
              </el-tag>
              <span class="update-time">
                <el-icon><Clock /></el-icon>
                {{ formatTime(roomStore.currentRoom.lastUpdateTime) }}
              </span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>

      <div class="sensor-data-section">
        <div class="section-header">
          <h2>传感器数据</h2>
          <el-tag :type="statusType" size="large">
            {{ getWarnLabel(currentSensorData.warn) }}
          </el-tag>
        </div>

        <div class="sensor-list">
          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><TrendCharts /></el-icon>
              <span>温度</span>
            </div>
            <div class="sensor-value" :class="getTemperatureClass(currentSensorData.temp)">
              {{ currentSensorData.temp }} °C
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Drizzling /></el-icon>
              <span>湿度</span>
            </div>
            <div class="sensor-value" :class="getHumidityClass(currentSensorData.hum)">
              {{ currentSensorData.hum }} %
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Warning /></el-icon>
              <span>烟雾浓度</span>
            </div>
            <div class="sensor-value" :class="getSmokeClass(currentSensorData.smoke)">
              {{ currentSensorData.smoke }}
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Sunny /></el-icon>
              <span>光照强度 (Lux)</span>
            </div>
            <div class="sensor-value">
              {{ currentSensorData.lux }}
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Lightning /></el-icon>
              <span>旁路电流 (A)</span>
            </div>
            <div class="sensor-value">
              {{ currentSensorData.sc }}
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Odometer /></el-icon>
              <span>旁路电压 (V)</span>
            </div>
            <div class="sensor-value">
              {{ currentSensorData.sv }}
            </div>
          </div>

          <div class="sensor-item">
            <div class="sensor-label">
              <el-icon><Reading /></el-icon>
              <span>总电压 (V)</span>
            </div>
            <div class="sensor-value">
              {{ currentSensorData.bv }}
            </div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div style="margin-top: 16px;">
          <WebSocketVideoStream
            v-if="roomStore.currentRoom && roomStore.currentRoom.id"
            :room-id="roomStore.currentRoom.id"
            :title="`${roomStore.currentRoom.name} 实时视频`"
            :height="360"
          >
            <template #actions>
              <el-button
                type="warning"
                @click="handlePersonDetection"
                :loading="detecting"
                size="default"
              >
                <el-icon><User /></el-icon>
                人员检测
              </el-button>
            </template>
          </WebSocketVideoStream>
        </div>
      </div>

      <DeviceControl
        v-if="roomStore.currentRoom && roomStore.currentRoom.id"
        :room-id="roomStore.currentRoom.id"
      />
    </template>

    <div v-else class="error-container">
      <el-result
        icon="error"
        title="数据加载失败"
        sub-title="无法获取房间信息，请检查网络连接或稍后重试"
      >
        <template #extra>
          <el-button type="primary" @click="fetchRoomData">
            重新加载
          </el-button>
          <el-button @click="$router.go(-1)">
            返回上页
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ArrowLeft, Clock, Refresh, TrendCharts, Drizzling,
  Sunny, Lightning, Odometer, Reading, Warning, User
} from '@element-plus/icons-vue'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { useRoomStore, useWebSocketStore } from '@/stores'
import WebSocketVideoStream from '@/components/WebSocketVideoStream.vue'
import DeviceControl from '@/components/common/DeviceControl.vue'
import type { Room, SensorData, SensorThresholdConfig } from '@/types'
import { realRoomApi, detectionApi } from '@/api'
import { useRouter } from 'vue-router'

interface Props {
  id: string
}

const props = defineProps<Props>()

const roomStore = useRoomStore()
const wsStore = useWebSocketStore()
const router = useRouter()

const sensorData = ref<SensorData | null>(null)
const detecting = ref(false)

// 当前传感器数据
const currentSensorData = computed(() => {
  if (!sensorData.value) {
    return {
      smoke: 0,
      temp: 0,
      water: 0,
      warn: 0,
      hum: 0,
      sc: 0,
      lux: 0,
      sv: 0,
      bv: 0
    }
  }
  return {
    smoke: Number(sensorData.value.smokeLevel) || 0,
    temp: Number(sensorData.value.temperature) || 0,
    water: Number(sensorData.value.water) || 0,
    warn: Number(sensorData.value.warn) || 0,
    hum: Number(sensorData.value.hum) || 0,
    sc: Number(sensorData.value.sc) || 0,
    lux: Number(sensorData.value.lux) || 0,
    sv: Number(sensorData.value.sv) || 0,
    bv: Number(sensorData.value.bv) || 0
  }
})

const statusType = computed(() => {
  if (!roomStore.currentRoom) return 'info'
  const typeMap = {
    normal: 'success',
    warning: 'warning',
    error: 'danger',
    offline: 'info'
  }
  return typeMap[roomStore.currentRoom.status] as any
})

const statusText = computed(() => {
  if (!roomStore.currentRoom) return ''
  const textMap = {
    normal: '正常',
    warning: '警告',
    error: '异常',
    offline: '离线'
  }
  return textMap[roomStore.currentRoom.status]
})


onMounted(() => {
  fetchRoomData()
  setupWebSocketListeners()
})

// 竞态防护：记录当前请求的 roomId，丢弃过期响应
let fetchRequestId = 0

// 监听路由参数变化，当ID改变时重新获取数据
watch(
  () => props.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      wsStore.leaveRoom(oldId)
      wsStore.off('room_data_update')
      wsStore.off('room_status_update')
      fetchRoomData()
      setupWebSocketListeners()
    }
  }
)

onUnmounted(() => {
  wsStore.leaveRoom(props.id)
  wsStore.off('room_data_update')
  wsStore.off('room_status_update')
})

async function fetchRoomData() {
  const requestId = ++fetchRequestId
  try {
    await roomStore.fetchRoomById(props.id)

    // 丢弃过期响应
    if (requestId !== fetchRequestId) return

    const sensorResponse = await realRoomApi.getRealtimeSensorData(props.id)
    if (requestId !== fetchRequestId) return

    if (sensorResponse.code === 200) {
      sensorData.value = sensorResponse.data
      checkAndNotifyAlarm(sensorResponse.data)
    }

    if (requestId !== fetchRequestId) return

    if (roomStore.currentRoom) {
      wsStore.joinRoom(props.id)
    }
  } catch (error) {
    console.error('Failed to fetch room data:', error)
  }
}

// 泛型传感器阈值配置表
const sensorThresholds: SensorThresholdConfig = {
  temperature: {
    type: 'temperature',
    label: '温度',
    unit: '°C',
    levels: {
      critical: { min: 18, max: 28 },   // 超出此范围为 critical
      high: { min: 20, max: 26 },        // 超出此范围为 high
      medium: { min: 22, max: 25 },      // 超出此范围为 medium
      low: {}                             // 其余为 low
    }
  },
  humidity: {
    type: 'humidity',
    label: '湿度',
    unit: '%',
    levels: {
      critical: { min: 30, max: 80 },
      high: { min: 40, max: 70 },
      medium: { min: 45, max: 65 },
      low: {}
    }
  },
  smoke: {
    type: 'smoke',
    label: '烟雾浓度',
    unit: '',
    levels: {
      critical: { max: 50 },   // 超过 50 为 critical
      high: { max: 30 },       // 超过 30 为 high
      medium: { max: 20 },     // 超过 20 为 medium
      low: {}
    }
  },
  water: {
    type: 'water',
    label: '水位',
    unit: '',
    levels: {
      critical: { max: 80 },
      high: { max: 60 },
      medium: { max: 40 },
      low: {}
    }
  }
}

// 根据阈值配置判断单个传感器的告警级别
function evaluateSensorLevel(
  value: number,
  threshold: SensorThresholdConfig[keyof SensorThresholdConfig]
): 'critical' | 'high' | 'medium' | 'low' | null {
  const { levels } = threshold
  const orderedLevels: Array<'critical' | 'high' | 'medium'> = ['critical', 'high', 'medium']

  for (const level of orderedLevels) {
    const range = levels[level]
    if (range.min !== undefined && range.max !== undefined) {
      if (value < range.min || value > range.max) return level
    } else if (range.max !== undefined) {
      if (value > range.max) return level
    } else if (range.min !== undefined) {
      if (value < range.min) return level
    }
  }
  return null
}

// 检测报警并推送通知（基于泛型阈值配置）
function checkAndNotifyAlarm(data: SensorData) {
  const warnLevel = Number(data.warn) || 0

  if (warnLevel === 0) {
    return // 没有报警，不推送通知
  }

  // 根据报警级别设置通知类型和消息
  let notificationType: 'warning' | 'error' = 'warning'
  let title = '报警提醒'
  let message = ''

  if (warnLevel === 1) {
    notificationType = 'warning'
    title = '⚠️ 警告'
    message = `${roomStore.currentRoom?.name || '灯杆'} 检测到异常情况，请注意查看！`
  } else if (warnLevel === 2) {
    notificationType = 'error'
    title = '🚨 严重报警'
    message = `${roomStore.currentRoom?.name || '灯杆'} 检测到严重异常，请立即处理！`
  }

  // 基于阈值配置逐项检查各传感器
  const sensorValues: Record<string, number> = {
    temperature: Number(data.temperature) || 0,
    humidity: Number(data.hum) || 0,
    smoke: Number(data.smokeLevel) || 0,
    water: Number(data.water) || 0
  }

  const details: string[] = []

  for (const [sensorType, value] of Object.entries(sensorValues)) {
    const config = sensorThresholds[sensorType as keyof SensorThresholdConfig]
    if (!config) continue

    const level = evaluateSensorLevel(value, config)
    if (level) {
      const levelLabel = { critical: '严重', high: '警告', medium: '注意', low: '提示' }[level]
      details.push(`${config.label}: ${value}${config.unit} (${levelLabel})`)
    }
  }

  if (details.length > 0) {
    message += '\n\n异常指标：\n' + details.join('\n')
  }

  // 显示通知，3秒后自动关闭
  ElNotification({
    type: notificationType,
    title: title,
    message: message,
    duration: 3000,
    dangerouslyUseHTMLString: false,
    showClose: true,
    position: 'top-right',
    offset: 80
  })
}


function refreshData() {
  fetchRoomData()
}

function setupWebSocketListeners() {
  wsStore.on('room_data_update', (data: { roomId: string; temperature: number; humidity: number; airQuality: number; timestamp: string }) => {
    if (data.roomId === props.id) {
      roomStore.updateRoomData(data.roomId, data)
      // 同步更新本地 sensorData 以驱动 UI 实时刷新
      if (sensorData.value) {
        sensorData.value = { ...sensorData.value, ...data }
      }
    }
  })

  wsStore.on('room_status_update', (data: { roomId: string; status: Room['status'] }) => {
    if (data.roomId === props.id) {
      roomStore.updateRoomStatus(data.roomId, data.status)
    }
  })
}

function getSmokeClass(smoke: number): string {
  if (smoke > 50) return 'value-error'
  if (smoke > 30) return 'value-warning'
  return 'value-normal'
}

function getTemperatureClass(temp: number): string {
  if (temp < 18 || temp > 28) return 'value-error'
  if (temp < 20 || temp > 26) return 'value-warning'
  return 'value-normal'
}

function getHumidityClass(humidity: number): string {
  if (humidity < 30 || humidity > 80) return 'value-error'
  if (humidity < 40 || humidity > 70) return 'value-warning'
  return 'value-normal'
}

function getWarnType(warn: number): 'success' | 'warning' | 'danger' {
  if (warn === 0) return 'success'
  if (warn === 1) return 'warning'
  return 'danger'
}

function getWarnLabel(warn: number): string {
  if (warn === 0) return '正常'
  if (warn === 1) return '警告'
  return '严重'
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}

// 人员检测功能
async function handlePersonDetection() {
  try {
    detecting.value = true

    ElMessage({
      message: '正在执行人员检测，请稍候...',
      type: 'info',
      duration: 2000
    })

    // 调用人员检测API
    const result = await detectionApi.detectPerson(props.id)

    if (result.code === 200) {
      ElNotification({
        title: '人员检测完成',
        message: `检测到 ${result.data.personCount} 人，结果已保存到检测记录`,
        type: 'success',
        duration: 4000,
        position: 'top-right',
        offset: 80
      })

      // 询问用户是否跳转到检测记录页面
      ElMessageBox.confirm(
        '人员检测已完成，是否查看检测记录？',
        '提示',
        {
          confirmButtonText: '查看记录',
          cancelButtonText: '留在当前页',
          type: 'success'
        }
      ).then(() => {
        router.push('/detection-history')
      }).catch(() => {
        // 用户选择留在当前页面
      })
    }
  } catch (error: any) {
    console.error('人员检测失败:', error)
    ElNotification({
      title: '人员检测失败',
      message: error.message || '执行人员检测时发生错误',
      type: 'error',
      duration: 3000,
      position: 'top-right',
      offset: 80
    })
  } finally {
    detecting.value = false
  }
}
</script>

<style scoped lang="scss">
.room-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.skeleton-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .room-info h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .room-meta {
      display: flex;
      align-items: center;
      gap: 16px;

      .update-time {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }
  }
}

.sensor-data-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .sensor-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .sensor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--border-light);
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--border-medium);
      }

      &.full-width {
        grid-column: 1 / -1;
      }

      .sensor-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;

        .el-icon {
          font-size: 18px;
          color: var(--primary-color);
        }
      }

      .sensor-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);

        &.value-normal {
          color: var(--success-color);
        }

        &.value-warning {
          color: var(--warning-color);
        }

        &.value-error {
          color: var(--error-color);
        }
      }
    }
  }
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.charts-section {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .header-left {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .room-info h1 {
        font-size: 24px;
      }

      .room-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .header-actions {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .sensor-data-section {
    padding: 16px;

    .sensor-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>