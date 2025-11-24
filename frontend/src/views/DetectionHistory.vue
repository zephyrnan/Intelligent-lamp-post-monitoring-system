<template>
  <div class="detection-history-page">
    <div class="page-header">
      <div class="header-content">
        <h2>检测记录</h2>
        <p>查看摄像头检测到的异常事件记录</p>
      </div>

      <div class="header-actions">
        <el-input
          v-model="detectionIdFilter"
          placeholder="检测编号"
          style="width: 200px"
          clearable
          @change="handleDetectionIdFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

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

    <div class="detection-table-container">
      <el-table
        v-loading="loading"
        :data="detections"
        style="width: 100%"
        :empty-text="'暂无检测记录'"
        stripe
        border
      >
        <el-table-column prop="roomId" label="房间编号" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.roomId }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="personCount" label="人员数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="large">
              <el-icon style="margin-right: 4px;"><User /></el-icon>
              {{ row.personCount }} 人
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="检测详情" min-width="200">
          <template #default="{ row }">
            <div v-if="row.detections && row.detections.length > 0" class="detections-cell">
              <div v-for="(det, idx) in row.detections" :key="idx" class="detection-item">
                <span class="detection-label">{{ det.label }}</span>
                <el-progress
                  :percentage="Math.round(det.confidence * 100)"
                  :color="getConfidenceColor(det.confidence)"
                  :show-text="true"
                  text-inside
                  :stroke-width="18"
                  style="width: 100px"
                />
              </div>
            </div>
            <span v-else class="text-placeholder">无详情</span>
          </template>
        </el-table-column>

        <el-table-column prop="timestamp" label="检测时间" width="180" align="center">
          <template #default="{ row }">
            <div class="timestamp-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ formatTime(row.timestamp) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="原始图片" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.originalImage"
              type="primary"
              size="small"
              @click="handleViewImage(row.originalImage, '原始图片')"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <span v-else class="text-placeholder">无图片</span>
          </template>
        </el-table-column>

        <el-table-column label="检测图片" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.detectedImage"
              type="success"
              size="small"
              @click="handleViewImage(row.detectedImage, '检测图片')"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <span v-else class="text-placeholder">无图片</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      :title="previewImageTitle"
      width="800px"
      center
    >
      <div class="image-preview">
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="previewImageTitle"
          style="width: 100%; height: auto; max-height: 600px; object-fit: contain;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Refresh, Clock, Picture, Search, User, View, Delete } from '@element-plus/icons-vue'
import { detectionApi, type PersonDetection } from '@/api/detectionApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const detectionIdFilter = ref('')
const timeRange = ref<[string, string]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  new Date().toISOString()
])
const currentPage = ref(1)
const pageSize = ref(20)
const imagePreviewVisible = ref(false)
const previewImage = ref('')
const previewImageTitle = ref('')
const loading = ref(false)
const detections = ref<PersonDetection[]>([])
const total = ref(0)

const filterParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  detectionId: detectionIdFilter.value || undefined,
  startTime: timeRange.value?.[0],
  endTime: timeRange.value?.[1]
}))

onMounted(() => {
  fetchDetectionHistory()
})

async function fetchDetectionHistory() {
  try {
    loading.value = true
    const response = await detectionApi.getDetectionHistory(filterParams.value)
    detections.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('Failed to fetch detection history:', error)
  } finally {
    loading.value = false
  }
}

function refreshData() {
  fetchDetectionHistory()
}

function handleDetectionIdFilter() {
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

function handleViewImage(imageUrl: string, title: string) {
  previewImage.value = imageUrl
  previewImageTitle.value = title
  imagePreviewVisible.value = true
}

async function handleDelete(record: PersonDetection) {
  try {
    await ElMessageBox.confirm(
      `确定要删除检测编号为 ${record.detectionId} 的记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 执行删除
    await detectionApi.deleteDetection(record.detectionId)

    ElMessage({
      type: 'success',
      message: '删除成功'
    })

    // 重新加载数据
    fetchDetectionHistory()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage({
        type: 'error',
        message: error.message || '删除失败'
      })
    }
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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

.detection-table-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .detections-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0;

    .detection-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .detection-label {
        font-size: 13px;
        color: #606266;
        min-width: 60px;
        text-transform: capitalize;
      }
    }
  }

  .timestamp-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    color: #606266;

    span {
      white-space: nowrap;
    }
  }

  .image-actions,
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .text-placeholder {
    color: #909399;
    font-size: 13px;
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

      .el-input,
      .el-date-picker {
        flex: 1;
        min-width: 140px;
      }
    }
  }

  .detection-table-container {
    padding: 16px;
    overflow-x: auto;
  }
}
</style>