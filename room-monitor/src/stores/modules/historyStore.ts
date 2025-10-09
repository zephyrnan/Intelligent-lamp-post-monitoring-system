import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryData, DetectionRecord, PaginationParams } from '@/types'
import { historyApi } from '@/api'

export const useHistoryStore = defineStore('history', () => {
  const historyData = ref<HistoryData[]>([])
  const detectionHistory = ref<DetectionRecord[]>([])
  const loading = ref(false)
  const historyTotal = ref(0)
  const detectionTotal = ref(0)

  async function fetchHistoryData(params: {
    roomId?: string
    startTime: string
    endTime: string
  } & PaginationParams) {
    try {
      loading.value = true
      const response = await historyApi.getHistoryData(params)
      historyData.value = response.items
      historyTotal.value = response.total
      return response
    } catch (error) {
      console.error('Failed to fetch history data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchDetectionHistory(params: {
    roomId?: string
    type?: string
    startTime?: string
    endTime?: string
  } & PaginationParams) {
    try {
      loading.value = true
      const response = await historyApi.getDetectionHistory(params)
      detectionHistory.value = response.items
      detectionTotal.value = response.total
      return response
    } catch (error) {
      console.error('Failed to fetch detection history:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function exportHistoryData(params: {
    roomId?: string
    startTime: string
    endTime: string
    format: 'csv' | 'excel'
  }) {
    try {
      const blob = await historyApi.exportHistoryData(params)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `history_data_${params.startTime}_${params.endTime}.${params.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export history data:', error)
      throw error
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
  }

  function addDetectionRecord(record: DetectionRecord) {
    detectionHistory.value.unshift(record)
  }

  function clearHistoryData() {
    historyData.value = []
    historyTotal.value = 0
  }

  function clearDetectionHistory() {
    detectionHistory.value = []
    detectionTotal.value = 0
  }

  function getLatestDataByRoom(roomId: string): HistoryData | null {
    return historyData.value.find(data => data.roomId === roomId) || null
  }

  return {
    historyData,
    detectionHistory,
    loading,
    historyTotal,
    detectionTotal,
    fetchHistoryData,
    fetchDetectionHistory,
    exportHistoryData,
    fetchHistoryStats,
    addHistoryData,
    addDetectionRecord,
    clearHistoryData,
    clearDetectionHistory,
    getLatestDataByRoom
  }
})