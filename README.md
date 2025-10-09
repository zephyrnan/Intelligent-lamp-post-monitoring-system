# 🏢 Room Monitor - 智能灯杆监控系统

基于 Vue 3 + TypeScript + Element Plus 开发的现代化企业级灯杆监控管理系统，集成真实硬件API，支持实时数据监测、智能报警、设备控制和WebSocket实时通信。

## ✨ 核心特性

### 🎯 实时监控

- **多维度传感器数据** - 温度、湿度、光照强度、电流、电压等全方位监测
- **实时数据更新** - WebSocket推送，毫秒级响应
- **设备状态监控** - 在线设备管理和状态追踪
- **可视化大屏** - ECharts图表展示历史趋势

### ⚠️ 智能报警

- **多级报警系统** - 警告级、严重级智能阈值检测
- **自动报警检测** - 基于传感器数据实时分析
- **报警管理** - 确认、解决、删除等完整生命周期
- **报警统计** - 实时统计和分析报表

### 🎮 设备控制

- **远程控制** - HTTP API控制灯光等设备开关
- **操作记录** - 完整的设备操作历史追踪
- **状态同步** - WebSocket实时设备状态推送

### 📊 数据分析

- **历史数据查询** - 按时间范围查询传感器历史
- **数据导出** - CSV格式导出历史数据
- **统计分析** - 平均值、最大值、最小值统计
- **检测记录** - 人员/物体检测记录管理

## 🚀 快速开始

### 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0
- **npm**: >=8.0.0
- **浏览器**: Chrome ≥88, Firefox ≥78, Safari ≥14

### 安装与运行

```bash
# 克隆项目
cd C:\Users\hhn\Desktop\vue3\jianshi\room-monitor

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 应用将在 http://localhost:5173 启动

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
src/
├── api/                        # API接口层
│   ├── index.ts               # 统一导出
│   ├── realRoomApi.ts         # 真实硬件API（核心）
│   ├── roomApi.ts             # 房间接口封装
│   ├── alarmApi.ts            # 报警接口
│   ├── historyApi.ts          # 历史数据接口
│   └── deviceApi.ts           # 设备控制接口
├── components/                # 组件库
│   ├── common/               # 通用组件
│   │   ├── StatusCard.vue    # 状态卡片
│   │   └── RoomCard.vue      # 房间卡片
│   ├── charts/               # 图表组件
│   │   └── BaseChart.vue     # 基础图表
│   ├── layout/               # 布局组件
│   │   └── AppLayout.vue     # 主布局
│   └── WebSocketVideoStream.vue  # 视频流组件
├── stores/                    # Pinia状态管理
│   ├── index.ts              # Store导出
│   └── modules/              # 模块化Store
│       ├── roomStore.ts      # 房间状态（含传感器数据）
│       ├── alarmStore.ts     # 报警状态
│       ├── historyStore.ts   # 历史数据状态
│       └── websocketStore.ts # WebSocket连接管理
├── types/                     # TypeScript类型定义
│   └── index.ts              # 统一类型接口
├── utils/                     # 工具函数
│   ├── errorHandler.ts       # 错误处理
│   └── detectionStorage.ts   # 检测记录存储
├── services/                  # 服务层
│   └── apiService.ts         # HTTP服务封装
├── views/                     # 页面视图
│   ├── RoomList.vue          # 房间列表
│   ├── RoomDetail.vue        # 房间详情
│   ├── AlarmList.vue         # 报警列表
│   ├── HistoryData.vue       # 历史数据
│   └── DetectionHistory.vue  # 检测记录
├── router/                    # 路由配置
│   └── index.ts
├── App.vue                    # 根组件
└── main.ts                    # 入口文件
```

## 🔌 API接口说明

### 硬件API接口

本系统直接对接真实硬件设备，**所有接口地址已预配置无需修改**：

#### HTTP API

