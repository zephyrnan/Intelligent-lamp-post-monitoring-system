# 智能灯杆监控系统 - 前端

基于 Vue 3 + TypeScript + Vite 的智能灯杆监控系统前端应用，提供实时监控、历史数据分析、报警管理和人员检测等功能。

## 项目简介

智能灯杆监控系统前端是一个现代化的 Web 应用，用于监控和管理多个智能灯杆的运行状态。系统提供实时数据展示、历史数据分析、报警管理、视频监控和人员检测等功能。

## 主要功能

### 1. 房间概览
- 实时显示所有房间的监控状态
- 房间卡片展示温度、湿度、空气质量等关键指标
- 状态可视化（正常/警告/错误）
- 快速导航到房间详情

### 2. 房间详情
- **实时监控数据**
  - 温度、湿度、烟雾浓度
  - 光照强度、电压、电流
  - 数据实时更新（WebSocket）

- **视频监控**
  - 实时视频流展示
  - WebSocket 视频传输
  - 连接状态监控

- **人员检测**
  - 一键触发人员检测
  - 显示检测到的人员数量
  - 保存检测记录（原始图片 + 检测结果）

- **设备控制**
  - 远程控制设备开关
  - 实时反馈控制状态

### 3. 报警管理
- **报警列表**
  - 支持多条件筛选（房间、类型、级别、状态、时间）
  - 分页展示报警记录
  - 报警级别可视化（低/中/高/严重）

- **报警操作**
  - 确认报警
  - 解决报警
  - 删除报警
  - 批量清除已解决报警

- **报警统计**
  - 实时统计各级别报警数量
  - 状态分布统计
  - 数据可视化展示

### 4. 历史数据
- **数据趋势图**
  - 环境数据趋势可视化（ECharts）
  - 支持多指标对比（温度、湿度、烟雾、光照）
  - 数据聚合（按小时/天/周）
  - 缩放和数据筛选

- **统计卡片**
  - 显示最高值、平均值、最低值
  - 图标化展示
  - 颜色标识

- **数据表格**
  - 详细的历史数据列表
  - 多条件筛选
  - 排序功能
  - 分页展示

### 5. 检测记录
- 人员检测历史记录
- 显示检测时间、房间、人员数量
- 查看原始图片和检测结果图片
- 删除检测记录

## 技术栈

### 核心框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 下一代前端构建工具

### UI 框架
- **Element Plus** - 基于 Vue 3 的组件库
- **Element Plus Icons** - 图标库
- **Sass** - CSS 预处理器

### 状态管理
- **Pinia** - Vue 3 官方推荐的状态管理库

### 数据可视化
- **ECharts** - 强大的数据可视化库
- **vue-echarts** - Vue 3 的 ECharts 组件

### 网络通信
- **Axios** - HTTP 客户端
- **Socket.IO Client** - WebSocket 实时通信

### 路由
- **Vue Router** - Vue.js 官方路由管理器

## 项目结构

```
room-monitor/
├── src/
│   ├── api/                    # API 接口
│   │   ├── alarmApi.ts        # 报警 API
│   │   ├── detectionApi.ts    # 检测 API
│   │   ├── historyApi.ts      # 历史数据 API
│   │   ├── realRoomApi.ts     # 房间实时数据 API
│   │   ├── roomApi.ts         # 房间 API
│   │   └── index.ts           # API 导出
│   ├── components/            # 组件
│   │   ├── charts/           # 图表组件
│   │   │   └── BaseChart.vue # 基础图表组件
│   │   ├── common/           # 通用组件
│   │   │   ├── DeviceControl.vue    # 设备控制
│   │   │   ├── RoomCard.vue         # 房间卡片
│   │   │   ├── StatusCard.vue       # 状态卡片
│   │   │   └── WebSocketVideoStream.vue  # 视频流
│   │   └── layout/           # 布局组件
│   │       └── AppLayout.vue # 应用布局
│   ├── stores/               # 状态管理
│   │   ├── modules/
│   │   │   ├── alarmStore.ts      # 报警状态
│   │   │   ├── historyStore.ts    # 历史数据状态
│   │   │   ├── roomStore.ts       # 房间状态
│   │   │   └── websocketStore.ts  # WebSocket 状态
│   │   └── index.ts          # Store 导出
│   ├── views/                # 页面视图
│   │   ├── AlarmList.vue     # 报警列表页
│   │   ├── DetectionHistory.vue  # 检测记录页
│   │   ├── HistoryData.vue   # 历史数据页
│   │   ├── RoomDetail.vue    # 房间详情页
│   │   └── RoomList.vue      # 房间列表页
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   ├── router/               # 路由配置
│   │   └── index.ts
│   ├── assets/               # 静态资源
│   │   ├── styles/          # 样式文件
│   │   └── images/          # 图片资源
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── public/                   # 公共静态资源
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目依赖
└── README.md               # 项目文档

```

## 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0 或 **pnpm**: >= 8.0.0

## 安装步骤

### 1. 克隆项目

```bash
cd room-monitor
```

### 2. 安装依赖

使用 npm:
```bash
npm install
```

或使用 yarn:
```bash
yarn install
```

