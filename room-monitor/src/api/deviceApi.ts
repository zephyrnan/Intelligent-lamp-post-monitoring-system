import type { DeviceControl, Device } from '@/types'

// 操作数据接口
interface DeviceOperationData {
  id: string
  roomId: string
  timestamp: string
  operation: 'valve_control' | 'relay_control'
  deviceName: string
  oldValue: boolean
  newValue: boolean
  operatorId?: string
  description: string
}

// 存储设备操作记录的内存变量
let storedDeviceOperations: DeviceOperationData[] = []

export class DeviceApi {
  // 获取房间的设备列表
  async getDevices(roomId: string): Promise<DeviceControl[]> {
    const devices: DeviceControl[] = []

    // 为每个房间添加灯光控制设备
    devices.push({
      id: `valve_${roomId}`,
      roomId: roomId,
      name: '灯光',
      type: 'valve',
      status: false // 默认关闭状态
    })

    return devices
  }

  // 控制设备
  async controlDevice(deviceId: string, status: boolean): Promise<boolean> {
    try {
      // 解析deviceId以获取roomId和设备类型
      const [deviceType, roomIdPart] = deviceId.split('_')
      const roomId = roomIdPart.replace('room0', '')

      // 获取设备当前状态（模拟）
      const oldStatus = !status

      // control参数: 0表示关闭，1表示开启
      const controlValue = status ? 1 : 0

      // 根据设备类型构造不同的API URL
      let apiUrl = ''
      if (deviceType === 'valve') {
        apiUrl = `http://192.168.31.121:8032/api/room/up?roomId=${roomId}&control=${controlValue}`
      } else if (deviceType === 'relay') {
        apiUrl = `http://192.168.31.121:8032/api/room/up?roomId=${roomId}&led=${controlValue}`
      } else {
        apiUrl = `http://192.168.31.121:8032/api/room/up?roomId=${roomId}&control=${controlValue}`
      }

      // 发送控制请求
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== 200) {
        throw new Error(`API error: ${result.msg || 'Unknown error'}`)
      }

      // 记录设备操作
      const deviceNames = {
        'valve': '进水阀',
        'relay': '灯光'
      }

      const operationTypes = {
        'valve': 'valve_control' as const,
        'relay': 'relay_control' as const
      }

      this.addDeviceOperationRecord({
        id: `op_${Date.now()}_${deviceId}`,
        roomId: `room0${roomId}`,
        timestamp: new Date().toISOString(),
        operation: operationTypes[deviceType as keyof typeof operationTypes] || 'valve_control',
        deviceName: deviceNames[deviceType as keyof typeof deviceNames] || '未知设备',
        oldValue: oldStatus,
        newValue: status,
        description: `${deviceNames[deviceType as keyof typeof deviceNames] || '未知设备'}从${oldStatus ? '开启' : '关闭'}变为${status ? '开启' : '关闭'}`
      })

      return status
    } catch (error) {
      console.error('控制设备失败:', error)
      throw error
    }
  }

  // 获取设备操作历史数据
  async getDeviceOperationData(roomId: string, limit = 50): Promise<DeviceOperationData[]> {
    let filteredOperations = storedDeviceOperations
    if (roomId) {
      filteredOperations = storedDeviceOperations.filter(op => op.roomId === roomId)
    }

    // 按时间倒序排列并限制数量
    const sortedOperations = filteredOperations.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return sortedOperations.slice(0, limit)
  }

  // 添加设备操作记录
  addDeviceOperationRecord(record: DeviceOperationData): void {
    storedDeviceOperations.push(record)
    // 保持最多1000条记录
    if (storedDeviceOperations.length > 1000) {
      storedDeviceOperations = storedDeviceOperations.slice(-1000)
    }
  }

  // 清除设备操作记录
  clearDeviceOperations(): void {
    storedDeviceOperations = []
  }
}

export const deviceApi = new DeviceApi()
