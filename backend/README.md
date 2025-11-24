# 智能灯杆监控系统 - 后端

基于 Node.js + Express + MongoDB 的智能灯杆监控系统后端服务，提供 RESTful API、WebSocket 实时通信和数据持久化功能。

## 项目简介

智能灯杆监控系统后端是一个高性能的服务端应用，负责数据存储、业务逻辑处理、实时数据推送和设备控制等功能。系统采用 MongoDB 数据库存储数据，使用 Socket.IO 实现实时双向通信。

## 主要功能

### 1. 房间数据管理
- **实时数据查询**
  - 获取单个房间实时数据
  - 获取所有房间列表
  - WebSocket 实时推送数据更新

- **历史数据管理**
  - 历史数据存储和查询
  - 支持多条件筛选（房间、时间范围、报警级别等）
  - 数据聚合和统计
  - 分页查询

### 2. 报警管理
- **报警记录**
  - 创建报警记录
  - 查询报警列表（支持筛选和分页）
  - 获取单个报警详情
  - 删除报警记录

- **报警处理**
  - 确认报警（acknowledge）
  - 解决报警（resolve）
  - 批量清除已解决报警

- **报警统计**
  - 按状态统计（active/acknowledged/resolved）
  - 按级别统计（low/medium/high/critical）
  - 总数统计

### 3. 人员检测
- **检测管理**
  - 触发人员检测
  - 保存检测结果（人数、图片、坐标等）
  - 查询检测历史
  - 删除检测记录

- **图片处理**
  - 存储原始图片
  - 存储检测结果图片
  - 检测框坐标信息

### 4. 设备控制
- **远程控制**
  - 查询设备控制状态
  - 更新设备控制状态（开/关）
  - 实时同步控制状态

### 5. WebSocket 实时通信
- **实时数据推送**
  - 传感器数据实时更新
  - 报警信息实时推送
  - 设备状态变化通知

- **视频流传输**
  - 实时视频流推送
  - 多房间视频流管理

## 技术栈

### 核心框架
- **Node.js** - JavaScript 运行时环境
- **Express** - Web 应用框架
- **Mongoose** - MongoDB ODM

### 实时通信
- **Socket.IO** - WebSocket 实时通信库

### 数据库
- **MongoDB** - NoSQL 文档数据库

### 中间件
- **morgan** - HTTP 请求日志
- **cookie-parser** - Cookie 解析
- **http-errors** - HTTP 错误处理

## 项目结构

```
roomMonitor/
├── bin/
│   └── www                    # 启动脚本
├── module/                    # 数据模型
│   ├── Alarm.js              # 报警模型
│   ├── PersonDetection.js    # 人员检测模型
│   └── RoomsList.js          # 房间历史数据模型
├── routes/                   # 路由
│   ├── rooms.js             # 房间实时数据路由
│   ├── roomslist.js         # 历史数据路由
│   ├── alarms.js            # 报警管理路由
│   └── detections.js        # 人员检测路由
├── views/                    # 视图模板（可选）
├── public/                   # 静态资源
├── app.js                    # 应用入口
├── package.json             # 项目依赖
└── README.md               # 项目文档
```

## 数据模型

### 1. Alarm (报警模型)

```javascript
{
  alarmId: String,           // 报警ID（唯一）
  roomId: String,            // 房间ID
  roomName: String,          // 房间名称
  type: String,              // 报警类型
  level: String,             // 报警级别
  message: String,           // 报警信息
  status: String,            // 状态（active/acknowledged/resolved）
  acknowledged: Boolean,     // 是否已确认
  acknowledgedBy: String,    // 确认人
  acknowledgedAt: Date,      // 确认时间
  resolvedAt: Date,         // 解决时间
  timestamp: Date,          // 创建时间
  date: String,             // 日期
  time: String              // 时间
}
```

### 2. PersonDetection (人员检测模型)

```javascript
{
  detectionId: String,       // 检测ID（唯一）
  roomId: String,            // 房间ID
  personCount: Number,       // 检测到的人数
  originalImage: String,     // 原始图片URL
  detectedImage: String,     // 检测结果图片URL
  detections: [{             // 检测详情
    class: Number,           // 类别
    confidence: Number,      // 置信度
    label: String,           // 标签
    bbox: {                  // 边界框
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  timestamp: Date,           // 检测时间
  date: String,              // 日期
  time: String               // 时间
}
```

### 3. RoomsList (历史数据模型)

```javascript
{
  roomId: String,            // 房间ID
  smoke: String,             // 烟雾浓度
  temp: String,              // 温度
  water: String,             // 水位
  warn: String,              // 报警级别
  hum: String,               // 湿度
  sc: String,                // 旁路电流
  lux: String,               // 光照强度
  sv: String,                // 旁路电压
  bv: String,                // 总电压
  control: String,           // 控制状态
  date: String,              // 日期
  time: String               // 时间
}
```

## API 文档

