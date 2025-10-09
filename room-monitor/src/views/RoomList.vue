<template>
  <div class="room-list-page">
    <div class="page-header">
      <div class="header-content">
        <h2>房间监控概览</h2>
        <p>实时监控所有房间的环境状态和设备运行情况</p>
      </div>

      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索房间"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          style="width: 140px"
          clearable
          @change="handleStatusFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="警告" value="warning" />
          <el-option label="异常" value="error" />
          <el-option label="离线" value="offline" />
        </el-select>

        <el-button type="primary" @click="refreshRooms">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <StatusCard
        title="总房间数"
        :value="roomStore.roomStats.total"
        status="info"
        :trend="0"
        description="系统监控的房间总数"
      />
      <StatusCard
        title="正常运行"
        :value="roomStore.roomStats.normal"
        status="success"
        :trend="5"
        description="环境参数正常的房间数"
      />
      <StatusCard
        title="警告状态"
        :value="roomStore.roomStats.warning"
        status="warning"
        :trend="-2"
        description="需要关注的房间数"
      />
      <StatusCard
        title="异常状态"
        :value="roomStore.roomStats.error"
        status="error"
        :trend="1"
        description="存在异常的房间数"
      />
    </div>

    <div class="room-grid">
      <div
        v-if="roomStore.loading"
        class="loading-container"
      >
        <el-skeleton
          v-for="i in 6"
          :key="i"
          :loading="true"
          animated
        >
          <template #template>
            <div class="skeleton-card">
              <el-skeleton-item variant="rect" style="width: 100%; height: 200px;" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <div
        v-else-if="roomStore.rooms.length === 0"
        class="empty-container"
      >
        <el-empty description="暂无房间数据" />
      </div>

      <template v-else>
        <div 
          v-for="room in roomStore.rooms"
          :key="room.id"
          class="room-card-with-video"
        >
          <RoomCard
            :room="room"
            @click="handleRoomClick"
          />
          <div class="room-inline-video">
            <WebSocketVideoStream :room-id="room.id" :title="room.name + ' 实时视频'" :height="200" />
          </div>
        </div>
      </template>
    </div>

    <div v-if="roomStore.total > roomStore.pagination.pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="roomStore.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useRoomStore, useWebSocketStore } from '@/stores'
import StatusCard from '@/components/common/StatusCard.vue'
import RoomCard from '@/components/common/RoomCard.vue'
import WebSocketVideoStream from '@/components/WebSocketVideoStream.vue'
import type { Room } from '@/types'

const router = useRouter()
const roomStore = useRoomStore()
const wsStore = useWebSocketStore()

const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const searchTimer = ref<ReturnType<typeof setTimeout>>()

const filterParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  status: statusFilter.value || undefined,
  search: searchKeyword.value || undefined
}))

onMounted(() => {
  fetchRooms()
  setupWebSocketListeners()
})

async function fetchRooms() {
  try {
    await roomStore.fetchRooms(filterParams.value)
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
  }
}

function refreshRooms() {
  fetchRooms()
}

function handleSearch() {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }

  searchTimer.value = setTimeout(() => {
    currentPage.value = 1
    fetchRooms()
  }, 500)
}

function handleStatusFilter() {
  currentPage.value = 1
  fetchRooms()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchRooms()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchRooms()
}

function handleRoomClick(room: Room) {
  router.push(`/room/${room.id}`)
}

function setupWebSocketListeners() {
  wsStore.on('room_status_update', (data: { roomId: string; status: Room['status'] }) => {
    roomStore.updateRoomStatus(data.roomId, data.status)
  })

  wsStore.on('room_data_update', (data: { roomId: string; temperature: number; humidity: number; airQuality: number }) => {
    roomStore.updateRoomData(data.roomId, data)
  })
}
</script>

<style scoped lang="scss">
.room-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl);
  padding: var(--space-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

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
    transform: translateY(-2px);
    box-shadow: var(--shadow-2xl);
  }

  .header-content {
    position: relative;
    z-index: 1;

    h2 {
      margin: 0 0 var(--space-sm) 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 15px;
      font-weight: 500;
      line-height: 1.4;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    position: relative;
    z-index: 1;

    .el-input {
      :deep(.el-input__wrapper) {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-color-light);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
      }
    }

    .el-select {
      :deep(.el-select__wrapper) {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-color-light);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
      }
    }

    .el-button {
      background: var(--gradient-primary);
      border: none;
      padding: var(--space-sm) var(--space-lg);
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: var(--shadow-lg);
      }
    }
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
  animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

.loading-container,
.empty-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .loading-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-lg);
    width: 100%;
  }
}

.skeleton-card {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    animation: loading-shimmer 1.5s infinite;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  backdrop-filter: blur(20px);

  :deep(.el-pagination) {
    .el-pager li {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-md);
      margin: 0 2px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--gradient-primary);
        color: white;
        transform: scale(1.1);
      }

      &.is-active {
        background: var(--gradient-primary);
        color: white;
      }
    }

    .btn-prev,
    .btn-next {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-md);
      transition: all 0.3s ease;

      &:hover {
        background: var(--gradient-primary);
        color: white;
      }
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .room-list-page {
    max-width: 100%;
    padding: 0 var(--space-lg);
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: var(--space-lg);
  }
}

@media (max-width: 768px) {
  .room-list-page {
    padding: 0 var(--space-md);
  }

  .page-header {
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-lg);
    text-align: center;

    .header-content {
      h2 {
        font-size: 24px;
      }

      p {
        font-size: 14px;
      }
    }

    .header-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-md);

      .el-input,
      .el-select {
        width: 100% !important;
      }

      .el-button {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .room-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .pagination {
    padding: var(--space-lg);

    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .room-list-page {
    padding: 0 var(--space-sm);
  }

  .page-header {
    padding: var(--space-md);
    margin-bottom: var(--space-xl);

    .header-content h2 {
      font-size: 20px;
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .room-grid {
    gap: var(--space-sm);
  }

  .pagination {
    padding: var(--space-md);

    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__sizes {
        display: none;
      }
    }
  }
}

@media (max-width: 360px) {
  .page-header .header-content h2 {
    font-size: 18px;
  }
}
</style>