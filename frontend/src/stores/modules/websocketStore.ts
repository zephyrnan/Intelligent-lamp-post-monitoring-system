import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import { ElMessage, ElNotification } from 'element-plus'
import type { SensorData, AlarmInfo } from '@/types'

// WebSocket事件类型定义
export interface WebSocketEvents {
  // 房间数据更新
  'room:update': (data: {
    roomId: string
    sensorData: SensorData
    status: 'normal' | 'warning' | 'error'
  }) => void

  // 报警事件
  'alarm:new': (data: AlarmInfo) => void

  // 设备状态变化
  'device:status': (data: {
    deviceId: string
    roomId: string
    type: 'valve' | 'relay'
    status: boolean | number
    timestamp: string
  }) => void

  // 人员检测结果
  'detection:result': (data: {
    roomId: string
    cameraId: string
    detectionCount: number
    originalImage: string
    processedImage: string
    detections: Array<{
      class: number
      confidence: number
      label: string
    }>
    timestamp: string
  }) => void

  // 视频帧更新
  'video_frame': (data: {
    roomId: string
    frame: string
  }) => void
}

// WebSocket配置
interface WebSocketConfig {
  url: string
  autoReconnect: boolean
  reconnectInterval: number
  maxReconnectAttempts: number
  timeout: number
  enableHeartbeat: boolean
  heartbeatInterval: number
}

