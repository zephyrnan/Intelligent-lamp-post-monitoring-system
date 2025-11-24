import type { Alarm, AlarmInfo, PaginationParams, PaginatedResponse } from '@/types'

// API基础URL
const API_BASE = 'http://localhost:3000'

export class AlarmApi {
  async getAlarms(params?: PaginationParams & {
    status?: string
    level?: string
    type?: string
    roomId?: string
    startTime?: string
    endTime?: string
  }): Promise<PaginatedResponse<Alarm>> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString())
      }
      if (params?.status) {
        queryParams.append('status', params.status)
      }
      if (params?.level) {
        queryParams.append('level', params.level)
      }
      if (params?.type) {
        queryParams.append('type', params.type)
      }
      if (params?.roomId) {
        queryParams.append('roomId', params.roomId)
      }
      if (params?.startTime) {
        queryParams.append('startTime', params.startTime)
      }
      if (params?.endTime) {
        queryParams.append('endTime', params.endTime)
      }

      const url = `${API_BASE}/alarms?${queryParams.toString()}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.code !== 200) {
        throw new Error(result.msg || '获取报警列表失败')
      }

      return {
        items: result.data.map((alarm: any) => ({
          id: alarm.alarmId,
          roomId: alarm.roomId,
          roomName: alarm.roomName,
          type: alarm.type,
          level: alarm.level,
          message: alarm.message,
          timestamp: alarm.timestamp,
          acknowledged: alarm.acknowledged,
          status: alarm.status,
          acknowledgedBy: alarm.acknowledgedBy,
          acknowledgedAt: alarm.acknowledgedAt,
          resolvedAt: alarm.resolvedAt
        })),
        total: result.pagination.total,
        page: result.pagination.page,
        pageSize: result.pagination.pageSize
      }
    } catch (error: any) {
      console.error('获取报警信息失败:', error)
      throw error
    }
  }

  async getAlarmById(id: string): Promise<Alarm> {
    try {
      const response = await fetch(`${API_BASE}/alarms/${id}`)
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '获取报警详情失败')
      }

      return {
        id: data.data.alarmId,
        roomId: data.data.roomId,
        roomName: data.data.roomName,
        type: data.data.type,
        level: data.data.level,
        message: data.data.message,
        timestamp: data.data.timestamp,
        acknowledged: data.data.acknowledged,
        status: data.data.status,
        acknowledgedBy: data.data.acknowledgedBy,
        acknowledgedAt: data.data.acknowledgedAt,
        resolvedAt: data.data.resolvedAt
      }
    } catch (error: any) {
      console.error('获取报警详情失败:', error)
      throw error
    }
  }

  async acknowledgeAlarm(id: string, acknowledgedBy: string): Promise<Alarm> {
    try {
      const response = await fetch(`${API_BASE}/alarms/${id}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acknowledgedBy })
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '确认报警失败')
      }

      return {
        id: data.data.alarmId,
        roomId: data.data.roomId,
        roomName: data.data.roomName,
        type: data.data.type,
        level: data.data.level,
        message: data.data.message,
        timestamp: data.data.timestamp,
        acknowledged: data.data.acknowledged,
        status: data.data.status,
        acknowledgedBy: data.data.acknowledgedBy,
        acknowledgedAt: data.data.acknowledgedAt,
        resolvedAt: data.data.resolvedAt
      }
    } catch (error: any) {
      console.error('确认报警失败:', error)
      throw error
    }
  }

  async resolveAlarm(id: string): Promise<Alarm> {
    try {
      const response = await fetch(`${API_BASE}/alarms/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '解决报警失败')
      }

      return {
        id: data.data.alarmId,
        roomId: data.data.roomId,
        roomName: data.data.roomName,
        type: data.data.type,
        level: data.data.level,
        message: data.data.message,
        timestamp: data.data.timestamp,
        acknowledged: data.data.acknowledged,
        status: data.data.status,
        acknowledgedBy: data.data.acknowledgedBy,
        acknowledgedAt: data.data.acknowledgedAt,
        resolvedAt: data.data.resolvedAt
      }
    } catch (error: any) {
      console.error('解决报警失败:', error)
      throw error
    }
  }

  async getAlarmStats(): Promise<{
    total: number
    active: number
    acknowledged: number
    resolved: number
    byLevel: Record<string, number>
  }> {
    try {
      const response = await fetch(`${API_BASE}/alarms/stats`)
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '获取报警统计失败')
      }

      return data.data
    } catch (error: any) {
      console.error('获取报警统计失败:', error)
      throw error
    }
  }

  async createAlarm(alarm: {
    roomId: string
    roomName: string
    type: string
    level: string
    message: string
  }): Promise<Alarm> {
    try {
      const response = await fetch(`${API_BASE}/alarms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alarm)
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '创建报警失败')
      }

      return {
        id: data.data.alarmId,
        roomId: data.data.roomId,
        roomName: data.data.roomName,
        type: data.data.type,
        level: data.data.level,
        message: data.data.message,
        timestamp: data.data.timestamp,
        acknowledged: data.data.acknowledged,
        status: data.data.status
      }
    } catch (error: any) {
      console.error('创建报警失败:', error)
      throw error
    }
  }

  async deleteAlarm(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/alarms/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '删除报警失败')
      }
    } catch (error: any) {
      console.error('删除报警失败:', error)
      throw error
    }
  }

  async clearResolvedAlarms(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE}/alarms/batch/resolved`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '清除已解决报警失败')
      }

      return data.data.deletedCount
    } catch (error: any) {
      console.error('清除已解决报警失败:', error)
      throw error
    }
  }
}

export const alarmApi = new AlarmApi()