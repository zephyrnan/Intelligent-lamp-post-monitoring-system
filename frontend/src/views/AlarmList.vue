<template>
  <div class="alarm-list-page">
    <div class="page-header">
      <div class="header-actions">
        <el-select
          v-model="typeFilter"
          placeholder="类型筛选"
          style="width: 160px"
          clearable
          @change="handleTypeFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="温度" value="temperature" />
          <el-option label="湿度" value="humidity" />
          <el-option label="光照强度" value="lux" />
          <el-option label="旁路电流" value="sc" />
          <el-option label="旁路电压" value="sv" />
          <el-option label="总电压" value="bv" />
          <el-option label="设备离线" value="device_offline" />
          <el-option label="入侵检测" value="intrusion" />
        </el-select>
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ss.SSS'Z'"
          @change="handleTimeChange"
        />
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          style="width: 140px"
          clearable
          @change="handleStatusFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="已确认" value="acknowledged" />
          <el-option label="已解决" value="resolved" />
        </el-select>

        <el-select
          v-model="levelFilter"
          placeholder="级别筛选"
          style="width: 140px"
          clearable
          @change="handleLevelFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="严重" value="critical" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>

        <el-button type="primary" @click="refreshAlarms">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="stats-section">
      <StatusCard
        title="总报警数"
        :value="alarmStore.alarmStats.total"
        status="info"
        description="系统报警总数"
      />
      <StatusCard
        title="活跃报警"
        :value="alarmStore.alarmStats.active"
        status="error"
        description="需要处理的报警"
      />
      <StatusCard
        title="严重报警"
        :value="alarmStore.alarmStats.critical"
        status="error"
        description="严重级别报警"
      />
    </div>

    <div class="alarm-table">
      <el-table
        :data="alarmStore.alarms"
        :loading="alarmStore.loading"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="roomName" label="房间" width="120" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            {{ getTypeLabel(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" size="small">
              {{ getLevelLabel(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="描述" />
        <el-table-column prop="timestamp" label="时间" width="160">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'active'"
              size="small"
              @click.stop="handleAcknowledge(scope.row)"
            >
              确认
            </el-button>
            <el-button
              v-if="scope.row.status === 'acknowledged'"
              size="small"
              type="success"
              @click.stop="handleResolve(scope.row)"
            >
              解决
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="alarmStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAlarmStore } from '@/stores'
import StatusCard from '@/components/common/StatusCard.vue'
import type { Alarm } from '@/types'

const alarmStore = useAlarmStore()

const statusFilter = ref('')
const levelFilter = ref('')
const typeFilter = ref('')
const timeRange = ref<[string, string]>([
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  new Date().toISOString()
])
const currentPage = ref(1)
const pageSize = ref(20)

const filterParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  status: statusFilter.value || undefined,
  level: levelFilter.value || undefined,
  type: typeFilter.value || undefined,
  startTime: timeRange.value?.[0],
  endTime: timeRange.value?.[1]
}))

onMounted(() => {
  fetchAlarms()
})

async function fetchAlarms() {
  try {
    await alarmStore.fetchAlarms(filterParams.value)
  } catch (error) {
    console.error('Failed to fetch alarms:', error)
  }
}

function refreshAlarms() {
  fetchAlarms()
}

function handleStatusFilter() {
  currentPage.value = 1
  fetchAlarms()
}

function handleLevelFilter() {
  currentPage.value = 1
  fetchAlarms()
}

function handleTimeChange() {
  currentPage.value = 1
  fetchAlarms()
}

function handleTypeFilter() {
  currentPage.value = 1
  fetchAlarms()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchAlarms()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchAlarms()
}

function handleRowClick(row: Alarm) {
  console.log('Clicked alarm:', row)
}

async function handleAcknowledge(alarm: Alarm) {
  try {
    await alarmStore.acknowledgeAlarm(alarm.id, '')
    ElMessage.success('报警已确认')
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

async function handleResolve(alarm: Alarm) {
  try {
    await alarmStore.resolveAlarm(alarm.id)
    ElMessage.success('报警已解决')
  } catch (error) {
    ElMessage.error('解决失败')
  }
}

function getTypeLabel(type: string): string {
  const labels = {
    temperature: '温度',
    humidity: '湿度',
    air_quality: '空气质量',
    lux: '光照强度',
    sc: '旁路电流',
    sv: '旁路电压',
    bv: '总电压',
    smoke: '烟雾',
    device_offline: '设备离线',
    intrusion: '入侵检测',
    person: '人员检测',
    water: '水位'
  }
  return labels[type as keyof typeof labels] || type
}

function getLevelType(level: string) {
  const types = {
    critical: 'danger',
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level as keyof typeof types]
}

function getLevelLabel(level: string): string {
  const labels = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[level as keyof typeof labels] || level
}

function getStatusType(status: string) {
  const types = {
    active: 'danger',
    acknowledged: 'warning',
    resolved: 'success'
  }
  return types[status as keyof typeof types]
}

function getStatusLabel(status: string): string {
  const labels = {
    active: '活跃',
    acknowledged: '已确认',
    resolved: '已解决'
  }
  return labels[status as keyof typeof labels] || status
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}
</script>

<style scoped lang="scss">
.alarm-list-page {
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

.alarm-table {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;

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

  .el-table {
    position: relative;
    z-index: 1;
    background: transparent;

    :deep(.el-table__header-wrapper) {
      .el-table__header {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);

        th {
          background: transparent;
          border-bottom: 2px solid var(--border-light);
          color: var(--text-primary);
          font-weight: 700;
          padding: var(--space-md) var(--space-sm);

          .cell {
            color: var(--text-primary);
            font-size: 14px;
          }
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__body {
        tr {
          background: transparent;
          transition: all 0.3s ease;
          cursor: pointer;

          &:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
            transform: scale(1.01);
            box-shadow: var(--shadow-sm);
          }

          td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: var(--space-md) var(--space-sm);

            .cell {
              color: var(--text-primary);
              font-weight: 500;
            }
          }
        }
      }
    }

    :deep(.el-button) {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-md);
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.el-button--small {
        font-size: 12px;

        &:hover {
          transform: translateY(-1px) scale(1.05);
        }
      }

      &.el-button--success {
        background: var(--gradient-success);
        border: none;

        &:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      }
    }

    :deep(.el-tag) {
      border-radius: var(--radius-sm);
      font-weight: 600;
      padding: 4px 8px;
      border: none;

      &.el-tag--danger {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%);
        color: white;
      }

      &.el-tag--warning {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%);
        color: white;
      }

      &.el-tag--success {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%);
        color: white;
      }

      &.el-tag--info {
        background: linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%);
        color: white;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;

  :deep(.el-pagination) {
    .el-pager li {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-md);
      margin: 0 2px;
      transition: all 0.3s ease;
      color: var(--text-primary);

      &:hover {
        background: var(--gradient-primary);
        color: white;
        transform: scale(1.1);
      }

      &.is-active {
        background: var(--gradient-primary);
        color: white;
        border-color: var(--primary-color);
      }
    }

    .btn-prev,
    .btn-next {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-md);
      transition: all 0.3s ease;
      color: var(--text-primary);

      &:hover {
        background: var(--gradient-primary);
        color: white;
      }
    }

    .el-pagination__total,
    .el-pagination__sizes .el-select,
    .el-pagination__jump {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .alarm-list-page {
    max-width: 100%;
    padding: 0 var(--space-lg);
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .alarm-list-page {
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
      flex-wrap: wrap;
      justify-content: center;

      .el-select {
        flex: 1;
        min-width: 120px;
      }

      .el-button {
        width: 100%;
        margin-top: var(--space-sm);
      }
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .alarm-table {
    padding: var(--space-md);
    overflow-x: auto;

    .el-table {
      min-width: 800px;
    }
  }

  .pagination {
    :deep(.el-pagination) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .alarm-list-page {
    padding: 0 var(--space-sm);
  }

  .page-header {
    padding: var(--space-md);
    margin-bottom: var(--space-xl);

    .header-content h2 {
      font-size: 20px;
    }
  }

  .alarm-table {
    padding: var(--space-sm);

    .el-table {
      font-size: 13px;
    }
  }

  .pagination {
    :deep(.el-pagination) {
      .el-pagination__total {
        display: none;
      }
    }
  }
}
</style>