export const useWebSocketStore = defineStore('websocket', () => {
  const socket = ref<Socket | null>(null)
  const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('disconnected')
  const reconnectAttempts = ref(0)
  const ping = ref(0)
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const connected = computed(() => connectionStatus.value === 'connected')

  const config: WebSocketConfig = {
    //url: 'ws://192.168.3.2:8032',
    url: 'http://localhost:3000',
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    timeout: 10000,
    enableHeartbeat: true,
    heartbeatInterval: 30000
  }

  let heartbeatTimer: number | null = null
  const eventListeners = ref<Map<string, Function[]>>(new Map())

  // 连接WebSocket
  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        socket.value = io(config.url, {
          timeout: config.timeout,
          transports: ['websocket'],
          upgrade: false,
          autoConnect: true,
          reconnection: config.autoReconnect,
          reconnectionDelay: config.reconnectInterval,
          reconnectionAttempts: config.maxReconnectAttempts
        })

        // 连接成功
        socket.value.on('connect', () => {
          console.log('WebSocket连接成功')
          connectionStatus.value = 'connected'
          reconnectAttempts.value = 0
          startHeartbeat()
          ElMessage.success('实时连接已建立')
          resolve()
        })

        // 连接失败
        socket.value.on('connect_error', (error) => {
          console.error('WebSocket连接失败:', error)
          connectionStatus.value = 'disconnected'

          if (reconnectAttempts.value === 0) {
            ElMessage.error('实时连接失败，正在尝试重连...')
          }
          reject(error)
        })

        // 断开连接
        socket.value.on('disconnect', (reason) => {
          console.warn('WebSocket连接断开:', reason)
          connectionStatus.value = 'disconnected'
          stopHeartbeat()

          if (reason === 'io server disconnect') {
            reconnect()
          }
        })

        // 重连中
        socket.value.on('reconnect_attempt', (attemptNumber) => {
          console.log(`WebSocket重连尝试 ${attemptNumber}/${config.maxReconnectAttempts}`)
          connectionStatus.value = 'reconnecting'
          reconnectAttempts.value = attemptNumber
        })

        // 重连成功
        socket.value.on('reconnect', (attemptNumber) => {
          console.log(`WebSocket重连成功 (尝试${attemptNumber}次)`)
          ElNotification({
            title: '连接恢复',
            message: `实时连接已恢复 (尝试${attemptNumber}次)`,
            type: 'success',
            duration: 3000
          })
        })

        // 重连失败
        socket.value.on('reconnect_failed', () => {
          console.error('WebSocket重连失败，已达到最大重试次数')
          ElNotification({
            title: '连接失败',
            message: '无法建立实时连接，请检查网络设置',
            type: 'error',
            duration: 0
          })
        })

        // 注册业务事件监听器
        setupEventListeners()

      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        reject(error)
      }
    })
  }

  // 断开连接
  function disconnect() {
    if (socket.value) {
      stopHeartbeat()
      socket.value.disconnect()
      socket.value = null
      connectionStatus.value = 'disconnected'
      eventListeners.value.clear()
      console.log('WebSocket连接已断开')
    }
  }

  // 手动重连
  function reconnect() {
    if (socket.value && connectionStatus.value !== 'connected') {
      console.log('手动重连WebSocket...')
      socket.value.connect()
    }
  }

  // 发送消息
  function emit(event: string, data?: any) {
    if (socket.value && connectionStatus.value === 'connected') {
      socket.value.emit(event, data)
    } else {
      console.warn('WebSocket未连接，无法发送消息:', event, data)
    }
  }

  // 监听事件
  function on<K extends keyof WebSocketEvents>(event: K | string, callback: Function) {
    if (!eventListeners.value.has(event)) {
      eventListeners.value.set(event, [])
    }
    eventListeners.value.get(event)!.push(callback)

    // 如果socket已连接，立即注册监听器
    if (socket.value) {
      socket.value.on(event, callback as any)
    }
  }

  // 移除事件监听器
  function off<K extends keyof WebSocketEvents>(event: K | string, callback?: Function) {
    if (callback) {
      const listeners = eventListeners.value.get(event) || []
      const index = listeners.indexOf(callback)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
      if (socket.value) {
        socket.value.off(event, callback as any)
      }
    } else {
      // 移除所有监听器
      eventListeners.value.delete(event)
      if (socket.value) {
        socket.value.off(event)
      }
    }
  }

  // 设置业务事件监听器
  function setupEventListeners() {
    if (!socket.value) return

    // 为已注册的事件监听器重新绑定
    eventListeners.value.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.value!.on(event, callback as any)
      })
    })
  }

  // 开始心跳
  function startHeartbeat() {
    if (!config.enableHeartbeat) return

    heartbeatTimer = window.setInterval(() => {
      if (socket.value && connectionStatus.value === 'connected') {
        socket.value.emit('ping', Date.now())
      }
    }, config.heartbeatInterval)

    // 监听心跳响应
    socket.value?.on('pong', (timestamp: number) => {
      ping.value = Date.now() - timestamp
      console.log(`WebSocket心跳延迟: ${ping.value}ms`)
    })
  }

  // 停止心跳
  function stopHeartbeat() {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 订阅房间数据更新
  function subscribeToRoom(roomId: string) {
    emit('subscribe:room', { roomId })
    console.log(`订阅房间数据更新: ${roomId}`)
  }

  // 取消订阅房间数据更新
  function unsubscribeFromRoom(roomId: string) {
    emit('unsubscribe:room', { roomId })
    console.log(`取消订阅房间数据更新: ${roomId}`)
  }

  // 加入房间（用于视频流）
  function joinRoom(roomId: string) {
    emit('join_room', { roomId })
    console.log(`加入房间视频流: ${roomId}`)
  }

  // 离开房间
  function leaveRoom(roomId: string) {
    emit('leave_room', { roomId })
    console.log(`离开房间视频流: ${roomId}`)
  }

  // 订阅系统状态更新
  function subscribeToSystemStatus() {
    emit('subscribe:system', {})
    console.log('订阅系统状态更新')
  }

  // 取消订阅系统状态更新
  function unsubscribeFromSystemStatus() {
    emit('unsubscribe:system', {})
    console.log('取消订阅系统状态更新')
  }

  // 请求历史数据
  function requestHistoryData(params: {
    roomId?: string
    startTime?: string
    endTime?: string
    limit?: number
  }) {
    emit('request:history', params)
    console.log('请求历史数据:', params)
  }

  // 发送设备控制命令
  function controlDevice(deviceId: string, command: {
    action: 'on' | 'off' | 'toggle'
    value?: boolean | number
  }) {
    emit('control:device', { deviceId, ...command })
    console.log(`控制设备 ${deviceId}:`, command)
  }

  // 获取连接统计信息
  function getConnectionStats() {
    return {
      status: connectionStatus.value,
      reconnectAttempts: reconnectAttempts.value,
      ping: ping.value,
      uptime: socket.value?.connected ? Date.now() : 0
    }
  }




  return {
    socket,
    connectionStatus,
    reconnectAttempts,
    ping,
    isConnected,
    connected,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    subscribeToRoom,
    unsubscribeFromRoom,
    subscribeToSystemStatus,
    unsubscribeFromSystemStatus,
    requestHistoryData,
    controlDevice,
    getConnectionStats,
  
  }
})