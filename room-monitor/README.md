/0096YT\]
\\IK+-*/9
TYQ2YUIXCVBNM,./
基于 Vue 3 + TypeScript + Element Plus 重新架构设计的现代化企业级机房监控管理系统，采用先进的前端架构，支持实时数据监测、智能报警、设备控制和系统健康监控等功能。

## ✨ 主要改进

### 🔧 技术架构升级
- **TypeScript** - 完整的类型安全保障
- **组件化设计** - 高度可复用的UI组件系统
- **Pinia状态管理** - 现代化响应式状态管理
- **统一API层** - 封装的HTTP服务和错误处理
- **全局错误处理** - 完善的错误捕获和用户反馈
- **WebSocket集成** - 实时数据同步

### 🎨 用户体验提升
- **响应式设计** - 适配桌面端和移动端
- **现代化UI** - 基于Element Plus设计系统
- **加载状态** - 骨架屏和加载指示器
- **错误边界** - 友好的错误提示和恢复机制

## 🚀 快速开始

### 环境要求
- **Node.js**: ^20.19.0 || >=22.12.0
- **npm**: >=8.0.0
- **浏览器**: Chrome ≥88, Firefox ≥78, Safari ≥14

### 安装与运行

```bash
# 进入项目目录
cd room-monitor

# 安装依赖
npm install

# 启动开发环境
npm run dev
# 应用将在 http://localhost:5173 启动

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
src/
├── api/                    # API接口层
│   ├── roomApi.ts         # 房间相关接口
│   ├── alarmApi.ts        # 报警相关接口
│   ├── historyApi.ts      # 历史数据接口
│   └── index.ts           # 接口导出
├── components/            # 组件库
│   ├── common/           # 通用组件
│   │   ├── StatusCard.vue # 状态卡片
│   │   └── RoomCard.vue   # 房间卡片
│   ├── charts/           # 图表组件
│   │   └── BaseChart.vue  # 基础图表
│   └── layout/           # 布局组件
│       └── AppLayout.vue  # 主布局
├── composables/          # 组合式函数
├── services/             # 服务层
│   └── apiService.ts     # API服务
├── stores/               # 状态管理
│   ├── modules/          # 状态模块
│   │   ├── roomStore.ts   # 房间状态
│   │   ├── alarmStore.ts  # 报警状态
│   │   ├── historyStore.ts # 历史数据状态
│   │   └── websocketStore.ts # WebSocket连接
│   └── index.ts          # 状态导出
├── types/                # 类型定义
│   └── index.ts          # 类型接口
├── utils/                # 工具函数
│   └── errorHandler.ts   # 错误处理
├── views/                # 页面视图
│   ├── RoomList.vue      # 房间列表
│   ├── RoomDetail.vue    # 房间详情
│   ├── AlarmList.vue     # 报警列表
│   ├── HistoryData.vue   # 历史数据
│   └── DetectionHistory.vue # 检测记录
├── App.vue               # 根组件
└── main.ts               # 入口文件
```

## 🎯 核心功能

### 📊 房间监控
- **实时数据** - 温度、湿度、空气质量监测
- **状态管理** - 正常、警告、异常、离线状态
- **设备管理** - 设备列表和状态监控
- **响应式卡片** - 美观的数据展示

### ⚠️ 报警系统
- **多级报警** - 严重、高、中、低级别
- **状态流转** - 活跃→已确认→已解决
- **实时通知** - WebSocket推送报警信息
- **批量处理** - 支持批量确认和解决

### 📈 历史数据
- **趋势图表** - ECharts可视化展示
- **数据导出** - 支持CSV和Excel格式
- **时间筛选** - 灵活的时间范围查询
- **数据缩放** - 支持图表放大缩小

### 📷 检测记录
- **图像展示** - 检测到的异常图像
- **置信度** - 检测结果可信度展示
- **分类管理** - 运动、人员、物体检测
- **详情预览** - 大图预览功能

## 🔌 API接口

### 环境配置
```bash
# 开发环境 (.env.development)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3001

# 生产环境 (.env.production)
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://your-domain.com
```

### 接口规范
- **RESTful设计** - 标准的HTTP方法和状态码
- **统一响应格式** - `{code, message, data, success}`
- **错误处理** - 完善的错误码和错误信息
- **认证授权** - JWT Token认证

## 🎨 UI组件

### StatusCard 状态卡片
```vue
<StatusCard
  title="房间温度"
  :value="25.6"
  unit="°C"
  status="success"
  :trend="2.5"
  description="当前温度正常"
/>
```

### BaseChart 图表组件
```vue
<BaseChart
  title="环境数据趋势"
  type="line"
  :data="chartData"
  :height="400"
  :show-data-zoom="true"
/>
```

### RoomCard 房间卡片
```vue
<RoomCard
  :room="roomData"
  @click="handleRoomClick"
/>
```

## 📱 响应式设计

- **桌面端** (≥1024px) - 多列布局，完整功能
- **平板端** (768px-1023px) - 双列布局，适配触控
- **移动端** (≤767px) - 单列布局，手机优化

## 🔧 开发指南

### 代码规范
- **ESLint** - JavaScript/TypeScript代码检查
- **Prettier** - 代码格式化
- **Vue官方风格指南** - 组件和模板规范

### 组件开发
- **Composition API** - 优先使用组合式API
- **TypeScript** - 完整的类型定义
- **Props验证** - 使用interface定义Props
- **事件类型** - 定义Emits接口

### 状态管理
- **Pinia Store** - 模块化状态管理
- **响应式数据** - 使用ref/reactive
- **异步操作** - async/await处理
- **错误处理** - try/catch包装

## 🚢 部署说明

### 构建命令
```bash
# 生产构建
npm run build

# 构建后的文件在 dist/ 目录
```

### Nginx配置示例
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    root /var/www/room-monitor;
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://backend-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 📄 许可证

MIT License

---

**重构亮点总结：**
1. ✅ **完整TypeScript支持** - 类型安全的开发体验
2. ✅ **组件化架构** - 高度可复用的UI组件系统
3. ✅ **现代状态管理** - 基于Pinia的响应式状态管理
4. ✅ **统一API抽象** - 标准化的接口调用和错误处理
5. ✅ **全局错误处理** - 完善的错误捕获和用户反馈机制
6. ✅ **响应式设计** - 适配所有设备的现代UI界面
7. ✅ **开发体验优化** - 热重载、类型检查、代码提示