### 房间数据 API

#### 获取所有房间
```
GET /rooms
Response: { code: 200, msg: '查询成功', rooms: [...] }
```

#### 获取单个房间数据
```
GET /rooms/:roomId
Response: { code: 200, msg: '查询成功', room: {...} }
```

#### 获取设备控制状态
```
GET /rooms/:roomId/device/control
Response: { code: 200, msg: '查询成功', data: {...} }
```

#### 更新设备控制状态
```
POST /rooms/:roomId/device/control
Body: { control: '0' | '1' }
Response: { code: 200, msg: '控制成功', data: {...} }
```

### 历史数据 API

#### 查询历史数据
```
GET /history
Query Parameters:
  - roomId: 房间ID（可选）
  - startDate: 开始日期（可选）
  - endDate: 结束日期（可选）
  - warnLevel: 报警级别（可选）
  - minTemp/maxTemp: 温度范围（可选）
  - minHum/maxHum: 湿度范围（可选）
  - minSmoke/maxSmoke: 烟雾浓度范围（可选）
  - page: 页码（默认1）
  - pageSize: 每页数量（默认20）
  - sortBy: 排序字段（默认date）
  - sortOrder: 排序方向（asc/desc，默认desc）

Response: {
  code: 200,
  msg: '查询成功',
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    pageSize: 20,
    totalPages: 5
  }
}
```

### 报警管理 API

#### 获取报警列表
```
GET /alarms
Query Parameters:
  - roomId: 房间ID（可选）
  - type: 报警类型（可选）
  - level: 报警级别（可选）
  - status: 状态（可选）
  - startTime: 开始时间（可选）
  - endTime: 结束时间（可选）
  - page: 页码（默认1）
  - pageSize: 每页数量（默认20）

Response: {
  code: 200,
  msg: '查询成功',
  data: [...],
  pagination: {...}
}
```

#### 创建报警
```
POST /alarms
Body: {
  roomId: String,
  roomName: String,
  type: String,
  level: String,
  message: String
}
Response: { code: 200, msg: '报警创建成功', data: {...} }
```

#### 确认报警
```
PUT /alarms/:alarmId/acknowledge
Body: { acknowledgedBy: String }
Response: { code: 200, msg: '报警已确认', data: {...} }
```

#### 解决报警
```
PUT /alarms/:alarmId/resolve
Response: { code: 200, msg: '报警已解决', data: {...} }
```

#### 删除报警
```
DELETE /alarms/:alarmId
Response: { code: 200, msg: '删除成功' }
```

#### 批量删除已解决报警
```
DELETE /alarms/batch/resolved
Response: {
  code: 200,
  msg: '成功删除X条已解决的报警',
  data: { deletedCount: X }
}
```

#### 获取报警统计
```
GET /alarms/stats
Response: {
  code: 200,
  msg: '查询成功',
  data: {
    total: 100,
    active: 20,
    acknowledged: 30,
    resolved: 50,
    byLevel: {
      critical: 10,
      high: 20,
      medium: 30,
      low: 40
    }
  }
}
```

### 人员检测 API

#### 触发检测
```
POST /detections/detect/:roomId
Body: {
  originalImage: String,     // 原始图片URL
  detectedImage: String,     // 检测图片URL
  personCount: Number,       // 人数
  detections: [...]         // 检测详情
}
Response: {
  code: 200,
  msg: '检测完成',
  data: {...}
}
```

#### 获取检测历史
```
GET /detections
Query Parameters:
  - roomId: 房间ID（可选）
  - startTime: 开始时间（可选）
  - endTime: 结束时间（可选）
  - page: 页码（默认1）
  - pageSize: 每页数量（默认20）

Response: {
  code: 200,
  msg: '查询成功',
  data: [...],
  pagination: {...}
}
```

#### 删除检测记录
```
DELETE /detections/:detectionId
Response: { code: 200, msg: '删除成功' }
```

## 环境要求

- **Node.js**: >= 16.0.0
- **MongoDB**: >= 5.0.0
- **npm**: >= 8.0.0

## 安装步骤

### 1. 安装 MongoDB

#### Windows
下载并安装 MongoDB: https://www.mongodb.com/try/download/community

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. 安装项目依赖

```bash
cd roomMonitor
npm install
```

### 3. 配置数据库

修改 `app.js` 中的数据库连接字符串：

```javascript
mongoose.connect('mongodb://localhost:27017/roomMonitor')
```

### 4. 启动服务

```bash
npm start
```

服务将在 `http://localhost:3000` 启动

## 开发模式

推荐使用 nodemon 进行开发：

```bash
# 全局安装 nodemon
npm install -g nodemon

# 使用 nodemon 启动
nodemon ./bin/www
```

## 配置说明

### 端口配置

在 `bin/www` 文件中修改端口：

```javascript
var port = normalizePort(process.env.PORT || '3000');
```

### CORS 配置

