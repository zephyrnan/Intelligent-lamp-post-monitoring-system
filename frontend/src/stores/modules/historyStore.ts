import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryData, DetectionRecord, PaginationParams } from '@/types'
import { historyApi } from '@/api'

export const useHistoryStore = defineStore('history', () => {
  const historyData = ref<HistoryData[]>([])
  const detectionHistory = ref<DetectionRecord[]>([])
  const historyLoading = ref(false)
  const detectionLoading = ref(false)
  const historyTotal = ref(0)
  const detectionTotal = ref(0)

  const loading = computed(() => historyLoading.value || detectionLoading.value)

  async function fetchHistoryData(params: {
    roomId?: string
    startTime?: string
    endTime?: string
    warnLevel?: number
    minTemp?: number
    maxTemp?: number
    minHum?: number
    maxHum?: number
    minSmoke?: number
    maxSmoke?: number
  } & PaginationParams) {
    try {
      historyLoading.value = true
      const response = await historyApi.getHistoryData(params)
      historyData.value = response.items
      historyTotal.value = response.total
      return response
    } catch (error) {
      console.error('Failed to fetch history data:', error)
      throw error
    } finally {
      historyLoading.value = false
    }
  }

  async function fetchDetectionHistory(params: {
    roomId?: string
    type?: string
    startTime?: string
    endTime?: string
  } & PaginationParams) {
    try {
      detectionLoading.value = true
      const response = await historyApi.getDetectionHistory(params)
      detectionHistory.value = response.items
      detectionTotal.value = response.total
      return response
    } catch (error) {
      console.error('Failed to fetch detection history:', error)
      throw error
    } finally {
      detectionLoading.value = false
    }
  }

  async function fetchHistoryStats(roomId: string, days: number = 7) {
    try {
      return await historyApi.getHistoryStats(roomId, days)
    } catch (error) {
      console.error('Failed to fetch history stats:', error)
      throw error
    }
  }

  function addHistoryData(data: HistoryData) {
    historyData.value.unshift(data)
    if (historyData.value.length > 1000) {
      historyData.value.length = 1000
    }
  }

  function addDetectionRecord(record: DetectionRecord) {
    detectionHistory.value.unshift(record)
    if (detectionHistory.value.length > 500) {
      detectionHistory.value.length = 500
    }
  }

  function clearHistoryData() {
    historyData.value = []
    historyTotal.value = 0
  }

  function clearDetectionHistory() {
    detectionHistory.value = []
    detectionTotal.value = 0
  }
// 获取指定房间的最新数据
  function getLatestDataByRoom(roomId: string): HistoryData | null {
    let latest: HistoryData | null = null
    for (const data of historyData.value) {
      if (data.roomId === roomId) {
        if (!latest || new Date(data.timestamp).getTime() > new Date(latest.timestamp).getTime()) {
          latest = data
        }
      }
    }
    return latest
  }

  return {
    historyData,
    detectionHistory,
    loading,
    historyTotal,
    detectionTotal,
    fetchHistoryData,
    fetchDetectionHistory,
    fetchHistoryStats,
    addHistoryData,
    addDetectionRecord,
    clearHistoryData,
    clearDetectionHistory,
    getLatestDataByRoom
  }
})