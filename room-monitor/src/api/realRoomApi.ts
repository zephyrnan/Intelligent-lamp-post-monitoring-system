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

// 真实API的响应格式
interface RealApiResponse {
  msg: string
  code: number
  room: RealRoomData
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
const REAL_API_BASE = 'http://192.168.31.121:8032/api'

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
    bv: parseFloat(realData.bv) || 0
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
    bv: parseFloat(realData.bv) || 0
  }

  return { roomInfo, sensorData }
}

// 真实API服务
export const realRoomApi = {
  // 获取单个房间数据
  async getRoomData(roomNumber: string): Promise<ApiResponse<{ roomInfo: RoomInfo, sensorData: SensorData }>> {
    try {
      const response = await fetch(`${REAL_API_BASE}/room/${roomNumber}`)
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
      const roomNumbers = ['1', '2', '3']
      const rooms: RoomInfo[] = []

      const promises = roomNumbers.map(async (roomNumber) => {
        try {
          const roomData = await this.getRoomData(roomNumber)
          return roomData.data.roomInfo
        } catch (error) {
          console.warn(`获取房间${roomNumber}失败，使用默认数据:`, error)
          const config = roomConfig[roomNumber] || roomConfig['1']
          return {
            id: `room0${roomNumber}`,
            name: config.name,
            status: 'error' as const,
            location: config.location,
            description: `${config.description}（连接失败）`,
            temperature: 0,
            humidity: 0,
            airQuality: 0,
            lastUpdateTime: new Date().toISOString()
          }
        }
      })

      const results = await Promise.all(promises)
      rooms.push(...results)

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

  // 获取历史数据
  async getHistoryData(params?: {
    roomId?: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  }): Promise<ApiResponse<SensorData[]>> {
    try {
      let url = `${REAL_API_BASE}/room`

      if (params?.roomId) {
        const roomNumber = params.roomId.replace('room0', '')
        url = `${REAL_API_BASE}/room/${roomNumber}`
      }

      const response = await fetch(url)
      const data: RealApiResponse | RealAlarmResponse = await response.json()

      let sensorDataList: SensorData[] = []

      if (data.code === 200) {
        if ('room' in data && data.room) {
          sensorDataList = [transformSensorData(data.room)]
        } else if ('page' in data && data.page.list) {
          sensorDataList = data.page.list.map(item => transformSensorData(item))
        }

        return {
          code: 200,
          message: 'success',
          data: sensorDataList
        }
      } else {
        throw new Error(data.msg || '获取历史数据失败')
      }
    } catch (error: any) {
      console.error('获取历史数据失败:', error)
      throw error
    }
  }
}
