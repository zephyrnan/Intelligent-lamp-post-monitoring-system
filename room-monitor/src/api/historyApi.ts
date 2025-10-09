import type { HistoryData, DetectionRecord, PaginationParams, PaginatedResponse, SensorData } from '@/types'
import { realRoomApi } from './realRoomApi'

// 存储检测记录的内存变量
let detectionRecords: DetectionRecord[] = []

export class HistoryApi {
  async getHistoryData(params: {
    roomId?: string
    startTime: string
    endTime: string
  } & PaginationParams): Promise<PaginatedResponse<HistoryData>> {
    try {
      const response = await realRoomApi.getHistoryData({
        roomId: params.roomId,
        startDate: params.startTime,
        endDate: params.endTime,
        limit: params.pageSize
      })

      if (response.code !== 200) {
        throw new Error(response.message || '获取历史数据失败')
      }

      // 转换SensorData到HistoryData格式
      const historyData: HistoryData[] = response.data.map((sensor: SensorData) => ({
        id: sensor.id,
        roomId: sensor.roomId,
        timestamp: sensor.timestamp,
        temperature: sensor.temperature,
        humidity: sensor.hum,
        airQuality: sensor.lux
      }))

      // 应用分页
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedData = historyData.slice(start, end)

      return {
        items: paginatedData,
        total: historyData.length,
        page,
        pageSize
      }
    } catch (error: any) {
      console.error('获取历史数据失败:', error)
      throw error
    }
  }

  async getDetectionHistory(params: {
    roomId?: string
    type?: string
    startTime?: string
    endTime?: string
  } & PaginationParams): Promise<PaginatedResponse<DetectionRecord>> {
    try {
      let filtered = detectionRecords

      // 应用过滤器
      if (params.roomId) {
        filtered = filtered.filter(r => r.roomId === params.roomId)
      }
      if (params.type) {
        filtered = filtered.filter(r => r.type === params.type)
      }
      if (params.startTime) {
        filtered = filtered.filter(r => r.timestamp >= params.startTime!)
      }
      if (params.endTime) {
        filtered = filtered.filter(r => r.timestamp <= params.endTime!)
      }

      // 应用分页
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filtered.slice(start, end)

      return {
        items: paginatedData,
        total: filtered.length,
        page,
        pageSize
      }
    } catch (error: any) {
      console.error('获取检测历史失败:', error)
      throw error
    }
  }

  async exportHistoryData(params: {
    roomId?: string
    startTime: string
    endTime: string
    format: 'csv' | 'excel'
  }): Promise<Blob> {
    try {
      const response = await realRoomApi.getHistoryData({
        roomId: params.roomId,
        startDate: params.startTime,
        endDate: params.endTime
      })

      if (response.code !== 200) {
        throw new Error(response.message || '导出历史数据失败')
      }

      // 转换为CSV格式
      let csvContent = 'ID,房间ID,时间戳,温度,湿度,光照强度,旁路电流,旁路电压,总电压\n'
      response.data.forEach((sensor: SensorData) => {
        csvContent += `${sensor.id},${sensor.roomId},${sensor.timestamp},${sensor.temperature},${sensor.hum},${sensor.lux},${sensor.sc},${sensor.sv},${sensor.bv}\n`
      })

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    } catch (error: any) {
      console.error('导出历史数据失败:', error)
      throw error
    }
  }

  async getHistoryStats(roomId: string, days: number = 7): Promise<{
    temperature: { avg: number; max: number; min: number }
    humidity: { avg: number; max: number; min: number }
    airQuality: { avg: number; max: number; min: number }
  }> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const response = await realRoomApi.getHistoryData({
        roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      if (response.code !== 200) {
        throw new Error(response.message || '获取统计数据失败')
      }

      const data = response.data

      if (data.length === 0) {
        return {
          temperature: { avg: 0, max: 0, min: 0 },
          humidity: { avg: 0, max: 0, min: 0 },
          airQuality: { avg: 0, max: 0, min: 0 }
        }
      }

      const temps = data.map((d: SensorData) => d.temperature)
      const hums = data.map((d: SensorData) => d.hum)
      const luxs = data.map((d: SensorData) => d.lux)

      return {
        temperature: {
          avg: temps.reduce((a, b) => a + b, 0) / temps.length,
          max: Math.max(...temps),
          min: Math.min(...temps)
        },
        humidity: {
          avg: hums.reduce((a, b) => a + b, 0) / hums.length,
          max: Math.max(...hums),
          min: Math.min(...hums)
        },
        airQuality: {
          avg: luxs.reduce((a, b) => a + b, 0) / luxs.length,
          max: Math.max(...luxs),
          min: Math.min(...luxs)
        }
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  }

  // 添加检测记录
  addDetectionRecord(record: DetectionRecord): void {
    detectionRecords.push(record)
    // 保持最多1000条记录
    if (detectionRecords.length > 1000) {
      detectionRecords = detectionRecords.slice(-1000)
    }
  }

  // 清除检测记录
  clearDetectionRecords(): void {
    detectionRecords = []
  }
}

export const historyApi = new HistoryApi()