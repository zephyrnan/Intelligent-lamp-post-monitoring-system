// 房间信息 (兼容 jiankong RoomInfo)
export interface Room {
  id: string
  name: string
  status: 'normal' | 'warning' | 'error' | 'offline'
  temperature: number
  humidity: number
  airQuality: number
  lastUpdateTime: string
  location?: string
  deviceCount?: number
  description?: string
}

// 别名：保持与jiankong兼容
export type RoomInfo = Room

// 传感器数据
export interface SensorData {
  id: string
  roomId: string
  timestamp: string
  smokeLevel: number // 烟雾浓度
  temperature: number // 空气温度
  hum: number        // 湿度
  lux: number       // 光照强度
  sc: number        // 旁路电流
  sv: number        // 旁路电压
  bv: number        // 总电压
}

// 真实API返回的房间数据格式
export interface RealRoomData {
  roomId: string
  smoke: string    // 烟雾浓度
  temp: string     // 温度
  water: string    // 水位
  warn: string     // 报警状态 0=正常 1=警告 2=严重
  control: string  // 控制状态
  date: string     // 日期
  time: string     // 时间
  hum: string      // 湿度
  lux: string      // 光照强度
  sc: string       // 旁路电流
  sv: string       // 旁路电压
  bv: string       // 总电压
}

// 设备控制信息
export interface DeviceControl {
  id: string
  roomId: string
  name: string
  type: 'valve' | 'relay' // 电磁阀或继电器
  status: boolean | number // 开启/关闭状态
}

export interface Device {
  id: string
  roomId: string
  name: string
  type: 'camera' | 'sensor' | 'controller' | 'valve' | 'relay'
  status: 'online' | 'offline' | 'error' | boolean
  value?: number
  unit?: string
  lastHeartbeat?: string
}

// 报警信息 (扩展 jianshi Alarm 接口)
export interface AlarmInfo {
  id: string
  roomId: string
  roomName?: string
  type: 'smoke' | 'temperature' | 'water' | 'person' | 'hum' | 'lux' | 'sc' | 'sv' | 'bv' | 'humidity' | 'air_quality' | 'device_offline' | 'intrusion'
  level: 'warning' | 'error' | 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
  status?: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
}

// 别名：保持与jianshi兼容
export type Alarm = AlarmInfo

// 人员检测结果
export interface PersonDetection {
  id?: string
  roomId?: string
  cameraId?: string
  timestamp: string | number
  originalImage?: string // base64图片
  processedImage: string // 处理后的图片
  detections: DetectionResult[]
  detectionCount?: number // 检测到的对象数量
}

// 检测结果
export interface DetectionResult {
  class: number
  confidence: number
  label: string
}

export interface HistoryData {
  id: string
  roomId: string
  timestamp: string
  temperature: number
  humidity: number
  airQuality: number
}

export interface DetectionRecord {
  id: string
  roomId: string
  roomName?: string
  timestamp: string
  type: 'motion' | 'person' | 'object'
  confidence: number
  imageUrl?: string
  description?: string
  originalImage?: string
  processedImage?: string
  detections?: DetectionResult[]
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success?: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages?: number
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }>
}

export interface GlobalError {
  message: string
  code?: number
  timestamp: Date
  source?: string
  stack?: string
}

// 视频流信息
export interface VideoStream {
  roomId: string
  streamUrl: string
  status: 'online' | 'offline'
  streamType?: 'http' | 'websocket'
  wsUrl?: string
}