import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types'

// 人员检测结果接口
export interface PersonDetection {
  detectionId: string
  roomId: string
  personCount: number
  originalImage?: string
  detectedImage?: string
  detections: DetectionItem[]
  timestamp: string
  date: string
  time: string
}

// 单个检测项接口
export interface DetectionItem {
  class: number
  confidence: number
  label: string
  bbox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// API基础URL
const API_BASE = 'http://localhost:3000'

export const detectionApi = {
  // 触发人员检测
  async detectPerson(roomId: string): Promise<ApiResponse<PersonDetection>> {
    try {
      const roomNumber = roomId.replace('room0', '')
      const response = await fetch(`${API_BASE}/detections/detect/${roomNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '人员检测失败')
      }

      return {
        code: 200,
        message: 'success',
        data: data.data
      }
    } catch (error: any) {
      console.error(`人员检测失败 (${roomId}):`, error)
      throw error
    }
  },

  // 获取检测记录列表
  async getDetectionHistory(params: {
    roomId?: string
    detectionId?: string
    startTime?: string
    endTime?: string
  } & PaginationParams): Promise<PaginatedResponse<PersonDetection>> {
    try {
      const queryParams = new URLSearchParams()

      if (params.roomId) {
        const roomNumber = params.roomId.replace('room0', '')
        queryParams.append('roomId', roomNumber)
      }
      if (params.detectionId) {
        queryParams.append('detectionId', params.detectionId)
      }
      if (params.startTime) {
        queryParams.append('startTime', params.startTime)
      }
      if (params.endTime) {
        queryParams.append('endTime', params.endTime)
      }
      if (params.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString())
      }

      const url = `${API_BASE}/detections?${queryParams.toString()}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.code !== 200) {
        throw new Error(result.msg || '获取检测记录失败')
      }

      return {
        items: result.data,
        total: result.pagination.total,
        page: result.pagination.page,
        pageSize: result.pagination.pageSize,
        totalPages: result.pagination.totalPages
      }
    } catch (error: any) {
      console.error('获取检测记录失败:', error)
      throw error
    }
  },

  // 根据检测ID获取单条记录
  async getDetectionById(detectionId: string): Promise<ApiResponse<PersonDetection>> {
    try {
      const response = await fetch(`${API_BASE}/detections/${detectionId}`)
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '获取检测记录失败')
      }

      return {
        code: 200,
        message: 'success',
        data: data.data
      }
    } catch (error: any) {
      console.error(`获取检测记录失败 (${detectionId}):`, error)
      throw error
    }
  },

  // 删除检测记录
  async deleteDetection(detectionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE}/detections/${detectionId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '删除检测记录失败')
      }

      return {
        code: 200,
        message: 'success',
        data: undefined
      }
    } catch (error: any) {
      console.error(`删除检测记录失败 (${detectionId}):`, error)
      throw error
    }
  },

  // 创建检测记录（手动）
  async createDetection(detection: {
    roomId: string
    personCount: number
    originalImage?: string
    detectedImage?: string
    detections: DetectionItem[]
  }): Promise<ApiResponse<PersonDetection>> {
    try {
      const roomNumber = detection.roomId.replace('room0', '')
      const response = await fetch(`${API_BASE}/detections/person`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...detection,
          roomId: roomNumber
        })
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '创建检测记录失败')
      }

      return {
        code: 200,
        message: 'success',
        data: data.data
      }
    } catch (error: any) {
      console.error('创建检测记录失败:', error)
      throw error
    }
  }
}
