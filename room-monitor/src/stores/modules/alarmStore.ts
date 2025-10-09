import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Alarm, PaginationParams } from '@/types'
import { alarmApi } from '@/api'

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref<Alarm[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10
  })

  const activeAlarms = computed(() =>
    alarms.value.filter(alarm => alarm.status === 'active')
  )

  const criticalAlarms = computed(() =>
    alarms.value.filter(alarm => alarm.level === 'critical' && alarm.status === 'active')
  )

  const alarmStats = computed(() => ({
    total: alarms.value.length,
    active: alarms.value.filter(a => a.status === 'active').length,
    acknowledged: alarms.value.filter(a => a.status === 'acknowledged').length,
    resolved: alarms.value.filter(a => a.status === 'resolved').length,
    critical: alarms.value.filter(a => a.level === 'critical').length,
    high: alarms.value.filter(a => a.level === 'high').length,
    medium: alarms.value.filter(a => a.level === 'medium').length,
    low: alarms.value.filter(a => a.level === 'low').length
  }))

  async function fetchAlarms(params?: Partial<PaginationParams & {
    status?: string
    level?: string
    roomId?: string
    startTime?: string
    endTime?: string
  }>) {
    try {
      loading.value = true
      const searchParams = { ...pagination.value, ...params }
      const response = await alarmApi.getAlarms(searchParams)

      alarms.value = response.items
      total.value = response.total
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize
      }
    } catch (error) {
      console.error('Failed to fetch alarms:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function acknowledgeAlarm(id: string, acknowledgedBy: string) {
    try {
      const updatedAlarm = await alarmApi.acknowledgeAlarm(id, acknowledgedBy)
      const index = alarms.value.findIndex(alarm => alarm.id === id)
      if (index !== -1) {
        alarms.value[index] = updatedAlarm
      }
      return updatedAlarm
    } catch (error) {
      console.error('Failed to acknowledge alarm:', error)
      throw error
    }
  }

  async function resolveAlarm(id: string) {
    try {
      const updatedAlarm = await alarmApi.resolveAlarm(id)
      const index = alarms.value.findIndex(alarm => alarm.id === id)
      if (index !== -1) {
        alarms.value[index] = updatedAlarm
      }
      return updatedAlarm
    } catch (error) {
      console.error('Failed to resolve alarm:', error)
      throw error
    }
  }

  function addAlarm(alarm: Alarm) {
    alarms.value.unshift(alarm)
    total.value++
  }

  function updateAlarmStatus(id: string, status: Alarm['status'], meta?: {
    acknowledgedBy?: string
    acknowledgedAt?: string
    resolvedAt?: string
  }) {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      alarm.status = status
      if (meta) {
        Object.assign(alarm, meta)
      }
    }
  }

  function removeAlarm(id: string) {
    const index = alarms.value.findIndex(alarm => alarm.id === id)
    if (index !== -1) {
      alarms.value.splice(index, 1)
      total.value--
    }
  }

  function clearAlarms() {
    alarms.value = []
    total.value = 0
  }

  function getAlarmsByRoom(roomId: string) {
    return alarms.value.filter(alarm => alarm.roomId === roomId)
  }

  function getAlarmsByLevel(level: Alarm['level']) {
    return alarms.value.filter(alarm => alarm.level === level)
  }

  return {
    alarms,
    loading,
    total,
    pagination,
    activeAlarms,
    criticalAlarms,
    alarmStats,
    fetchAlarms,
    acknowledgeAlarm,
    resolveAlarm,
    addAlarm,
    updateAlarmStatus,
    removeAlarm,
    clearAlarms,
    getAlarmsByRoom,
    getAlarmsByLevel
  }
})