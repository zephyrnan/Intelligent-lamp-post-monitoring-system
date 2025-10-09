import type { DetectionRecord } from '@/types'

// 检测记录存储
interface StoredDetectionRecord extends DetectionRecord {
  personCount: number
  source: 'manual' | 'auto'
  operator?: string
}

// 检测统计数据
interface DetectionStats {
  totalDetections: number
  todayDetections: number
  averageConfidence: number
  detectionRate: number
}

const STORAGE_KEY = 'detection_records'
const MAX_RECORDS = 1000

class DetectionStorage {
  private records: StoredDetectionRecord[] = []

  constructor() {
    this.loadFromLocalStorage()
  }

  // 保存检测记录
  saveDetection(record: Omit<StoredDetectionRecord, 'id'>): StoredDetectionRecord {
    const newRecord: StoredDetectionRecord = {
      ...record,
      id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    this.records.unshift(newRecord)

    // 保持最大记录数限制
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(0, MAX_RECORDS)
    }

    this.saveToLocalStorage()
    return newRecord
  }

  // 获取指定房间的检测记录
  getDetectionsByRoom(roomId: string, limit?: number): StoredDetectionRecord[] {
    const filtered = this.records.filter(r => r.roomId === roomId)
    return limit ? filtered.slice(0, limit) : filtered
  }

  // 获取所有检测记录
  getAllDetections(limit?: number): StoredDetectionRecord[] {
    return limit ? this.records.slice(0, limit) : [...this.records]
  }

  // 获取检测统计数据
  getStats(roomId?: string): DetectionStats {
    const targetRecords = roomId
      ? this.records.filter(r => r.roomId === roomId)
      : this.records

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayRecords = targetRecords.filter(r =>
      new Date(r.timestamp).getTime() >= today.getTime()
    )

    const totalDetections = targetRecords.length
    const todayDetections = todayRecords.length

    // 计算平均置信度
    let averageConfidence = 0
    if (targetRecords.length > 0) {
      const totalConfidence = targetRecords.reduce((sum, r) => sum + r.confidence, 0)
      averageConfidence = totalConfidence / targetRecords.length
    }

    // 计算检测率（今日检测数/总检测数）
    const detectionRate = totalDetections > 0
      ? (todayDetections / totalDetections) * 100
      : 0

    return {
      totalDetections,
      todayDetections,
      averageConfidence,
      detectionRate
    }
  }

  // 删除指定记录
  deleteRecord(recordId: string): boolean {
    const index = this.records.findIndex(r => r.id === recordId)
    if (index !== -1) {
      this.records.splice(index, 1)
      this.saveToLocalStorage()
      return true
    }
    return false
  }

  // 清除所有记录
  clearAll(): void {
    this.records = []
    this.saveToLocalStorage()
  }

  // 清除指定房间的记录
  clearByRoom(roomId: string): void {
    this.records = this.records.filter(r => r.roomId !== roomId)
    this.saveToLocalStorage()
  }

  // 清除过期记录（超过指定天数）
  clearOldRecords(days: number): void {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
    this.records = this.records.filter(r =>
      new Date(r.timestamp).getTime() > cutoffTime
    )
    this.saveToLocalStorage()
  }

  // 获取指定ID的记录
  getRecordById(recordId: string): StoredDetectionRecord | null {
    return this.records.find(r => r.id === recordId) || null
  }

  // 保存到本地存储
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records))
    } catch (error) {
      console.error('保存检测记录到本地存储失败:', error)
    }
  }

  // 从本地存储加载
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.records = JSON.parse(stored)
        console.log(`从本地存储加载了 ${this.records.length} 条检测记录`)
      }
    } catch (error) {
      console.error('从本地存储加载检测记录失败:', error)
      this.records = []
    }
  }

  // 导出为JSON
  exportToJson(): string {
    return JSON.stringify(this.records, null, 2)
  }

  // 从JSON导入
  importFromJson(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as StoredDetectionRecord[]
      if (Array.isArray(imported)) {
        this.records = imported
        this.saveToLocalStorage()
        return true
      }
      return false
    } catch (error) {
      console.error('导入检测记录失败:', error)
      return false
    }
  }
}

// 创建单例实例
export const detectionStorage = new DetectionStorage()

// 导出类型
export type { StoredDetectionRecord, DetectionStats }