在 `app.js` 中配置跨域：

```javascript
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### MongoDB 索引优化

数据模型中已配置索引以提高查询性能：

```javascript
// Alarm 模型索引
AlarmSchema.index({ roomId: 1, timestamp: -1 });
AlarmSchema.index({ alarmId: 1 });
AlarmSchema.index({ status: 1 });
AlarmSchema.index({ level: 1 });

// PersonDetection 模型索引
PersonDetectionSchema.index({ roomId: 1, timestamp: -1 });
PersonDetectionSchema.index({ detectionId: 1 });
```

## WebSocket 事件

### 客户端监听事件

```javascript
// 连接成功
socket.on('connect', () => {})

// 房间数据更新
socket.on('roomData', (data) => {})

// 视频流数据
socket.on('videoFrame', (frame) => {})

// 报警推送
socket.on('newAlarm', (alarm) => {})

// 连接断开
socket.on('disconnect', () => {})
```

### 服务端发送事件

```javascript
// 推送房间数据
io.emit('roomData', roomData)

// 推送视频帧
io.emit('videoFrame', frameData)

// 推送报警
io.emit('newAlarm', alarmData)
```

## 数据库操作

### 查询示例

```javascript
// 查询所有报警
const alarms = await Alarm.find({ status: 'active' })

// 分页查询
const alarms = await Alarm.find()
  .sort({ timestamp: -1 })
  .skip(skip)
  .limit(limit)

// 聚合查询
const stats = await Alarm.aggregate([
  { $group: { _id: '$level', count: { $sum: 1 } } }
])
```

### 更新示例

```javascript
// 更新单个文档
await Alarm.updateOne(
  { alarmId: 'xxx' },
  { $set: { status: 'resolved' } }
)

// 批量更新
await Alarm.updateMany(
  { status: 'active' },
  { $set: { acknowledged: true } }
)
```

### 删除示例

```javascript
// 删除单个文档
await Alarm.deleteOne({ alarmId: 'xxx' })

// 批量删除
await Alarm.deleteMany({ status: 'resolved' })
```

## 错误处理

### 统一错误处理

```javascript
app.use(function(err, req, res, next) {
  console.error('❌ 发生错误:', err.message);
  res.status(err.status || 500).json({
    code: err.status || 500,
    msg: '服务器内部错误',
    error: req.app.get('env') === 'development' ? err.message : {}
  });
});
```

### 常见错误码

- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 性能优化

### 数据库优化

1. **索引优化**: 为常用查询字段创建索引
2. **连接池**: MongoDB 默认使用连接池
3. **查询优化**: 使用投影（projection）减少数据传输
4. **聚合管道**: 使用聚合管道进行复杂查询

### 应用优化

1. **缓存**: 使用 Redis 缓存热点数据
2. **压缩**: 启用 gzip 压缩
3. **日志**: 生产环境使用文件日志
4. **集群**: 使用 PM2 实现多进程

## 部署

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start bin/www --name room-monitor

# 查看状态
pm2 status

# 查看日志
pm2 logs room-monitor

# 停止应用
pm2 stop room-monitor

# 重启应用
pm2 restart room-monitor
```

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/roomMonitor
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

运行：

```bash
docker-compose up -d
```

## 监控和日志

### 日志配置

使用 morgan 记录 HTTP 请求：

```javascript
app.use(logger('dev'));  // 开发环境
// 或
app.use(logger('combined'));  // 生产环境
```

### 健康检查

添加健康检查端点：

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

## 安全性

### 实施的安全措施

1. **CORS 配置**: 限制跨域访问
2. **输入验证**: 验证所有输入数据
3. **错误处理**: 避免泄露敏感信息
4. **MongoDB 注入防护**: 使用 Mongoose 参数化查询

### 安全建议

```javascript
// 使用 helmet 增强安全性
const helmet = require('helmet');
app.use(helmet());

// 限流
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// 请求体大小限制
app.use(express.json({ limit: '10mb' }));
```

## 测试

### 单元测试

使用 Jest 或 Mocha 进行测试：

```bash
# 安装测试依赖
npm install --save-dev jest supertest

# 运行测试
npm test
```

### API 测试

推荐使用 Postman 或 Insomnia 进行 API 测试。

## 常见问题

### 1. MongoDB 连接失败

**解决方案**:
- 确认 MongoDB 服务已启动
- 检查连接字符串是否正确
- 确认防火墙设置

### 2. 端口被占用

**解决方案**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### 3. CORS 错误

**解决方案**: 检查 CORS 配置，确保允许前端域名访问

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 更新日志

### v1.0.0

- ✨ 初始版本发布
- ✨ 实现房间数据管理
- ✨ 实现报警管理系统
- ✨ 实现人员检测功能
- ✨ 实现 WebSocket 实时通信
- ✨ 实现设备远程控制

---

**注**: 本文档持续更新中，如有疑问请查看项目 Issues 或联系开发团队。
