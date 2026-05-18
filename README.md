# 注意事项

我是该项目前端开发人员，但由于后期设备限制，我自写后端，修改了前端，后端之前是SpringBoot和java写的，对接硬件和前端，如有错误，请指正


# 智能灯杆物联网监控平台

基于 Vue 3 + Node.js + MongoDB 的智能灯杆物联网监控平台，对接真实灯杆传感器（温湿度/烟雾/光照/电压电流），实现设备状态实时同步与故障告警可视化。

<img width="1323" height="668" alt="屏幕截图 2025-12-07 021828" src="https://github.com/user-attachments/assets/29960ffb-936d-4e0d-be72-daba5a7c7d79" />
<img width="1717" height="843" alt="屏幕截图 2025-12-07 014829" src="https://github.com/user-attachments/assets/7dd09450-8d66-469f-8a2f-5f29b0c51c42" />
<img width="480" height="388" alt="屏幕截图 2025-12-07 023404" src="https://github.com/user-attachments/assets/3f575735-10e5-4f31-8c13-ad2b0ade7905" />

## 项目简介

面向城市智慧照明场景的物联网监控平台，支持多灯杆节点的实时数据采集、WebSocket 双向通信、多级告警管理、历史趋势分析和远程设备控制。系统前后端分离，前端采用 Vue 3 + TypeScript 强类型开发，后端基于 Express + MongoDB 提供 RESTful API 与 Socket.IO 实时推送。

## 系统架构

```
Intelligent-lamp-post-monitoring-system/
├── frontend/              # Vue 3 前端应用
│   ├── src/
│   │   ├── views/             # 页面视图（6 个业务页面）
│   │   ├── components/        # 组件
│   │   │   ├── charts/        # 图表组件（BaseChart 通用封装）
│   │   │   ├── common/        # 通用业务组件
│   │   │   └── layout/        # 布局组件
│   │   ├── stores/            # Pinia 状态管理（4 个模块）
│   │   ├── api/               # API 接口层
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── router/            # 路由配置
│   │   └── utils/             # 工具函数
│   └── package.json
│
└── backend/               # Node.js 后端服务
    ├── routes/                # Express 路由
    ├── module/                # Mongoose 数据模型
    ├── services/              # 业务逻辑层
    ├── bin/www                # 启动入口
    └── app.js                 # 应用配置
```

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5 | 渐进式框架，Composition API |
| TypeScript | 5.8 | 强类型开发 |
| Pinia | 3.0 | 状态管理 |
| Vue Router | 4.5 | 客户端路由 |
| ECharts | 5.6 | 数据可视化 |
| vue-echarts | 7.0 | ECharts Vue 封装 |
| Socket.IO Client | 4.8 | WebSocket 实时通信 |
| Element Plus | 2.11 | UI 组件库 |
| Axios | 1.12 | HTTP 客户端 |
| Vite | 7.0 | 构建工具 |

### 后端

| 技术 | 用途 |
|------|------|
| Node.js | JavaScript 运行时 |
| Express | Web 框架 |
| MongoDB + Mongoose | 数据持久化 |
| Socket.IO | WebSocket 双向通信 |

## 核心功能

### 实时通信架构

基于 Socket.IO 构建双向长连接，实现灯杆传感器数据的实时推送。

- **30s 心跳检测**：定时发送 ping/pong 维持连接活性
- **指数退避重连**：断线后自动重连，延迟从 1s 起按 `2^n` 递增（上限 30s），附加 ±20% 随机抖动避免惊群效应，最大重连 10 次
- **事件驱动架构**：支持 `room:update`、`alarm:new`、`device:status`、`detection:result`、`video_frame` 等事件

```typescript
// 指数退避算法
function getReconnectDelay(attempt: number): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.round(delay + jitter)
}
```

### 告警状态管理

基于 Pinia 构建告警状态管理，实现告警全生命周期（触发/确认/消警）的标准化流转。

- **状态机约束**：严格限制状态转换路径 `active → acknowledged → resolved`，禁止跳过或回退
- **四级分级告警**：critical / high / medium / low
- **泛型传感器阈值配置**：使用 `SensorThreshold<T>` 泛型类型，配置驱动的阈值判断，支持 4 类传感器（温湿度/烟雾/水位）

```typescript
// 状态机转换表
const VALID_TRANSITIONS: Record<AlarmStatus, AlarmStatus[]> = {
  active: ['acknowledged'],
  acknowledged: ['resolved'],
  resolved: []
}

// 泛型阈值配置
interface SensorThreshold<T extends SensorType> {
  type: T
  label: string
  unit: string
  levels: Record<AlarmLevel, ThresholdRange>
}
```

### 数据可视化

基于 ECharts 封装 BaseChart 通用图表组件，支持折线图、柱状图、饼图三种类型切换与实时数据更新。

- **setOption 节流**：200ms 节流控制 ECharts 更新频率，减少高频数据下的无效渲染
- **IntersectionObserver 懒加载**：非可视区域图表延迟渲染，降低首屏渲染负担
- **DataZoom 交互浏览**：支持历史趋势数据的滑动缩放与区间选择
- **自定义 Tooltip**：带单位的多系列数据展示

### 设备监控

