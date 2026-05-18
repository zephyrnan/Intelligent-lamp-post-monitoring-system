# 智能灯杆物联网监控平台

基于 Vue 3 + Node.js + MongoDB 的智能灯杆物联网监控平台，对接真实灯杆传感器（温湿度/烟雾/光照/电压电流），实现设备状态实时同步与故障告警可视化。

<img width="1323" height="668" alt="屏幕截图 2025-12-07 021828" src="https://github.com/user-attachments/assets/29960ffb-936d-4e0d-be72-daba5a7c7d79" />
<img width="1717" height="843" alt="屏幕截图 2025-12-07 014829" src="https://github.com/user-attachments/assets/7dd09450-8d66-469f-8a2f-5f29b0c51c42" />
<img width="480" height="388" alt="屏幕截图 2025-12-07 023404" src="https://github.com/user-attachments/assets/3f575735-10e5-4f31-8c13-ad2b0ade7905" />

## 技术栈

| 分类 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API 强类型开发 |
| 状态管理 | Pinia | 模块化 Store（websocket / room / alarm / history） |
| 数据可视化 | ECharts + vue-echarts | 折线图、柱状图、饼图、实时数据更新 |
| UI 组件 | Element Plus | 表单、表格、弹窗等 |
| 实时通信 | Socket.IO | WebSocket 双向通信、心跳检测、断线重连 |
| HTTP 请求 | Fetch API | 原生 fetch，统一错误处理 |
| 后端 | Express + Mongoose | RESTful API、数据持久化、设备控制 |
| 数据库 | MongoDB | 传感器数据、告警记录、检测记录存储 |
| 构建工具 | Vite | 开发热更新、生产构建、TypeScript 类型检查 |

## 功能特性

### 实时监控
- 8 路传感器数据采集：温度 / 湿度 / 烟雾 / 水位 / 光照 / 旁路电流 / 旁路电压 / 总电压
- WebSocket 双向通信，30s 心跳检测
- 指数退避断线重连（1s 起，2^n 递增，上限 30s，±20% 随机抖动）
- 实时视频监控（WebSocket 帧推送 + Canvas 渲染）

### 告警管理
- 四级分级告警：critical / high / medium / low
- 状态机流转：active → acknowledged → resolved（原子操作）
- 泛型传感器阈值配置，支持多类传感器
- 告警列表筛选、分页、确认、消警

### 数据分析
- 多指标历史趋势图（温度 / 湿度 / 烟雾等）
- DataZoom 滑动缩放与区间选择
- IntersectionObserver 懒加载 + markRaw 性能优化

### 设备控制
- 灯光远程开关控制
- 实时状态反馈
- 人员检测（YOLOv 系列 AI 目标检测）

## 快速开始

### 环境要求

- Node.js >= 18
- MongoDB >= 5.0

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

### 环境变量

**后端**（通过系统环境变量或 `.env` 文件配置）：

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MONGODB_URI` | 否 | `mongodb://localhost:27017/roomMonitor` | MongoDB 连接字符串 |
| `CORS_ORIGINS` | 否 | `http://localhost:5173,http://localhost:3000` | 允许的跨域来源（逗号分隔） |
| `PORT` | 否 | `3000` | 后端服务端口 |

**前端**（在 `frontend/.env` 中配置）：

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `VITE_API_BASE` | 否 | `http://localhost:3000` | 后端 API 地址 |

## 常用命令

### 前端

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | TypeScript 类型检查 + 生产构建 |
| `npm run type-check` | 仅 TypeScript 类型检查 |
| `npm run lint` | ESLint 代码检查并自动修复 |
| `npm run preview` | 预览生产构建产物 |

### 后端

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Express 服务（`node ./bin/www`） |

## 项目结构

```
Intelligent-lamp-post-monitoring-system/
├── frontend/
│   └── src/
│       ├── views/                 # 业务页面
│       │   ├── RoomList.vue       # 灯杆列表（首页）
│       │   ├── RoomDetail.vue     # 灯杆详情（实时数据 + 视频 + 设备控制）
│       │   ├── AlarmList.vue      # 告警管理
│       │   ├── HistoryData.vue    # 历史数据查询
│       │   ├── DetectionHistory.vue # 人员检测记录
│       │   └── NotFound.vue       # 404 页面
│       ├── components/
│       │   ├── charts/            # BaseChart 通用 ECharts 封装
│       │   ├── common/            # StatusCard / RoomCard / DeviceControl
│       │   ├── layout/            # AppLayout 布局（侧边栏 + 主内容区）
│       │   └── WebSocketVideoStream.vue # 实时视频流组件
│       ├── stores/modules/        # Pinia Store
│       │   ├── websocketStore.ts  # Socket.IO 连接管理
│       │   ├── roomStore.ts       # 灯杆数据
│       │   ├── alarmStore.ts      # 告警数据
│       │   └── historyStore.ts    # 历史数据
│       ├── api/                   # API 接口层（基于 fetch）
│       ├── types/                 # TypeScript 类型定义
│       ├── utils/                 # 工具函数
│       └── router/                # Vue Router 路由配置
├── backend/
│   ├── routes/                    # Express 路由
│   │   ├── rooms.js               # 灯杆数据 + 设备控制
│   │   ├── roomslist.js           # 历史数据查询（支持筛选分页）
│   │   ├── alarms.js              # 告警 CRUD + 统计
│   │   └── detections.js          # 人员检测记录
│   ├── module/                    # Mongoose 数据模型
│   ├── services/                  # 业务服务（视频流）
│   ├── scripts/                   # 数据库维护脚本
│   ├── bin/www                    # 服务入口（含优雅关闭）
│   └── app.js                     # Express 应用配置
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/rooms` | 获取所有灯杆数据 |
| GET | `/rooms/:id` | 获取单个灯杆详情 |
| GET/POST | `/rooms/:id/device/control` | 设备控制状态查询 / 控制 |
| GET | `/rooms/history` | 查询所有灯杆历史快照 |
| GET | `/history` | 查询历史传感器数据（支持筛选、分页、排序） |
| GET/POST | `/alarms` | 告警列表 / 创建告警 |
| GET | `/alarms/stats` | 告警统计（聚合管道） |
| PUT | `/alarms/:id/acknowledge` | 确认告警 |
| PUT | `/alarms/:id/resolve` | 解决告警 |
| DELETE | `/alarms/:id` | 删除告警 |
| DELETE | `/alarms/batch/resolved` | 批量清除已解决告警 |
| POST | `/detections/detect/:roomId` | 触发人员检测 |
| GET | `/detections` | 获取检测历史（支持分页） |
| GET | `/detections/:detectionId` | 获取单条检测记录 |
| DELETE | `/detections/:detectionId` | 删除检测记录 |

## 相关文档

- [`DESIGN.md`](DESIGN.md) — UI 设计规范（Vercel 极简风格）
- [`BUGS.md`](BUGS.md) — 已知问题与修复记录

## 许可证

MIT License
