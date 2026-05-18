import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Alarm, PaginationParams } from '@/types'
import { alarmApi } from '@/api'

// 告警状态类型
type AlarmStatus = 'active' | 'acknowledged' | 'resolved'

// 状态机：定义合法的状态转换路径
// active → acknowledged → resolved，不允许跳过或回退
const VALID_TRANSITIONS: Record<AlarmStatus, AlarmStatus[]> = {
  active: ['acknowledged'],
  acknowledged: ['resolved'],
  resolved: []
}

// 校验状态转换是否合法
function isValidTransition(from: AlarmStatus, to: AlarmStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

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
      // 状态机校验：只有 active 状态的告警可以被确认
      const alarm = alarms.value.find(a => a.id === id)
      if (alarm && alarm.status && !isValidTransition(alarm.status as AlarmStatus, 'acknowledged')) {
        throw new Error(`非法状态转换：${alarm.status} → acknowledged，只有 active 状态的告警可被确认`)
      }

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
      // 状态机校验：只有 acknowledged 状态的告警可以被解决
      const alarm = alarms.value.find(a => a.id === id)
      if (alarm && alarm.status && !isValidTransition(alarm.status as AlarmStatus, 'resolved')) {
        throw new Error(`非法状态转换：${alarm.status} → resolved，只有 acknowledged 状态的告警可被解决`)
      }

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
      // 状态机校验
      const currentStatus = (alarm.status || 'active') as AlarmStatus
      const targetStatus = (status || 'active') as AlarmStatus
      if (!isValidTransition(currentStatus, targetStatus)) {
        console.warn(`告警状态转换被拒绝：${currentStatus} → ${targetStatus}`)
        return
      }
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