或使用 pnpm:
```bash
pnpm install
```

### 3. 配置环境变量

根据需要修改 API 基础 URL（在 `src/api/*.ts` 文件中）:

```typescript
// src/api/alarmApi.ts
const API_BASE = 'http://localhost:3000'  // 修改为你的后端地址
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（默认端口）

## 可用脚本

```bash
# 开发模式
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 仅构建（不进行类型检查）
npm run build-only

# 预览生产构建
npm run preview

# 代码检查和自动修复
npm run lint
```

## 构建部署

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录下。

### 部署

构建完成后，将 `dist/` 目录下的文件部署到你的 Web 服务器即可。

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 代理
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 配置说明

### API 配置

在各个 API 文件中修改 `API_BASE` 常量：

```typescript
// src/api/alarmApi.ts
const API_BASE = 'http://localhost:3000'

// src/api/realRoomApi.ts
const REAL_API_BASE = 'http://localhost:3000'
```

### WebSocket 配置

在 `websocketStore.ts` 中配置 WebSocket 服务器地址：

```typescript
// src/stores/modules/websocketStore.ts
const SOCKET_URL = 'http://localhost:3000'
```

### 路由配置

在 `src/router/index.ts` 中配置应用路由：

```typescript
const routes = [
  { path: '/', component: RoomList },
  { path: '/room/:id', component: RoomDetail },
  { path: '/alarms', component: AlarmList },
  { path: '/history', component: HistoryData },
  { path: '/detection-history', component: DetectionHistory }
]
```

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建新的 Vue 组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/components/layout/AppLayout.vue` 中添加菜单项

### 添加新的 API

1. 在 `src/api/` 创建新的 API 文件
2. 定义 API 类和方法
3. 在 `src/api/index.ts` 中导出
4. 在组件或 store 中使用

### 添加新的状态管理

1. 在 `src/stores/modules/` 创建新的 store 文件
2. 使用 `defineStore` 定义 store
3. 在 `src/stores/index.ts` 中导出
4. 在组件中使用 store

### 样式规范

项目使用 Sass 预处理器，样式文件遵循以下规范：

- 使用 BEM 命名规范
- 使用 CSS 变量定义主题色
- 组件样式使用 scoped 限制作用域

### TypeScript 类型

所有类型定义在 `src/types/index.ts` 中，包括：

- `RoomInfo` - 房间信息
- `SensorData` - 传感器数据
- `Alarm` - 报警信息
- `HistoryData` - 历史数据
- `DetectionRecord` - 检测记录

## 常见问题

### 1. WebSocket 连接失败

**问题**: 页面无法连接到 WebSocket 服务器

**解决方案**:
- 检查后端服务是否正常运行
- 确认 WebSocket URL 配置正确
- 检查防火墙/代理设置

### 2. 图表不显示

**问题**: ECharts 图表不显示或显示异常

**解决方案**:
- 检查数据格式是否正确
- 确认 ECharts 组件已正确注册
- 查看浏览器控制台错误信息

### 3. 类型错误

**问题**: TypeScript 类型检查报错

**解决方案**:
```bash
# 运行类型检查
npm run type-check

# 查看详细错误信息
npx vue-tsc --noEmit
```

### 4. 构建失败

**问题**: 生产构建失败

**解决方案**:
- 清除 node_modules 重新安装
- 检查 Node.js 版本是否符合要求
- 查看构建日志中的详细错误信息

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 性能优化

### 已实现的优化

1. **代码分割**: 使用 Vue Router 的懒加载
2. **组件懒加载**: 大型组件按需加载
3. **资源优化**: Vite 自动进行资源压缩和优化
4. **数据缓存**: 使用 Pinia 缓存数据，减少 API 调用
5. **虚拟滚动**: 大数据列表使用虚拟滚动

### 性能建议

- 使用 Chrome DevTools 的 Lighthouse 进行性能分析
- 监控首屏加载时间（FCP、LCP）
- 优化图片资源（使用 WebP 格式）
- 启用 CDN 加速静态资源

## 安全性

### 实施的安全措施

1. **XSS 防护**: Vue 3 自动转义输出
2. **CSRF 防护**: 后端实现 CSRF token 验证
3. **输入验证**: 所有用户输入进行验证
4. **HTTPS**: 生产环境使用 HTTPS

### 安全建议

- 定期更新依赖包
- 使用环境变量存储敏感信息
- 实施内容安全策略（CSP）
- 启用 CORS 限制

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

## 更新日志

### v1.0.0 (2024-01-XX)

#### 新增功能
- ✨ 实时监控仪表盘
- ✨ 视频流监控
- ✨ 人员检测功能
- ✨ 报警管理系统
- ✨ 历史数据分析
- ✨ 设备远程控制

#### 优化改进
- 🎨 全新的 UI 设计
- ⚡ 性能优化
- 📱 响应式布局

#### 技术栈
- 升级到 Vue 3.5
- 使用 Vite 7.0
- 集成 ECharts 5.6
- 使用 Element Plus 2.11

---

**注**: 本文档持续更新中，如有疑问请查看项目 Issues 或联系开发团队。
