<template>
  <div class="history-data-page">
    <div class="page-header">
      <div class="header-content">
        <h2>历史数据</h2>
        <p>查看和分析房间环境历史数据</p>
      </div>

      <div class="header-actions">
        <el-select v-model="metricFilter" placeholder="指标" style="width: 140px" @change="handleFilterChange" clearable>
          <el-option label="全部" value="" />
          <el-option label="温度" value="temperature" />
          <el-option label="湿度" value="humidity" />
          <el-option label="空气质量" value="airQuality" />
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

    <div class="charts-section">
      <BaseChart
        title="环境数据趋势图"
        type="line"
        :data="chartData"
        :height="400"
        :loading="historyStore.loading"
        :show-data-zoom="true"
      />
    </div>

    <div class="data-table">
      <div class="table-header">
        <h3>历史数据详情</h3>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>

      <el-table
        :data="historyStore.historyData"
        :loading="historyStore.loading"
        style="width: 100%"
      >
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度 (°C)" width="120">
          <template #default="scope">
            <span :class="getTemperatureClass(scope.row.temperature)">
              {{ scope.row.temperature }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="humidity" label="湿度 (%)" width="120">
          <template #default="scope">
            <span :class="getHumidityClass(scope.row.humidity)">
              {{ scope.row.humidity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="airQuality" label="空气质量" width="120">
          <template #default="scope">
            <span :class="getAirQualityClass(scope.row.airQuality)">
              {{ scope.row.airQuality }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="historyStore.historyTotal"
          :page-sizes="[20, 50, 100]"
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
import { Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useHistoryStore } from '@/stores'
import BaseChart from '@/components/charts/BaseChart.vue'

const historyStore = useHistoryStore()

const timeRange = ref<[string, string]>([
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  new Date().toISOString()
])
const metricFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(50)

const chartData = computed(() => {
  const data = historyStore.historyData
  if (data.length === 0) return null

  const labels = data.map(item => new Date(item.timestamp).toLocaleString())
  const datasets: any[] = []
  if (!metricFilter.value || metricFilter.value === 'temperature') {
    datasets.push({ label: '温度 (°C)', data: data.map(i => i.temperature), borderColor: '#f56c6c', backgroundColor: 'rgba(245,108,108,.1)', fill: false })
  }
  if (!metricFilter.value || metricFilter.value === 'humidity') {
    datasets.push({ label: '湿度 (%)', data: data.map(i => i.humidity), borderColor: '#409eff', backgroundColor: 'rgba(64,158,255,.1)', fill: false })
  }
  if (!metricFilter.value || metricFilter.value === 'airQuality') {
    datasets.push({ label: '空气质量', data: data.map(i => i.airQuality), borderColor: '#67c23a', backgroundColor: 'rgba(103,194,58,.1)', fill: false })
  }
  return { labels, datasets }
})

onMounted(() => {
  fetchHistoryData()
})

async function fetchHistoryData() {
  try {
  const [start, end] = timeRange.value
  await historyStore.fetchHistoryData({
      startTime: start,
      endTime: end,
      page: currentPage.value,
      pageSize: pageSize.value
    })
  } catch (error) {
    console.error('Failed to fetch history data:', error)
  }
}

function refreshData() {
  fetchHistoryData()
}

function handleDateChange() {
  currentPage.value = 1
  fetchHistoryData()
}

function handleFilterChange() {
  fetchHistoryData()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  fetchHistoryData()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchHistoryData()
}

async function exportData() {
  try {
    const [startDate, endDate] = dateRange.value
    await historyStore.exportHistoryData({
      startTime: `${startDate}T00:00:00.000Z`,
      endTime: `${endDate}T23:59:59.999Z`,
      format: 'excel'
    })
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
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

function getAirQualityClass(airQuality: number): string {
  if (airQuality > 200) return 'value-error'
  if (airQuality > 100) return 'value-warning'
  return 'value-normal'
}
</script>

<style scoped lang="scss">
.history-data-page {
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

.charts-section {
  margin-bottom: 32px;
}

.data-table {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

:deep(.value-normal) {
  color: #67c23a;
  font-weight: 500;
}

:deep(.value-warning) {
  color: #e6a23c;
  font-weight: 500;
}

:deep(.value-error) {
  color: #f56c6c;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .header-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;

      .el-date-picker {
        width: 100%;
      }
    }
  }

  .data-table {
    padding: 16px;
    overflow-x: auto;

    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>