```typescript
// 基础地址
const API_BASE = 'http://192.168.31.121:8032/api'

// 获取房间数据
GET /room/{roomId}          // roomId: 1, 2, 3
Response: {
  code: 200,
  msg: "success",
  room: {
    roomId: "1",
    temp: "25.5",      // 温度
    hum: "60.2",       // 湿度
    lux: "150.5",      // 光照强度
    sc: "12.3",        // 旁路电流
    sv: "220.1",       // 旁路电压
    bv: "2500.5",      // 总电压
    smoke: "10.2",     // 烟雾浓度
    warn: "0",         // 报警状态 0=正常 1=警告 2=严重
    control: "0",      // 控制状态
    date: "2025-10-09",
    time: "14:30:25"
  }
}

// 设备控制
POST /room/up?roomId={id}&control={0|1}
// control: 0=关闭, 1=开启
Response: {
  code: 200,
  msg: "success"
}
```

#### WebSocket接口

```typescript
// WebSocket地址
const WS_URL = 'ws://192.168.3.2:8032'

// 支持的事件
Events: {
  'room:update'        // 房间数据更新
  'alarm:new'          // 新报警
  'device:status'      // 设备状态变化
  'detection:result'   // 人员检测结果
  'video_frame'        // 视频帧数据
}
```

### 报警阈值配置

系统内置智能报警检测，阈值如下：

| 参数     | 警告级别 | 严重级别 |
| -------- | -------- | -------- |
| 温度     | >35°C    | >40°C    |
| 湿度     | >70%     | >85%     |
| 光照     | <100lux  | <50lux   |
| 旁路电流 | >50A     | >80A     |
| 旁路电压 | >250V    | >300V    |
| 总电压   | >2500V   | >3000V   |

## 🎯 核心功能详解

### 1. 房间监控

- **三房间支持** - 灯杆01、灯杆02、灯杆03
- **7维度数据** - 温度、湿度、光照、电流、电压、烟雾、水位
- **状态指示** - 正常(绿色)、警告(橙色)、严重(红色)、离线(灰色)
- **实时更新** - WebSocket推送，无需刷新

### 2. 报警系统

- **自动检测** - 基于阈值自动生成报警
- **报警类型** - temperature, hum, lux, sc, sv, bv, smoke, water
- **生命周期** - 活跃 → 已确认 → 已解决
- **历史记录** - 完整的报警历史追踪

### 3. 设备控制

- **灯光控制** - 远程开关灯光
- **操作日志** - 记录所有操作（时间、操作者、状态变化）
- **实时反馈** - 控制结果即时反馈

### 4. 历史数据

- **时间筛选** - 按日期范围查询
- **图表展示** - 多指标折线图
- **数据导出** - CSV格式导出
- **统计分析** - 平均值、最大值、最小值

### 5. 检测记录

- **本地存储** - 最多保存1000条记录
- **图像记录** - 原始图像和处理后图像
- **置信度** - 检测结果可信度
- **导入导出** - JSON格式导入导出

## 💻 技术栈

### 前端框架

- **Vue 3.5.18** - 渐进式JavaScript框架
- **TypeScript 5.8.0** - 类型安全的JavaScript超集
- **Vite 7.0.6** - 下一代前端构建工具

### UI框架

- **Element Plus 2.11.2** - 基于Vue 3的组件库
- **@element-plus/icons-vue 2.3.2** - Element Plus图标库

### 状态管理

- **Pinia 3.0.3** - Vue官方推荐的状态管理库
- **模块化设计** - roomStore, alarmStore, historyStore, websocketStore

### 数据可视化

- **ECharts 5.6.0** - 强大的图表库
- **Vue-ECharts 7.0.3** - Vue 3的ECharts封装

### 网络通信

- **Axios 1.12.2** - HTTP客户端
- **Socket.io-client 4.8.1** - WebSocket客户端

### 路由

- **Vue Router 4.5.1** - Vue官方路由

## 🎨 使用示例

### 获取房间数据

```typescript
import { useRoomStore } from '@/stores'

const roomStore = useRoomStore()

// 获取房间列表
await roomStore.fetchRooms()

// 获取房间详情
await roomStore.fetchRoomById('room01')

// 获取实时传感器数据
const sensorData = await roomStore.fetchRealtimeSensorData('room01')
console.log(sensorData.temperature, sensorData.hum, sensorData.lux)
```

### 设备控制

