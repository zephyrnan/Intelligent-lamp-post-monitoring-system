import type { Room, PaginationParams, PaginatedResponse } from '@/types'
import { realRoomApi } from './realRoomApi'

export class RoomApi {
  async getRooms(params?: PaginationParams & {
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Room>> {
    try {
      const response = await realRoomApi.getRooms()

      if (response.code !== 200) {
        throw new Error(response.message || '获取房间列表失败')
      }

      let rooms = response.data

      // 应用过滤器
      if (params?.status) {
        rooms = rooms.filter(room => room.status === params.status)
      }
      if (params?.search) {
        const searchLower = params.search.toLowerCase()
        rooms = rooms.filter(room =>
          room.name.toLowerCase().includes(searchLower) ||
          room.location?.toLowerCase().includes(searchLower)
        )
      }

      // 应用分页
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedRooms = rooms.slice(start, end)

      return {
        items: paginatedRooms,
        total: rooms.length,
        page,
        pageSize
      }
    } catch (error: any) {
      console.error('获取房间列表失败:', error)
      throw error
    }
  }

  async getRoomById(id: string): Promise<Room> {
    try {
      const response = await realRoomApi.getRoomDetail(id)

      if (response.code !== 200) {
        throw new Error(response.message || '获取房间详情失败')
      }

      return response.data
    } catch (error: any) {
      console.error(`获取房间详情失败 (${id}):`, error)
      throw error
    }
  }

  async createRoom(room: Omit<Room, 'id' | 'lastUpdateTime'>): Promise<Room> {
    // 暂不支持创建房间
    throw new Error('创建房间功能暂未实现')
  }

  async updateRoom(id: string, roomData: Partial<Room>): Promise<Room> {
    // 暂不支持更新房间
    throw new Error('更新房间功能暂未实现')
  }

  async deleteRoom(id: string): Promise<void> {
    // 暂不支持删除房间
    throw new Error('删除房间功能暂未实现')
  }

  async getRoomStatus(id: string): Promise<{
    temperature: number
    humidity: number
    airQuality: number
    status: string
    lastUpdateTime: string
  }> {
    try {
      const response = await realRoomApi.getRealtimeSensorData(id)

      if (response.code !== 200) {
        throw new Error(response.message || '获取房间状态失败')
      }

      const sensorData = response.data
      return {
        temperature: sensorData.temperature,
        humidity: sensorData.hum,
        airQuality: sensorData.lux,
        status: 'normal', // 需要根据传感器数据判断
        lastUpdateTime: sensorData.timestamp
      }
    } catch (error: any) {
      console.error(`获取房间状态失败 (${id}):`, error)
      throw error
    }
  }

  async getRoomDevices(id: string): Promise<any[]> {
    // 返回设备列表（可以根据实际需求扩展）
    const roomNumber = id.replace('room0', '')
    return [
      {
        id: `valve_${id}`,
        roomId: id,
        name: '灯光',
        type: 'valve',
        status: false
      }
    ]
  }
}

export const roomApi = new RoomApi()