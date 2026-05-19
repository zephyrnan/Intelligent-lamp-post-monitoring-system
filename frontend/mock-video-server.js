/**
 * 模拟视频流服务器
 * 技术栈：Node.js + Socket.io + Canvas
 * 功能：为每个房间生成动态视频帧（模拟监控画面）
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createCanvas } = require('canvas');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;

// 房间配置
const ROOMS = ['room01', 'room02', 'room03'];
const FPS = 15; // 每秒15帧
const WIDTH = 640;
const HEIGHT = 360;

// 存储每个房间的活跃连接
const roomConnections = new Map();

/**
 * 生成动态监控画面帧
 */
function generateFrame(roomId, frameCount) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 添加网格效果（模拟监控画面）
  ctx.strokeStyle = 'rgba(0, 150, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < WIDTH; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, HEIGHT);
    ctx.stroke();
  }
  for (let i = 0; i < HEIGHT; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(WIDTH, i);
    ctx.stroke();
  }

  // 添加扫描线效果
  const scanLineY = (frameCount * 3) % HEIGHT;
  const scanGradient = ctx.createLinearGradient(0, scanLineY - 30, 0, scanLineY + 30);
  scanGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
  scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
  scanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = scanGradient;
  ctx.fillRect(0, scanLineY - 30, WIDTH, 60);

  // 添加动态圆形（模拟移动物体）
  const circleX = (Math.sin(frameCount * 0.02) + 1) * (WIDTH / 2);
  const circleY = (Math.cos(frameCount * 0.03) + 1) * (HEIGHT / 2);

  ctx.beginPath();
  ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 100, 100, 1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 添加脉冲圆环
  const pulseRadius = 30 + Math.sin(frameCount * 0.1) * 10;
  ctx.beginPath();
  ctx.arc(circleX, circleY, pulseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 100, 100, ${0.5 - (pulseRadius - 30) / 50})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 房间标题
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(10, 10, 200, 40);
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(roomId.toUpperCase(), 20, 38);

  // 时间戳
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

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(WIDTH - 210, 10, 200, 40);
  ctx.fillStyle = '#00ff88';
  ctx.font = '16px monospace';
  ctx.fillText(timestamp, WIDTH - 200, 38);

  // 状态指示器
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(10, HEIGHT - 50, 150, 40);

  // REC 录制指示
  const recOpacity = Math.sin(frameCount * 0.2) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(255, 0, 0, ${recOpacity})`;
  ctx.beginPath();
  ctx.arc(30, HEIGHT - 30, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('REC', 50, HEIGHT - 23);

  // 帧计数
  ctx.fillStyle = '#00ff88';
  ctx.font = '14px monospace';
  ctx.fillText(`Frame: ${frameCount}`, WIDTH - 150, HEIGHT - 20);

  // 添加温度、湿度等传感器数据（模拟）
  const temp = (22 + Math.sin(frameCount * 0.01) * 3).toFixed(1);
  const hum = (55 + Math.cos(frameCount * 0.015) * 10).toFixed(1);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(WIDTH - 180, HEIGHT - 120, 170, 70);

  ctx.fillStyle = '#00ff88';
  ctx.font = '14px Arial';
  ctx.fillText(`🌡️ 温度: ${temp}°C`, WIDTH - 170, HEIGHT - 95);
  ctx.fillText(`💧 湿度: ${hum}%`, WIDTH - 170, HEIGHT - 70);

  // 转换为 base64
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * 为房间生成视频流
 */
function startRoomStream(roomId) {
  let frameCount = 0;
  const intervalMs = 1000 / FPS;

  const interval = setInterval(() => {
    const connections = roomConnections.get(roomId);

    // 如果没有连接，停止生成帧
    if (!connections || connections.size === 0) {
      clearInterval(interval);
      console.log(`📹 停止 ${roomId} 视频流（无活跃连接）`);
      return;
    }

    // 生成帧并发送给所有订阅该房间的客户端
    const frameData = generateFrame(roomId, frameCount);

    connections.forEach(socketId => {
      io.to(socketId).emit(`video_frame_${roomId}`, {
        roomId,
        frame: frameData
      });
    });

    frameCount++;
  }, intervalMs);

  console.log(`📹 开始 ${roomId} 视频流 (${FPS} FPS)`);
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`✅ 客户端连接: ${socket.id}`);

  // 加入房间
  socket.on('join_room', (roomId) => {
    console.log(`📥 ${socket.id} 加入房间: ${roomId}`);

    if (!roomConnections.has(roomId)) {
      roomConnections.set(roomId, new Set());
    }

    roomConnections.get(roomId).add(socket.id);

    // 如果这是第一个连接，启动视频流
    if (roomConnections.get(roomId).size === 1) {
      startRoomStream(roomId);
    }
  });

  // 离开房间
  socket.on('leave_room', (roomId) => {
    console.log(`📤 ${socket.id} 离开房间: ${roomId}`);

    if (roomConnections.has(roomId)) {
      roomConnections.get(roomId).delete(socket.id);

      // 如果没有连接了，清理
      if (roomConnections.get(roomId).size === 0) {
        roomConnections.delete(roomId);
      }
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`❌ 客户端断开: ${socket.id}`);

    // 从所有房间移除该连接
    roomConnections.forEach((connections, roomId) => {
      connections.delete(socket.id);
      if (connections.size === 0) {
        roomConnections.delete(roomId);
      }
    });
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎥 模拟视频流服务器已启动            ║
╚════════════════════════════════════════╝

📡 服务地址: http://localhost:${PORT}
🎬 帧率: ${FPS} FPS
📐 分辨率: ${WIDTH}x${HEIGHT}
🏠 可用房间: ${ROOMS.join(', ')}

等待客户端连接...
  `);
});