```typescript
import { deviceApi } from '@/api'

// 开启灯光
await deviceApi.controlDevice('valve_room01', true)

// 关闭灯光
await deviceApi.controlDevice('valve_room01', false)

// 查询操作历史
const history = await deviceApi.getDeviceOperationData('room01', 50)
```

### WebSocket连接

```typescript
import { useWebSocketStore } from '@/stores'

const wsStore = useWebSocketStore()

// 连接WebSocket
await wsStore.connect()

// 订阅房间更新
wsStore.subscribeToRoom('room01')

// 监听房间数据更新
wsStore.on('room:update', (data) => {
  console.log('房间数据更新:', data)
})

// 监听新报警
wsStore.on('alarm:new', (alarm) => {
  console.log('新报警:', alarm)
})
```

### 报警管理

```typescript
import { useAlarmStore } from '@/stores'

const alarmStore = useAlarmStore()

// 获取报警列表
await alarmStore.fetchAlarms({
  status: 'active',
  level: 'error'
})

// 确认报警
await alarmStore.acknowledgeAlarm(alarmId, 'admin')

// 解决报警
await alarmStore.resolveAlarm(alarmId)
```

## 🔧 开发指南

### 代码规范

- **TypeScript优先** - 所有新代码使用TypeScript
- **Composition API** - 使用Vue 3组合式API
- **模块化** - 按功能模块组织代码
- **类型定义** - 完整的接口和类型定义

### 添加新API

```typescript
// 1. 在 src/api/ 下创建新的API文件
export class NewApi {
  async getData() {
    return realRoomApi.getRooms() // 复用真实API
  }
}

// 2. 在 src/api/index.ts 中导出
export { NewApi } from './newApi'
```

### 添加新Store

```typescript
// 1. 在 src/stores/modules/ 下创建
export const useNewStore = defineStore('new', () => {
  const data = ref([])

  async function fetchData() {
    // 实现逻辑
  }

  return { data, fetchData }
})

// 2. 在 src/stores/index.ts 中导出
export { useNewStore } from './modules/newStore'
```

## 🚢 部署

### 构建生产版本

```bash
npm run build
```

构建完成后，`dist/` 目录包含所有静态文件，可直接部署到任何静态服务器。

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/room-monitor/dist;
        try_files $uri $uri/ /index.html;
    }

    # 代理API请求
    location /api/ {
        proxy_pass http://192.168.31.121:8032/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket代理
    location /socket.io/ {
        proxy_pass http://192.168.3.2:8032;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📝 版本历史

### v2.0.0 (2025-10-09)

- ✅ **完整重写** - 基于jianshi项目结构重构
- ✅ **真实API集成** - 对接硬件设备API
- ✅ **WebSocket支持** - Socket.io实时通信
- ✅ **模块化Store** - Pinia模块化状态管理
- ✅ **TypeScript完善** - 完整类型定义
- ✅ **智能报警** - 自动报警检测系统
- ✅ **设备控制** - 远程设备控制功能
- ✅ **检测存储** - 本地检测记录管理

## 📚 相关文档

- [重写总结文档](./REWRITE_SUMMARY.md) - 详细的重写过程和技术细节
- [API接口文档](./API接口文档.md) - 完整的API接口说明
- [Vue 3文档](https://vuejs.org/) - Vue 3官方文档
- [Element Plus文档](https://element-plus.org/) - Element Plus组件文档
- [Pinia文档](https://pinia.vuejs.org/) - Pinia状态管理文档

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

**🌟 项目亮点**

1. ✅ **真实硬件对接** - 直接对接物理设备，非模拟数据
2. ✅ **完整TypeScript** - 类型安全的开发体验
3. ✅ **模块化架构** - 清晰的代码组织结构
4. ✅ **实时通信** - WebSocket实时数据推送
5. ✅ **智能报警** - 自动检测多维度阈值
6. ✅ **设备控制** - 远程控制硬件设备
7. ✅ **数据持久化** - 本地存储检测记录
8. ✅ **现代UI** - Element Plus响应式界面

**📞 技术支持**: 查看 [REWRITE_SUMMARY.md](./REWRITE_SUMMARY.md) 获取详细技术文档