- **多灯杆节点管理**：灯杆列表、状态筛选、实时数据展示
- **8 路传感器数据**：温度/湿度/烟雾/水位/光照/旁路电流/旁路电压/总电压
- **远程设备控制**：继电器/电磁阀远程开关控制，实时状态反馈
- **实时视频监控**：WebSocket 帧推送 + Canvas 渲染

### 人员检测

- AI 目标检测（YOLOv 系列）
- 检测结果可视化（原始图/标注图对比）
- 检测历史记录管理

### 历史数据分析

- 多指标趋势图（温度/湿度/烟雾等）
- 数据聚合查询（按时间范围筛选）
- 统计报表与导出

## 工程化建设

- **TypeScript 严格模式**：`strict: true` + `noImplicitAny`，全链路类型安全
- **通用组件封装**：BaseChart、DeviceControl、StatusCard、RoomCard 等业务组件，统一 Props 类型规范
- **Pinia 模块化 Store**：websocketStore / roomStore / alarmStore / historyStore 四大模块，职责分离
- **API 层抽象**：支持 Mock 与真实 API 双数据源切换

## 快速开始

### 环境要求

- Node.js >= 20.19.0
- MongoDB >= 5.0
- npm / yarn / pnpm

### 安装与启动

```bash
# 克隆项目
git clone https://github.com/zephyrnan/Intelligent-lamp-post-monitoring-system.git
cd Intelligent-lamp-post-monitoring-system

# 启动后端（确保 MongoDB 已运行）
cd backend
npm install
npm start
# 后端运行于 http://localhost:3000

# 新开终端，启动前端
cd frontend
npm install
npm run dev
# 前端运行于 http://localhost:5173
```

### 配置说明

**后端 MongoDB 连接**（`backend/app.js`）：
```javascript
mongoose.connect('mongodb://localhost:27017/roomMonitor')
```

**前端 API 地址**（`frontend/src/api/`）：
```typescript
const API_BASE = 'http://localhost:3000'
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/rooms` | 获取所有灯杆数据 |
| GET | `/rooms/:id` | 获取单个灯杆详情 |
| GET | `/rooms/:id/device/control` | 获取设备控制状态 |
| POST | `/rooms/:id/device/control` | 远程设备控制 |
| GET | `/history` | 查询历史传感器数据 |
| GET | `/alarms` | 获取告警列表（支持筛选/分页） |
| POST | `/alarms` | 创建告警 |
| PUT | `/alarms/:id/acknowledge` | 确认告警 |
| PUT | `/alarms/:id/resolve` | 解决告警 |
| POST | `/detections/detect/:roomId` | 触发人员检测 |
| GET | `/detections` | 获取检测历史 |

## 近期改进（2026-05-18）

### Bug 修复

1. **RoomDetail.vue WebSocket 内存泄漏** — 组件卸载时未注销事件监听，导致回调函数残留在全局 store 上。修复：`onUnmounted` 中添加 `wsStore.off()` 调用。
2. **websocketStore eventListeners 响应式陷阱** — 使用 `ref<Map>()` 包装回调函数 Map，Vue 会为每个函数添加 Proxy 拦截器，造成无意义的性能开销。修复：改为普通 `new Map()`。
3. **BaseChart.vue ECharts 数据响应式性能黑洞** — 大量数据点（5000+）通过响应式传递给 ECharts，Vue 深度遍历添加 getter/setter 导致渲染卡顿。修复：使用 `markRaw()` 剥离响应式。
4. **RoomList.vue 定时器和 WS 监听泄漏** — 缺少 `onUnmounted`，搜索定时器和 WebSocket 监听器未清理。
5. **BaseChart.vue throttleTimer 泄漏** — 组件卸载时未清理节流定时器。
6. **websocketStore Socket 深度代理** — `ref<Socket>` 改为 `shallowRef<Socket>`，避免对 Socket.IO 实例进行无意义的深度 Proxy。
7. **websocketStore pong 监听器重复注册** — 每次重连都会添加新的 pong 监听器，移到 `connect()` 中只注册一次。
8. **websocketStore 重复 computed** — 移除重复的 `connected`，统一使用 `isConnected`。
9. **RoomDetail.vue 竞态条件** — 快速切换房间时异步响应乱序，添加 `fetchRequestId` 防护；watch 中添加 `leaveRoom(oldId)`。
10. **DeviceControl.vue 双重请求** — `watch(immediate: true)` 和 `onMounted` 各调用一次 `fetchDeviceStatus`，移除重复调用。
11. **WebSocketVideoStream.vue 房间泄漏** — watch 中未调用 `leaveRoom(oldId)`。

### UI 改造

- 全局设计风格从毛玻璃渐变风切换为 **Vercel 极简风格**（偏蓝色调）
- 移除所有 `backdrop-filter`、装饰性渐变叠加层、hover 浮动动画
- 统一使用 CSS 变量控制颜色和间距，详见 `DESIGN.md`

## 项目文档

| 文档 | 说明 |
|---|---|
| `README.md` | 项目说明与快速开始 |
| `DESIGN.md` | UI 设计规范（Vercel 极简风格） |
| `BUGS.md` | 已知问题与修复记录 |

## 许可证

MIT License
