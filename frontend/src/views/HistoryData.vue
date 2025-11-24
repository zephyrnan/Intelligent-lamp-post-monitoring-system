<template>
  <div class="history-data-page">
    <div class="page-header">
      <div class="header-content">
        <h2>历史数据</h2>
        <p>查看和分析房间环境历史数据</p>
      </div>

      <div class="header-actions">
        <el-select v-model="selectedRoom" placeholder="选择房间" style="width: 160px" @change="handleFilterChange" clearable>
          <el-option label="全部房间" value="" />
          <el-option
            v-for="room in availableRooms"
            :key="room.id"
            :label="room.name"
            :value="room.id"
          />
        </el-select>

        <el-select v-model="warnFilter" placeholder="报警状态" style="width: 140px" @change="handleFilterChange" clearable>
          <el-option label="全部" value="" />
          <el-option label="正常" :value="0" />
          <el-option label="警告" :value="1" />
          <el-option label="严重" :value="2" />
        </el-select>

        <el-select v-model="metricFilter" placeholder="图表指标" style="width: 140px" @change="handleChartFilterChange" clearable>
          <el-option label="全部" value="" />
          <el-option label="温度" value="temperature" />
          <el-option label="湿度" value="humidity" />
          <el-option label="烟雾浓度" value="smoke" />
          <el-option label="光照强度" value="lux" />
        </el-select>

        <el-select v-model="aggregation" placeholder="聚合方式" style="width: 140px" @change="handleChartFilterChange" clearable>
          <el-option label="原始数据" value="" />
          <el-option label="按小时" value="hour" />
          <el-option label="按天" value="day" />
          <el-option label="按周" value="week" />
        </el-select>

        <el-date-picker
          v-model="startTime"
          type="datetime"
          placeholder="开始时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          :disabled-date="disabledStartDate"
          @change="handleDateChange"
          style="width: 200px"
        />
        <span style="margin: 0 8px; color: #606266;">至</span>
        <el-date-picker
          v-model="endTime"
          type="datetime"
          placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
          :disabled-date="disabledEndDate"
          @change="handleDateChange"
          style="width: 200px"
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

      <div v-if="statisticsSummary" class="statistics-summary">
        <div class="stat-card" v-for="stat in statisticsSummary" :key="stat.name">
          <div class="stat-header">
            <el-icon :size="24" :color="stat.color"><component :is="stat.icon" /></el-icon>
            <span class="stat-name">{{ stat.name }}</span>
          </div>
          <div class="stat-values">
            <div class="stat-value">
              <span class="stat-label">最高</span>
              <span class="stat-number" :style="{ color: stat.color }">{{ stat.max }}{{ stat.unit }}</span>
            </div>
            <div class="stat-value">
              <span class="stat-label">平均</span>
              <span class="stat-number">{{ stat.avg }}{{ stat.unit }}</span>
            </div>
            <div class="stat-value">
              <span class="stat-label">最低</span>
              <span class="stat-number" :style="{ color: stat.color }">{{ stat.min }}{{ stat.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-table">
      <div class="table-header">
        <h3>历史数据详情</h3>
      </div>

      <el-table
        :data="historyStore.historyData"
        :loading="historyStore.loading"
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="roomId" label="房间ID" width="120" fixed sortable>
          <template #default="scope">
            {{ scope.row.roomId }}
          </template>
        </el-table-column>
        <el-table-column prop="smoke" label="烟雾浓度" width="120" sortable>
          <template #default="scope">
            <span :class="getSmokeClass(scope.row.smoke)">
              {{ scope.row.smoke }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度 (°C)" width="130" sortable>
          <template #default="scope">
            <span :class="getTemperatureClass(scope.row.temperature)">
              {{ scope.row.temperature }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="humidity" label="湿度 (%)" width="120" sortable>
          <template #default="scope">
            <span :class="getHumidityClass(scope.row.humidity)">
              {{ scope.row.humidity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="warn" label="报警状态" width="120" sortable>
          <template #default="scope">
            <el-tag :type="getWarnType(scope.row.warn)">
              {{ getWarnLabel(scope.row.warn) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lux" label="光照强度" width="120" sortable>
          <template #default="scope">
            {{ scope.row.lux }}
          </template>
        </el-table-column>
        <el-table-column prop="sc" label="旁路电流 (A)" width="140" sortable>
          <template #default="scope">
            {{ scope.row.sc }}
          </template>
        </el-table-column>
        <el-table-column prop="sv" label="旁路电压 (V)" width="140" sortable>
          <template #default="scope">
            {{ scope.row.sv }}
          </template>
        </el-table-column>
        <el-table-column prop="bv" label="总电压 (V)" width="130" sortable>
          <template #default="scope">
            {{ scope.row.bv }}
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="200" sortable>
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
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
import { Refresh, Sunny, Lightning, Cloudy, Odometer } from '@element-plus/icons-vue'
import { useHistoryStore, useRoomStore } from '@/stores'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { HistoryData } from '@/types'

const historyStore = useHistoryStore()
const roomStore = useRoomStore()

const startTime = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 最近7天
const endTime = ref(new Date().toISOString())
const selectedRoom = ref('')
const warnFilter = ref<number | ''>('')
const metricFilter = ref('')
const aggregation = ref('')
const currentPage = ref(1)
const pageSize = ref(50)

// 禁用开始时间的未来日期，以及晚于结束时间的日期
const disabledStartDate = (time: Date) => {
  const now = Date.now()
  if (time.getTime() > now) return true
  if (endTime.value) {
    return time.getTime() > new Date(endTime.value).getTime()
  }
  return false
}

// 禁用结束时间的未来日期，以及早于开始时间的日期
const disabledEndDate = (time: Date) => {
  const now = Date.now()
  if (time.getTime() > now) return true
  if (startTime.value) {
    return time.getTime() < new Date(startTime.value).getTime()
  }
  return false
}

// 可用房间列表
const availableRooms = computed(() => roomStore.rooms)

// 聚合数据函数
function aggregateData(data: HistoryData[], type: string) {
  if (!type || data.length === 0) return data

  const grouped = new Map<string, HistoryData[]>()

  data.forEach(item => {
    const date = new Date(item.timestamp)
    let key: string

    switch (type) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
        break
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
        break
      default:
        key = item.timestamp
    }

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(item)
  })

  const aggregatedData: HistoryData[] = []
  grouped.forEach((items, key) => {
    const avg = {
      id: items[0].id,
      roomId: items[0].roomId,
      timestamp: key,
      smoke: items.reduce((sum, i) => sum + i.smoke, 0) / items.length,
      temperature: items.reduce((sum, i) => sum + i.temperature, 0) / items.length,
      water: 0,
      warn: Math.max(...items.map(i => i.warn)),
      humidity: items.reduce((sum, i) => sum + i.humidity, 0) / items.length,
      sc: items.reduce((sum, i) => sum + i.sc, 0) / items.length,
      lux: items.reduce((sum, i) => sum + i.lux, 0) / items.length,
      sv: items.reduce((sum, i) => sum + i.sv, 0) / items.length,
      bv: items.reduce((sum, i) => sum + i.bv, 0) / items.length
    }
    aggregatedData.push(avg)
  })

  return aggregatedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

const chartData = computed(() => {
  let data = historyStore.historyData
  if (data.length === 0) return null

  // 应用聚合
  data = aggregateData(data, aggregation.value)

  const labels = data.map(item => {
    const date = new Date(item.timestamp)
    if (aggregation.value === 'hour') {
      return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } else if (aggregation.value === 'day') {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    } else if (aggregation.value === 'week') {
      return `${date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} 周`
    }
    return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  })

  const datasets: any[] = []
  if (!metricFilter.value || metricFilter.value === 'temperature') {
    const tempData = data.map(i => Number(i.temperature.toFixed(2)))
    datasets.push({
      label: '温度',
      data: tempData,
      unit: '°C',
      borderColor: '#f56c6c',
      backgroundColor: 'rgba(245,108,108,.1)',
      fill: true,
      markPoint: {
        data: [
          { type: 'max', name: '最高', label: { formatter: (params: any) => `最高\n${params.value}°C` } },
          { type: 'min', name: '最低', label: { formatter: (params: any) => `最低\n${params.value}°C` } }
        ]
      },
      markLine: {
        data: [
          {
            type: 'average',
            name: '平均',
            label: {
              formatter: (params: any) => `平均: ${params.value.toFixed(2)}°C`,
              position: 'end'
            }
          }
        ]
      }
    })
  }
  if (!metricFilter.value || metricFilter.value === 'humidity') {
    const humData = data.map(i => Number(i.humidity.toFixed(2)))
    datasets.push({
      label: '湿度',
      data: humData,
      unit: '%',
      borderColor: '#409eff',
      backgroundColor: 'rgba(64,158,255,.1)',
      fill: true,
      markPoint: {
        data: [
          { type: 'max', name: '最高', label: { formatter: (params: any) => `最高\n${params.value}%` } },
          { type: 'min', name: '最低', label: { formatter: (params: any) => `最低\n${params.value}%` } }
        ]
      },
      markLine: {
        data: [
          {
            type: 'average',
            name: '平均',
            label: {
              formatter: (params: any) => `平均: ${params.value.toFixed(2)}%`,
              position: 'end'
            }
          }
        ]
      }
    })
  }
  if (!metricFilter.value || metricFilter.value === 'smoke') {
    const smokeData = data.map(i => Number(i.smoke.toFixed(2)))
    datasets.push({
      label: '烟雾浓度',
      data: smokeData,
      unit: '',
      borderColor: '#909399',
      backgroundColor: 'rgba(144,147,153,.1)',
      fill: true,
      markPoint: {
        data: [
          { type: 'max', name: '最高', label: { formatter: (params: any) => `最高\n${params.value}` } },
          { type: 'min', name: '最低', label: { formatter: (params: any) => `最低\n${params.value}` } }
        ]
      },
      markLine: {
        data: [
          {
            type: 'average',
            name: '平均',
            label: {
              formatter: (params: any) => `平均: ${params.value.toFixed(2)}`,
              position: 'end'
            }
          }
        ]
      }
    })
  }
  if (!metricFilter.value || metricFilter.value === 'lux') {
    const luxData = data.map(i => Number(i.lux.toFixed(2)))
    datasets.push({
      label: '光照强度',
      data: luxData,
      unit: ' lux',
      borderColor: '#67c23a',
      backgroundColor: 'rgba(103,194,58,.1)',
      fill: true,
      markPoint: {
        data: [
          { type: 'max', name: '最高', label: { formatter: (params: any) => `最高\n${params.value} lux` } },
          { type: 'min', name: '最低', label: { formatter: (params: any) => `最低\n${params.value} lux` } }
        ]
      },
      markLine: {
        data: [
          {
            type: 'average',
            name: '平均',
            label: {
              formatter: (params: any) => `平均: ${params.value.toFixed(2)} lux`,
              position: 'end'
            }
          }
        ]
      }
    })
  }
  return { labels, datasets }
})

const statisticsSummary = computed(() => {
  const data = historyStore.historyData
  if (data.length === 0) return null

  const stats = []

  if (!metricFilter.value || metricFilter.value === 'temperature') {
    const temps = data.map(d => d.temperature)
    stats.push({
      name: '温度',
      icon: Sunny,
      color: '#f56c6c',
      unit: '°C',
      max: Math.max(...temps).toFixed(2),
      min: Math.min(...temps).toFixed(2),
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2)
    })
  }

  if (!metricFilter.value || metricFilter.value === 'humidity') {
    const hums = data.map(d => d.humidity)
    stats.push({
      name: '湿度',
      icon: Cloudy,
      color: '#409eff',
      unit: '%',
      max: Math.max(...hums).toFixed(2),
      min: Math.min(...hums).toFixed(2),
      avg: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(2)
    })
  }

  if (!metricFilter.value || metricFilter.value === 'smoke') {
    const smokes = data.map(d => d.smoke)
    stats.push({
      name: '烟雾浓度',
      icon: Odometer,
      color: '#909399',
      unit: '',
      max: Math.max(...smokes).toFixed(2),
      min: Math.min(...smokes).toFixed(2),
      avg: (smokes.reduce((a, b) => a + b, 0) / smokes.length).toFixed(2)
    })
  }

  if (!metricFilter.value || metricFilter.value === 'lux') {
    const luxs = data.map(d => d.lux)
    stats.push({
      name: '光照强度',
      icon: Lightning,
      color: '#67c23a',
      unit: ' lux',
      max: Math.max(...luxs).toFixed(2),
      min: Math.min(...luxs).toFixed(2),
      avg: (luxs.reduce((a, b) => a + b, 0) / luxs.length).toFixed(2)
    })
  }

  return stats
})

onMounted(() => {
  roomStore.fetchRooms()
  fetchHistoryData()
})

async function fetchHistoryData() {
  try {
    await historyStore.fetchHistoryData({
      roomId: selectedRoom.value || undefined,
      startTime: startTime.value,
      endTime: endTime.value,
      warnLevel: warnFilter.value !== '' ? warnFilter.value : undefined,
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
  currentPage.value = 1
  fetchHistoryData()
}

function handleChartFilterChange() {
  // 图表筛选和聚合只影响显示，不需要重新请求数据
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

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
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
  margin-bottom: 24px;
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
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
}

.charts-section {
  margin-bottom: 32px;
}

.statistics-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f5f5f5;

    .stat-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .stat-values {
    display: flex;
    justify-content: space-between;
    gap: 16px;

    .stat-value {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .stat-label {
        font-size: 12px;
        color: #909399;
        font-weight: 500;
      }

      .stat-number {
        font-size: 18px;
        font-weight: 700;
        color: #303133;
      }
    }
  }
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

      > * {
        width: 100%;
      }
    }
  }

  .statistics-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    .stat-values {
      flex-direction: column;
      gap: 12px;

      .stat-value {
        flex-direction: row;
        justify-content: space-between;

        .stat-label {
          font-size: 14px;
        }
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