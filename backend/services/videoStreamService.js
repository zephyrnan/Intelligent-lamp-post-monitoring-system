/**
 * 视频流服务模块 - SVG 版本
 * 功能：使用 SVG 生成动态视频帧（无需 canvas 依赖）
 */

const FPS = 15; // 每秒15帧
const WIDTH = 640;
const HEIGHT = 360;
const RoomModel = require('../module/Rooms');

// 存储每个房间的流状态
const roomStreams = new Map();

/**
 * 生成 SVG 动态监控画面
 */
function generateSVGFrame(roomId, frameCount) {
  // 动态计算位置
  const circleX = (Math.sin(frameCount * 0.02) + 1) * (WIDTH / 2);
  const circleY = (Math.cos(frameCount * 0.03) + 1) * (HEIGHT / 2);
  const pulseRadius = 30 + Math.sin(frameCount * 0.1) * 10;
  const scanLineY = (frameCount * 3) % HEIGHT;
  const recOpacity = Math.sin(frameCount * 0.2) * 0.5 + 0.5;

  // 模拟传感器数据
  const temp = (22 + Math.sin(frameCount * 0.01) * 3).toFixed(1);
  const hum = (55 + Math.cos(frameCount * 0.015) * 10).toFixed(1);

  // 当前时间
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // 生成 SVG
  const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
    </linearGradient>

    <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0" />
      <stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>

  <!-- 网格线 -->
  ${Array.from({length: Math.floor(WIDTH/40)}, (_, i) =>
    `<line x1="${i*40}" y1="0" x2="${i*40}" y2="${HEIGHT}" stroke="rgba(0,150,255,0.1)" stroke-width="1"/>`
  ).join('\n  ')}
  ${Array.from({length: Math.floor(HEIGHT/40)}, (_, i) =>
    `<line x1="0" y1="${i*40}" x2="${WIDTH}" y2="${i*40}" stroke="rgba(0,150,255,0.1)" stroke-width="1"/>`
  ).join('\n  ')}

  <!-- 扫描线 -->
  <rect x="0" y="${scanLineY - 30}" width="${WIDTH}" height="60" fill="url(#scanGradient)"/>

  <!-- 移动物体 - 主圆 -->
  <circle cx="${circleX}" cy="${circleY}" r="20" fill="rgba(255,100,100,0.6)" stroke="rgba(255,100,100,1)" stroke-width="2"/>

  <!-- 脉冲圆环 -->
  <circle cx="${circleX}" cy="${circleY}" r="${pulseRadius}" fill="none" stroke="rgba(255,100,100,${0.5 - (pulseRadius - 30) / 50})" stroke-width="2"/>

  <!-- 房间标题背景 -->
  <rect x="10" y="10" width="200" height="40" fill="rgba(0,0,0,0.6)" rx="5"/>
  <text x="20" y="38" font-family="Arial" font-size="20" font-weight="bold" fill="#00ff88">
    灯杆${roomId.replace('room0', '')}
  </text>

  <!-- 时间戳背景 -->
  <rect x="${WIDTH - 210}" y="10" width="200" height="40" fill="rgba(0,0,0,0.6)" rx="5"/>
  <text x="${WIDTH - 200}" y="38" font-family="monospace" font-size="16" fill="#00ff88">
    ${timestamp}
  </text>

  <!-- 状态指示器背景 -->
  <rect x="10" y="${HEIGHT - 50}" width="150" height="40" fill="rgba(0,0,0,0.6)" rx="5"/>

  <!-- REC 录制指示 -->
  <circle cx="30" cy="${HEIGHT - 30}" r="8" fill="rgba(255,0,0,${recOpacity})"/>
  <text x="50" y="${HEIGHT - 23}" font-family="Arial" font-size="18" font-weight="bold" fill="#ff0000">
    REC
  </text>

  <!-- 帧计数 -->
  <text x="${WIDTH - 150}" y="${HEIGHT - 20}" font-family="monospace" font-size="14" fill="#00ff88">
    Frame: ${frameCount}
  </text>

  <!-- 传感器数据背景 -->
  <rect x="${WIDTH - 180}" y="${HEIGHT - 120}" width="170" height="70" fill="rgba(0,0,0,0.7)" rx="5"/>

  <!-- 传感器数据 -->
  <text x="${WIDTH - 170}" y="${HEIGHT - 95}" font-family="Arial" font-size="14" fill="#00ff88">
    🌡️ 温度: ${temp}°C
  </text>
  <text x="${WIDTH - 170}" y="${HEIGHT - 70}" font-family="Arial" font-size="14" fill="#00ff88">
    💧 湿度: ${hum}%
  </text>
</svg>
  `.trim();

  // 转换为 base64 (data:image/svg+xml)
  const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return base64;
}

/**
 * 启动房间视频流
 */
function startRoomStream(io, roomId) {
  if (roomStreams.has(roomId)) {
    return; // 已经在运行
  }

  let frameCount = 0;
  const intervalMs = 1000 / FPS;

  const interval = setInterval(() => {
    const streamData = roomStreams.get(roomId);

    if (!streamData || streamData.viewers === 0) {
      clearInterval(interval);
      roomStreams.delete(roomId);
      console.log(`📹 停止 ${roomId} 视频流（无观看者）`);
      return;
    }

    // 生成帧并发送
    const frameData = generateSVGFrame(roomId, frameCount);
    io.to(roomId).emit('video_frame', {
      roomId,
      frame: frameData
    });

    frameCount++;
  }, intervalMs);

  roomStreams.set(roomId, {
    interval,
    viewers: 0
  });

  console.log(`📹 启动 ${roomId} 视频流 (${FPS} FPS)`);
}

function getRoomStatus(warn) {
  if (String(warn) === '0') return 'normal';
  if (String(warn) === '1') return 'warning';
  return 'error';
}

async function emitRoomSnapshot(socket, roomId) {
  try {
    const roomNumber = String(roomId).replace('room0', '');
    const room = await RoomModel.findOne({ roomId: roomNumber }).lean();
    if (!room) return;

    const status = getRoomStatus(room.warn);
    socket.emit('room_data_update', {
      roomId,
      temperature: Number(room.temp) || 0,
      humidity: Number(room.hum) || 0,
      airQuality: Number(room.lux) || 0,
      timestamp: `${room.date}T${room.time}`
    });
    socket.emit('room_status_update', {
      roomId,
      status
    });
  } catch (error) {
    console.error(`发送 ${roomId} 房间快照失败:`, error.message);
  }
}

/**
 * 停止房间视频流
 */
function stopRoomStream(roomId) {
  const streamData = roomStreams.get(roomId);
  if (streamData) {
    clearInterval(streamData.interval);
    roomStreams.delete(roomId);
    console.log(`📹 停止 ${roomId} 视频流`);
  }
}

/**
 * 增加房间观看者
 */
function addViewer(io, roomId) {
  if (!roomStreams.has(roomId)) {
    startRoomStream(io, roomId);
  }

  const streamData = roomStreams.get(roomId);
  if (streamData) {
    streamData.viewers++;
    console.log(`👁️ ${roomId} 观看者数: ${streamData.viewers}`);
  }
}

/**
 * 移除房间观看者
 */
function removeViewer(roomId) {
  const streamData = roomStreams.get(roomId);
  if (streamData) {
    streamData.viewers--;
    console.log(`👁️ ${roomId} 观看者数: ${streamData.viewers}`);

    if (streamData.viewers <= 0) {
      stopRoomStream(roomId);
    }
  }
}

/**
 * 初始化 Socket.io 视频流
 */
function initVideoStream(io) {
  io.on('connection', (socket) => {
    console.log(`✅ 客户端连接: ${socket.id}`);

    // 加入房间
    socket.on('join_room', (data) => {
      const roomId = data.roomId;
      console.log(`📥 ${socket.id} 加入房间: ${roomId}`);
      socket.join(roomId);
      addViewer(io, roomId);
      emitRoomSnapshot(socket, roomId);
    });

    // 离开房间
    socket.on('leave_room', (data) => {
      const roomId = data.roomId;
      console.log(`📤 ${socket.id} 离开房间: ${roomId}`);
      socket.leave(roomId);
      removeViewer(roomId);
    });

    socket.on('ping', (timestamp) => {
      socket.emit('pong', timestamp);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`❌ 客户端断开: ${socket.id}`);

      // 从所有房间移除
      const rooms = Array.from(socket.rooms);
      rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          removeViewer(roomId);
        }
      });
    });
  });

  console.log(`
╔════════════════════════════════════════╗
║   🎥 视频流服务已启动 (SVG版本)       ║
╚════════════════════════════════════════╝
🎬 帧率: ${FPS} FPS
📐 分辨率: ${WIDTH}x${HEIGHT}
✨ 技术: SVG (无需原生依赖)
  `);
}

module.exports = {
  initVideoStream
};
