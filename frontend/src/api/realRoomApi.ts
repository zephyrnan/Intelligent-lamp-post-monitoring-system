import type { RoomInfo, SensorData, ApiResponse, AlarmInfo } from '@/types'

// 真实API的房间数据格式
interface RealRoomData {
  roomId: string
  smoke: string
  temp: string
  water: string
  warn: string     // 0=正常, 1=警告, 2=严重
  hum: string
  sc: string
  lux: string
  sv: string
  bv: string
  control: string
  date: string
  time: string
}

// 真实API的响应格式 - 单个房间
interface RealApiResponse {
  msg: string
  code: number
  room: RealRoomData
}

// 真实API的响应格式 - 所有房间
interface RealRoomsResponse {
  msg: string
  code: number
  rooms: RealRoomData[]
}

// 真实API报警信息响应格式
interface RealAlarmResponse {
  msg: string
  code: number
  page: {
    list: RealRoomData[]
  }
}

// 真实API的基础URL
// const REAL_API_BASE = 'http://192.168.31.121:8032/api'
const REAL_API_BASE = 'http://localhost:3000'
// 房间名称和位置映射
const roomConfig: Record<string, { name: string; location: string; description: string }> = {
  '1': { name: '灯杆01', location: 'A区', description: '灯杆01具体信息' },
  '2': { name: '灯杆02', location: 'B区', description: '灯杆02具体信息' },
  '3': { name: '灯杆03', location: 'C区', description: '灯杆03具体信息' }
}

// 报警级别映射
const warnLevelMap: Record<string, 'normal' | 'warning' | 'error'> = {
  '0': 'normal',
  '1': 'warning',
  '2': 'error'
}

// 将真实API数据转换为内部SensorData格式
const transformSensorData = (realData: RealRoomData): SensorData => {
  return {
    id: `sensor_${realData.roomId}_${realData.date}_${realData.time}`,
    roomId: `room0${realData.roomId}`,
    timestamp: `${realData.date}T${realData.time}`,
    smokeLevel: parseFloat(realData.smoke) || 0,
    temperature: parseFloat(realData.temp) || 0,
    hum: parseFloat(realData.hum) || 0,
    lux: parseFloat(realData.lux) || 0,
    sc: parseFloat(realData.sc) || 0,
    sv: parseFloat(realData.sv) || 0,
    bv: parseFloat(realData.bv) || 0,
    water: parseFloat(realData.water) || 0,
    warn: parseInt(realData.warn) || 0
  }
}

// 数据转换函数：将真实API数据格式转换为系统内部格式
function transformRoomData(realData: RealRoomData): { roomInfo: RoomInfo, sensorData: SensorData } {
  // 根据warn字段确定房间状态
  let status: 'normal' | 'warning' | 'error'
  switch (realData.warn) {
    case '0':
      status = 'normal'
      break
    case '1':
      status = 'warning'
      break
    case '2':
    default:
      status = 'error'
      break
  }

  // 获取房间配置
  const config = roomConfig[realData.roomId] || roomConfig['1']

  // 转换房间信息
  const roomInfo: RoomInfo = {
    id: `room0${realData.roomId}`,
    name: config.name,
    status,
    location: config.location,
    description: config.description,
    temperature: parseFloat(realData.temp) || 0,
    humidity: parseFloat(realData.hum) || 0,
    airQuality: parseFloat(realData.lux) || 0,
    lastUpdateTime: `${realData.date}T${realData.time}`
  }

  // 转换传感器数据
  const sensorData: SensorData = {
    id: `sensor_room0${realData.roomId}_${Date.now()}`,
    roomId: `room0${realData.roomId}`,
    timestamp: `${realData.date}T${realData.time}`,
    smokeLevel: parseFloat(realData.smoke) || 0,
    temperature: parseFloat(realData.temp) || 0,
    hum: parseFloat(realData.hum) || 0,
    lux: parseFloat(realData.lux) || 0,
    sc: parseFloat(realData.sc) || 0,
    sv: parseFloat(realData.sv) || 0,
    bv: parseFloat(realData.bv) || 0,
    water: parseFloat(realData.water) || 0,
    warn: parseInt(realData.warn) || 0
  }

  return { roomInfo, sensorData }
}

