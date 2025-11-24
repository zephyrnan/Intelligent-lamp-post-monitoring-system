<template>
  <div class="detection-history-page">
    <div class="page-header">
      <div class="header-content">
        <h2>检测记录</h2>
        <p>查看摄像头检测到的异常事件记录</p>
      </div>

      <div class="header-actions">
        <el-select
          v-model="typeFilter"
          placeholder="类型筛选"
          style="width: 140px"
          clearable
          @change="handleTypeFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="运动" value="motion" />
          <el-option label="人员" value="person" />
          <el-option label="物体" value="object" />
        </el-select>

        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ss.SSS'Z'"
          @change="handleDateChange"
        />

        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="detection-grid">
      <div
        v-if="historyStore.loading"
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
              <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
              <div style="padding: 14px;">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <div style="display: flex; align-items: center; justify-items: space-between;">
                  <el-skeleton-item variant="text" style="margin-right: 16px;" />
                  <el-skeleton-item variant="text" style="width: 30%;" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <div
        v-else-if="historyStore.detectionHistory.length === 0"
        class="empty-container"
      >
        <el-empty description="暂无检测记录" />
      </div>

      <template v-else>
        <div
          v-for="record in historyStore.detectionHistory"
          :key="record.id"
          class="detection-card"
          @click="handleCardClick(record)"
        >
          <div class="detection-card__image">
            <img
              v-if="record.imageUrl"
              :src="record.imageUrl"
              :alt="`${record.type} 检测`"
              @error="handleImageError"
            />
            <div v-else class="no-image">
              <el-icon :size="48"><Picture /></el-icon>
              <span>无图片</span>
            </div>
          </div>

          <div class="detection-card__content">
            <div class="detection-card__header">
              <h3>{{ record.roomName }}</h3>
              <el-tag :type="getTypeTagType(record.type)" size="small">
                {{ getTypeLabel(record.type) }}
              </el-tag>
            </div>

            <div class="detection-card__info">
              <div class="confidence">
                <span class="label">置信度:</span>
                <el-progress
                  :percentage="Math.round(record.confidence * 100)"
                  :color="getConfidenceColor(record.confidence)"
                  :show-text="true"
                  text-inside
                  :stroke-width="16"
                />
              </div>

              <div class="timestamp">
                <el-icon><Clock /></el-icon>
                {{ formatTime(record.timestamp) }}
              </div>
            </div>

            <div v-if="record.description" class="detection-card__description">
              {{ record.description }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="historyStore.detectionTotal > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="historyStore.detectionTotal"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      title="检测图片"
      width="600px"
      center
    >
      <div class="image-preview">
        <img
          v-if="previewImage"
          :src="previewImage"
          alt="检测图片"
          style="width: 100%; height: auto;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Refresh, Clock, Picture } from '@element-plus/icons-vue'
import { useHistoryStore } from '@/stores'
import type { DetectionRecord } from '@/types'

const historyStore = useHistoryStore()

const typeFilter = ref('')
const timeRange = ref<[string, string]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  new Date().toISOString()
])
const currentPage = ref(1)
const pageSize = ref(24)
const imagePreviewVisible = ref(false)
const previewImage = ref('')

const filterParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  type: typeFilter.value || undefined,
  startTime: timeRange.value?.[0],
  endTime: timeRange.value?.[1]
}))

onMounted(() => {
  fetchDetectionHistory()
})

async function fetchDetectionHistory() {
  try {
    await historyStore.fetchDetectionHistory(filterParams.value)
  } catch (error) {
    console.error('Failed to fetch detection history:', error)
  }
}

function refreshData() {
  fetchDetectionHistory()
}

function handleTypeFilter() {
  currentPage.value = 1
  fetchDetectionHistory()
}

function handleDateChange() {
  currentPage.value = 1
  fetchDetectionHistory()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchDetectionHistory()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchDetectionHistory()
}

function handleCardClick(record: DetectionRecord) {
  if (record.imageUrl) {
    previewImage.value = record.imageUrl
    imagePreviewVisible.value = true
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = `
      <div class="no-image">
        <i class="el-icon-picture" style="font-size: 48px;"></i>
        <span>图片加载失败</span>
      </div>
    `
  }
}

function getTypeLabel(type: string): string {
  const labels = {
    motion: '运动检测',
    person: '人员检测',
    object: '物体检测'
  }
  return labels[type as keyof typeof labels] || type
}

function getTypeTagType(type: string) {
  const types = {
    motion: 'info',
    person: 'warning',
    object: 'success'
  }
  return types[type as keyof typeof types] || 'info'
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}
</script>

<style scoped lang="scss">
.detection-history-page {
  max-width: 1200px;
  margin: 0 auto;
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

  .header-content {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
}

.detection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.loading-container,
.empty-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.detection-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &__image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: #f5f7fa;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      gap: 8px;

      span {
        font-size: 14px;
      }
    }
  }

  &__content {
    padding: 16px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  &__info {
    margin-bottom: 12px;

    .confidence {
      margin-bottom: 8px;

      .label {
        display: inline-block;
        margin-bottom: 4px;
        font-size: 14px;
        color: #606266;
      }
    }

    .timestamp {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #909399;
    }
  }

  &__description {
    font-size: 14px;
    color: #606266;
    line-height: 1.4;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.image-preview {
  text-align: center;

  img {
    max-width: 100%;
    max-height: 500px;
    border-radius: 8px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .header-actions {
      width: 100%;
      flex-wrap: wrap;

      .el-select,
      .el-date-picker {
        flex: 1;
        min-width: 140px;
      }
    }
  }

  .detection-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .detection-grid {
    grid-template-columns: 1fr;
  }

  .page-header .header-actions {
    flex-direction: column;
    align-items: stretch;

    .el-select,
    .el-date-picker,
    .el-button {
      width: 100%;
    }
  }
}
</style>