import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Room, PaginationParams, SensorData } from '@/types'
import { roomApi, realRoomApi } from '@/api'

export const useRoomStore = defineStore('room', () => {
  const rooms = ref<Room[]>([])
  const currentRoom = ref<Room | null>(null)
  const currentSensorData = ref<Record<string, SensorData>>({})
  const loading = ref(false)
  const total = ref(0)
  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10
  })

  const activeRooms = computed(() =>
    rooms.value.filter(room => room.status !== 'offline')
  )

  const warningRooms = computed(() =>
    rooms.value.filter(room => room.status === 'warning' || room.status === 'error')
  )

  const roomStats = computed(() => ({
    total: rooms.value.length,
    normal: rooms.value.filter(r => r.status === 'normal').length,
    warning: rooms.value.filter(r => r.status === 'warning').length,
    error: rooms.value.filter(r => r.status === 'error').length,
    offline: rooms.value.filter(r => r.status === 'offline').length
  }))

  async function fetchRooms(params?: Partial<PaginationParams & { status?: string; search?: string }>) {
    try {
      loading.value = true
      const searchParams = { ...pagination.value, ...params }
      const response = await roomApi.getRooms(searchParams)

      rooms.value = response.items
      total.value = response.total
      pagination.value = {
        page: response.page,
        pageSize: response.pageSize
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchRoomById(id: string) {
    try {
      loading.value = true
      console.log('Fetching room by ID:', id)
      const room = await roomApi.getRoomById(id)
      console.log('Room API response:', room)

      if (!room) {
        throw new Error('Invalid room data received')
      }

      // 确保必要的属性存在
      const normalizedRoom: Room = {
        id: room.id || id,
        name: room.name || '未知房间',
        status: room.status || 'offline',
        temperature: room.temperature !== undefined ? room.temperature : 0,
        humidity: room.humidity !== undefined ? room.humidity : 0,
        airQuality: room.airQuality !== undefined ? room.airQuality : 0,
        lastUpdateTime: room.lastUpdateTime || new Date().toISOString(),
        location: room.location,
        deviceCount: room.deviceCount,
        description: room.description
      }

      currentRoom.value = normalizedRoom
      console.log('Normalized room:', normalizedRoom)
      return normalizedRoom
    } catch (error) {
      console.error('Failed to fetch room:', error)
      currentRoom.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createRoom(roomData: Omit<Room, 'id' | 'lastUpdateTime'>) {
    try {
      loading.value = true
      const newRoom = await roomApi.createRoom(roomData)
      rooms.value.unshift(newRoom)
      total.value++
      return newRoom
    } catch (error) {
      console.error('Failed to create room:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateRoom(id: string, roomData: Partial<Room>) {
    try {
      loading.value = true
      const updatedRoom = await roomApi.updateRoom(id, roomData)
      const index = rooms.value.findIndex(room => room.id === id)
      if (index !== -1) {
        rooms.value[index] = updatedRoom
      }
      if (currentRoom.value?.id === id) {
        currentRoom.value = updatedRoom
      }
      return updatedRoom
    } catch (error) {
      console.error('Failed to update room:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteRoom(id: string) {
    try {
      loading.value = true
      await roomApi.deleteRoom(id)
      rooms.value = rooms.value.filter(room => room.id !== id)
      total.value--
      if (currentRoom.value?.id === id) {
        currentRoom.value = null
      }
    } catch (error) {
      console.error('Failed to delete room:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function updateRoomStatus(id: string, status: Room['status']) {
    const room = rooms.value.find(r => r.id === id)
    if (room) {
      room.status = status
      room.lastUpdateTime = new Date().toISOString()
    }
    if (currentRoom.value?.id === id) {
      currentRoom.value.status = status
      currentRoom.value.lastUpdateTime = new Date().toISOString()
    }
  }

  function updateRoomData(id: string, data: Partial<Room>) {
    const room = rooms.value.find(r => r.id === id)
    if (room) {
      Object.assign(room, data, { lastUpdateTime: new Date().toISOString() })
    }
    if (currentRoom.value?.id === id) {
      Object.assign(currentRoom.value, data, { lastUpdateTime: new Date().toISOString() })
    }
  }

  function setCurrentRoom(room: Room | null) {
    currentRoom.value = room
  }

  function clearRooms() {
    rooms.value = []
    currentRoom.value = null
    total.value = 0
  }

  // 更新传感器数据
  function updateSensorData(sensorData: SensorData) {
    currentSensorData.value[sensorData.roomId] = sensorData
  }

  // 获取指定房间的传感器数据
  function getSensorDataByRoomId(roomId: string): SensorData | null {
    return currentSensorData.value[roomId] || null
  }

  // 获取实时传感器数据
  async function fetchRealtimeSensorData(roomId: string): Promise<SensorData> {
    try {
      const response = await realRoomApi.getRealtimeSensorData(roomId)
      if (response.code !== 200) {
        throw new Error(response.message || '获取传感器数据失败')
      }
      updateSensorData(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch sensor data:', error)
      throw error
    }
  }

  return {
    rooms,
    currentRoom,
    currentSensorData,
    loading,
    total,
    pagination,
    activeRooms,
    warningRooms,
    roomStats,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    updateRoomData,
    setCurrentRoom,
    clearRooms,
    updateSensorData,
    getSensorDataByRoomId,
    fetchRealtimeSensorData
  }
})