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

      <div class="metrics-section">
        <StatusCard
          title="当前温度"
          :value="roomStore.currentRoom.temperature !== undefined ? roomStore.currentRoom.temperature : 'N/A'"
          unit="°C"
          :status="getMetricStatus('temperature')"
          description="房间实时温度监测"
        />
        <StatusCard
          title="当前湿度"
          :value="roomStore.currentRoom.humidity !== undefined ? roomStore.currentRoom.humidity : 'N/A'"
          unit="%"
          :status="getMetricStatus('humidity')"
          description="房间实时湿度监测"
        />
        <StatusCard
          title="空气质量"
          :value="roomStore.currentRoom.airQuality !== undefined ? roomStore.currentRoom.airQuality : 'N/A'"
          :status="getMetricStatus('airQuality')"
          description="房间空气质量指数"
        />
      </div>

      <div class="charts-section">
        <div style="margin-top: 16px;">
          <WebSocketVideoStream 
            v-if="roomStore.currentRoom && roomStore.currentRoom.id" 
            :room-id="roomStore.currentRoom.id" 
            :title="`${roomStore.currentRoom.name} 实时视频`" 
            :height="360" 
          />
        </div>
      </div>
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
import { ArrowLeft, Clock, Refresh } from '@element-plus/icons-vue'
import { useRoomStore, useWebSocketStore } from '@/stores'
import StatusCard from '@/components/common/StatusCard.vue'
import WebSocketVideoStream from '@/components/WebSocketVideoStream.vue'
import type { Room } from '@/types'

interface Props {
  id: string
}

const props = defineProps<Props>()

const roomStore = useRoomStore()
const wsStore = useWebSocketStore()

const chartsLoading = ref(false)

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

// 监听路由参数变化，当ID改变时重新获取数据
watch(
  () => props.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      fetchRoomData()
    }
  }
)

onUnmounted(() => {
  wsStore.leaveRoom(props.id)
})

async function fetchRoomData() {
  try {
    console.log('Fetching room data for ID:', props.id)
    await roomStore.fetchRoomById(props.id)
    console.log('Room data fetched:', roomStore.currentRoom)
    if (roomStore.currentRoom) {
      wsStore.joinRoom(props.id)
    }
  } catch (error) {
    console.error('Failed to fetch room data:', error)
    // 可以在这里添加用户友好的错误提示
  }
}


function refreshData() {
  fetchRoomData()
}

function setupWebSocketListeners() {
  wsStore.on('room_data_update', (data: { roomId: string; temperature: number; humidity: number; airQuality: number; timestamp: string }) => {
    if (data.roomId === props.id) {
      roomStore.updateRoomData(data.roomId, data)
    }
  })

  wsStore.on('room_status_update', (data: { roomId: string; status: Room['status'] }) => {
    if (data.roomId === props.id) {
      roomStore.updateRoomStatus(data.roomId, data.status)
    }
  })
}

function getMetricStatus(metric: 'temperature' | 'humidity' | 'airQuality'): 'success' | 'warning' | 'error' | 'info' {
  if (!roomStore.currentRoom) return 'info'

  const value = roomStore.currentRoom[metric]

  switch (metric) {
    case 'temperature':
      if (value < 18 || value > 28) return 'error'
      if (value < 20 || value > 26) return 'warning'
      return 'success'
    case 'humidity':
      if (value < 30 || value > 80) return 'error'
      if (value < 40 || value > 70) return 'warning'
      return 'success'
    case 'airQuality':
      if (value > 200) return 'error'
      if (value > 100) return 'warning'
      return 'success'
    default:
      return 'info'
  }
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
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
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .room-info h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    .room-meta {
      display: flex;
      align-items: center;
      gap: 16px;

      .update-time {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.charts-section {
  margin-bottom: 32px;
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

  .metrics-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>