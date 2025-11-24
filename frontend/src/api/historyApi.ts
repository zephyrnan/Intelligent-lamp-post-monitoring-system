import type { HistoryData, DetectionRecord, PaginationParams, PaginatedResponse, SensorData } from '@/types'
import { realRoomApi } from './realRoomApi'

// 存储检测记录的内存变量
let detectionRecords: DetectionRecord[] = []

export class HistoryApi {
  async getHistoryData(params: {
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
  } & PaginationParams): Promise<PaginatedResponse<HistoryData>> {
    try {
      const response = await realRoomApi.getHistoryData({
        roomId: params.roomId,
        startDate: params.startTime,
        endDate: params.endTime,
        warnLevel: params.warnLevel,
        minTemp: params.minTemp,
        maxTemp: params.maxTemp,
        minHum: params.minHum,
        maxHum: params.maxHum,
        minSmoke: params.minSmoke,
        maxSmoke: params.maxSmoke,
        page: params.page,
        pageSize: params.pageSize,
        sortBy: 'date',
        sortOrder: 'desc'
      })

      if (response.code !== 200) {
        throw new Error(response.message || '获取历史数据失败')
      }

      // 转换SensorData到HistoryData格式
      const historyData: HistoryData[] = response.data.map((sensor: SensorData) => ({
        id: sensor.id,
        roomId: sensor.roomId,
        timestamp: sensor.timestamp,
        smoke: sensor.smokeLevel,
        temperature: sensor.temperature,
        water: sensor.water || 0,
        warn: sensor.warn || 0,
        humidity: sensor.hum,
        sc: sensor.sc,
        lux: sensor.lux,
        sv: sensor.sv,
        bv: sensor.bv
      }))

      // 使用后端分页信息
      const pagination = response.pagination || {
        total: historyData.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: Math.ceil(historyData.length / (params.pageSize || 20))
      }

      return {
        items: historyData,
        total: pagination.total,
        page: pagination.page,
        pageSize: pagination.pageSize
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