// 真实API服务
export const realRoomApi = {
  // 获取单个房间数据
  async getRoomData(roomNumber: string): Promise<ApiResponse<{ roomInfo: RoomInfo, sensorData: SensorData }>> {
    try {
      const response = await fetch(`${REAL_API_BASE}/rooms/${roomNumber}`)
      const data: RealApiResponse = await response.json()

      if (data.code !== 200 || !data.room) {
        throw new Error(data.msg || '获取房间数据失败')
      }

      const transformedData = transformRoomData(data.room)

      return {
        code: 200,
        message: 'success',
        data: transformedData
      }
    } catch (error: any) {
      console.error(`获取房间${roomNumber}数据失败:`, error)
      throw new Error(`获取房间数据失败: ${error.message}`)
    }
  },

  // 获取所有房间列表
  async getRooms(): Promise<ApiResponse<RoomInfo[]>> {
    try {
      const response = await fetch(`${REAL_API_BASE}/rooms`)
      const data: RealRoomsResponse = await response.json()

      if (data.code !== 200 || !data.rooms) {
        throw new Error(data.msg || '获取房间列表失败')
      }

      const rooms: RoomInfo[] = data.rooms.map(roomData => {
        const transformedData = transformRoomData(roomData)
        return transformedData.roomInfo
      })

      return {
        code: 200,
        message: 'success',
        data: rooms
      }
    } catch (error: any) {
      console.error('获取房间列表失败:', error)
      throw new Error(`获取房间列表失败: ${error.message}`)
    }
  },

  // 获取房间详情
  async getRoomDetail(roomId: string): Promise<ApiResponse<RoomInfo>> {
    try {
      const roomNumber = roomId.replace('room0', '')
      const roomData = await this.getRoomData(roomNumber)
      return {
        code: 200,
        message: 'success',
        data: roomData.data.roomInfo
      }
    } catch (error: any) {
      console.error(`获取房间详情失败 (${roomId}):`, error)
      throw error
    }
  },

  // 获取实时传感器数据
  async getRealtimeSensorData(roomId: string): Promise<ApiResponse<SensorData>> {
    try {
      const roomNumber = roomId.replace('room0', '')
      const roomData = await this.getRoomData(roomNumber)
      return {
        code: 200,
        message: 'success',
        data: roomData.data.sensorData
      }
    } catch (error: any) {
      console.error(`获取实时传感器数据失败 (${roomId}):`, error)
      throw error
    }
  },

  // 获取历史数据（支持后端筛选和分页）
  async getHistoryData(params?: {
    roomId?: string,
    startDate?: string,
    endDate?: string,
    warnLevel?: number,
    minTemp?: number,
    maxTemp?: number,
    minHum?: number,
    maxHum?: number,
    minSmoke?: number,
    maxSmoke?: number,
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<SensorData[]> & { pagination?: any }> {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()

      if (params?.roomId) {
        const roomNumber = params.roomId.replace('room0', '')
        queryParams.append('roomId', roomNumber)
      }
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate.split('T')[0])
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate.split('T')[0])
      }
      if (params?.warnLevel !== undefined) {
        queryParams.append('warnLevel', params.warnLevel.toString())
      }
      if (params?.minTemp !== undefined) {
        queryParams.append('minTemp', params.minTemp.toString())
      }
      if (params?.maxTemp !== undefined) {
        queryParams.append('maxTemp', params.maxTemp.toString())
      }
      if (params?.minHum !== undefined) {
        queryParams.append('minHum', params.minHum.toString())
      }
      if (params?.maxHum !== undefined) {
        queryParams.append('maxHum', params.maxHum.toString())
      }
      if (params?.minSmoke !== undefined) {
        queryParams.append('minSmoke', params.minSmoke.toString())
      }
      if (params?.maxSmoke !== undefined) {
        queryParams.append('maxSmoke', params.maxSmoke.toString())
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }
      if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString())
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy)
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder)
      }

      const url = `${REAL_API_BASE}/history?${queryParams.toString()}`
      const response = await fetch(url)
      const data: {
        code: number;
        msg: string;
        data: RealRoomData[];
        pagination?: {
          total: number;
          page: number;
          pageSize: number;
          totalPages: number;
        }
      } = await response.json()

      if (data.code === 200 && data.data) {
        // 转换所有房间数据
        const sensorDataList = data.data.map(item => transformSensorData(item))

        return {
          code: 200,
          message: 'success',
          data: sensorDataList,
          pagination: data.pagination
        }
      } else {
        throw new Error(data.msg || '获取历史数据失败')
      }
    } catch (error: any) {
      console.error('获取历史数据失败:', error)
      throw error
    }
  },

  // 获取设备控制状态
  async getDeviceControl(roomId: string): Promise<ApiResponse<{ roomId: string; control: string }>> {
    try {
      const roomNumber = roomId.replace('room0', '')
      const response = await fetch(`${REAL_API_BASE}/rooms/${roomNumber}/device/control`)
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '获取设备控制状态失败')
      }

      return {
        code: 200,
        message: 'success',
        data: data.data
      }
    } catch (error: any) {
      console.error(`获取设备控制状态失败 (${roomId}):`, error)
      throw error
    }
  },

  // 更新设备控制状态
  async updateDeviceControl(roomId: string, control: '0' | '1'): Promise<ApiResponse<{ roomId: string; control: string }>> {
    try {
      const roomNumber = roomId.replace('room0', '')
      const response = await fetch(`${REAL_API_BASE}/rooms/${roomNumber}/device/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ control })
      })
      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '更新设备控制状态失败')
      }

      return {
        code: 200,
        message: 'success',
        data: data.data
      }
    } catch (error: any) {
      console.error(`更新设备控制状态失败 (${roomId}):`, error)
      throw error
    }
  }
}
