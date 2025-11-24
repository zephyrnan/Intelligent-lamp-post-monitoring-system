import type { Alarm, AlarmInfo, PaginationParams, PaginatedResponse, SensorData } from '@/types'
import { realRoomApi } from './realRoomApi'

// 存储报警信息的内存变量
let storedAlarms: AlarmInfo[] = []

// 报警检查函数
function checkAlarms(sensorData: SensorData): AlarmInfo[] {
  const alarms: AlarmInfo[] = []
  const now = new Date().toISOString()

  // 温度报警阈值
  if (sensorData.temperature > 40) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_temp_${now}`,
      roomId: sensorData.roomId,
      type: 'temperature',
      level: 'error',
      message: `温度严重超标: ${sensorData.temperature.toFixed(1)}°C`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.temperature > 35) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_temp_${now}`,
      roomId: sensorData.roomId,
      type: 'temperature',
      level: 'warning',
      message: `温度超标: ${sensorData.temperature.toFixed(1)}°C`,
      timestamp: now,
      acknowledged: false
    })
  }

  // 湿度报警阈值
  if (sensorData.hum > 85) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_hum_${now}`,
      roomId: sensorData.roomId,
      type: 'hum',
      level: 'error',
      message: `湿度严重超标: ${sensorData.hum.toFixed(1)}%`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.hum > 70) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_hum_${now}`,
      roomId: sensorData.roomId,
      type: 'hum',
      level: 'warning',
      message: `湿度超标: ${sensorData.hum.toFixed(1)}%`,
      timestamp: now,
      acknowledged: false
    })
  }

  // 光照强度报警阈值
  if (sensorData.lux < 50) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_lux_${now}`,
      roomId: sensorData.roomId,
      type: 'lux',
      level: 'error',
      message: `光照强度严重不足: ${sensorData.lux.toFixed(1)}lux`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.lux < 100) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_lux_${now}`,
      roomId: sensorData.roomId,
      type: 'lux',
      level: 'warning',
      message: `光照强度不足: ${sensorData.lux.toFixed(1)}lux`,
      timestamp: now,
      acknowledged: false
    })
  }

  // 旁路电流报警阈值
  if (sensorData.sc > 80) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_sc_${now}`,
      roomId: sensorData.roomId,
      type: 'sc',
      level: 'error',
      message: `旁路电流严重超标: ${sensorData.sc.toFixed(1)}A`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.sc > 50) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_sc_${now}`,
      roomId: sensorData.roomId,
      type: 'sc',
      level: 'warning',
      message: `旁路电流超标: ${sensorData.sc.toFixed(1)}A`,
      timestamp: now,
      acknowledged: false
    })
  }

  // 旁路电压报警阈值
  if (sensorData.sv > 300) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_sv_${now}`,
      roomId: sensorData.roomId,
      type: 'sv',
      level: 'error',
      message: `旁路电压严重超标: ${sensorData.sv.toFixed(1)}V`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.sv > 250) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_sv_${now}`,
      roomId: sensorData.roomId,
      type: 'sv',
      level: 'warning',
      message: `旁路电压超标: ${sensorData.sv.toFixed(1)}V`,
      timestamp: now,
      acknowledged: false
    })
  }

  // 总电压报警阈值
  if (sensorData.bv > 3000) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_bv_${now}`,
      roomId: sensorData.roomId,
      type: 'bv',
      level: 'error',
      message: `总电压严重超标: ${sensorData.bv.toFixed(1)}V`,
      timestamp: now,
      acknowledged: false
    })
  } else if (sensorData.bv > 2500) {
    alarms.push({
      id: `alarm_${sensorData.roomId}_bv_${now}`,
      roomId: sensorData.roomId,
      type: 'bv',
      level: 'warning',
      message: `总电压超标: ${sensorData.bv.toFixed(1)}V`,
      timestamp: now,
      acknowledged: false
    })
  }

  return alarms
}

export class AlarmApi {
  async getAlarms(params?: PaginationParams & {
    status?: string
    level?: string
    roomId?: string
    startTime?: string
    endTime?: string
  }): Promise<PaginatedResponse<Alarm>> {
    try {
      // 获取所有房间的实时数据
      const roomsResponse = await realRoomApi.getRooms()
      if (roomsResponse.code !== 200) {
        throw new Error('获取房间列表失败')
      }

      // 获取每个房间的传感器数据并检查报警
      const allAlarms: AlarmInfo[] = [...storedAlarms]

      for (const room of roomsResponse.data) {
        if (params?.roomId && room.id !== params.roomId) {
          continue
        }

        try {
          const sensorResponse = await realRoomApi.getRealtimeSensorData(room.id)
          if (sensorResponse.code === 200) {
            const newAlarms = checkAlarms(sensorResponse.data)
            allAlarms.push(...newAlarms)
          }
        } catch (error) {
          console.error(`检查房间 ${room.id} 报警失败:`, error)
        }
      }

      // 应用过滤器
      let filteredAlarms = allAlarms
      if (params?.status) {
        filteredAlarms = filteredAlarms.filter(alarm => {
          if (params.status === 'active') return !alarm.acknowledged
          if (params.status === 'acknowledged') return alarm.acknowledged
          return true
        })
      }
      if (params?.level) {
        filteredAlarms = filteredAlarms.filter(alarm => alarm.level === params.level)
      }

      // 应用分页
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedAlarms = filteredAlarms.slice(start, end)

      return {
        items: paginatedAlarms,
        total: filteredAlarms.length,
        page,
        pageSize
      }
    } catch (error: any) {
      console.error('获取报警信息失败:', error)
      throw error
    }
  }

  async getAlarmById(id: string): Promise<Alarm> {
    const alarm = storedAlarms.find(a => a.id === id)
    if (!alarm) {
      throw new Error('报警未找到')
    }
    return alarm
  }

  async acknowledgeAlarm(id: string, acknowledgedBy: string): Promise<Alarm> {
    const alarmIndex = storedAlarms.findIndex(alarm => alarm.id === id)
    if (alarmIndex === -1) {
      throw new Error('报警未找到')
    }

    storedAlarms[alarmIndex].acknowledged = true
    storedAlarms[alarmIndex].acknowledgedBy = acknowledgedBy
    storedAlarms[alarmIndex].acknowledgedAt = new Date().toISOString()
    storedAlarms[alarmIndex].status = 'acknowledged'

    return storedAlarms[alarmIndex]
  }

  async resolveAlarm(id: string): Promise<Alarm> {
    const alarmIndex = storedAlarms.findIndex(alarm => alarm.id === id)
    if (alarmIndex === -1) {
      throw new Error('报警未找到')
    }

    storedAlarms[alarmIndex].status = 'resolved'
    storedAlarms[alarmIndex].resolvedAt = new Date().toISOString()

    return storedAlarms[alarmIndex]
  }

  async getAlarmStats(): Promise<{
    total: number
    active: number
    acknowledged: number
    resolved: number
    byLevel: Record<string, number>
  }> {
    const total = storedAlarms.length
    const active = storedAlarms.filter(a => !a.acknowledged).length
    const acknowledged = storedAlarms.filter(a => a.acknowledged).length
    const resolved = storedAlarms.filter(a => a.status === 'resolved').length

    const byLevel: Record<string, number> = {
      warning: storedAlarms.filter(a => a.level === 'warning').length,
      error: storedAlarms.filter(a => a.level === 'error').length
    }

    return { total, active, acknowledged, resolved, byLevel }
  }

  // 添加清除报警方法
  async clearAllAlarms(): Promise<void> {
    storedAlarms = []
  }

  // 添加删除报警方法
  async deleteAlarm(id: string): Promise<void> {
    const alarmIndex = storedAlarms.findIndex(alarm => alarm.id === id)
    if (alarmIndex !== -1) {
      storedAlarms.splice(alarmIndex, 1)
    }
  }
}

export const alarmApi = new AlarmApi()