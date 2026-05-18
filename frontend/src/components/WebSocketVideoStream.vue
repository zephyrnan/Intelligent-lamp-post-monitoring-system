<template>
  <div class="ws-video">
    <div class="ws-video__header">
      <h3>{{ title }}</h3>
      <div class="header-right">
        <slot name="actions"></slot>
        <el-tag size="small" :type="connected ? 'success' : 'info'">{{ connected ? '已连接' : '未连接' }}</el-tag>
      </div>
    </div>
    <div class="ws-video__canvas">
      <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useWebSocketStore } from '@/stores'

interface Props {
  roomId: string
  title?: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '实时监控',
  width: 640,
  height: 360
})

const ws = useWebSocketStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const connected = ws.isConnected
let ctx: CanvasRenderingContext2D | null = null
let alive = true
let pendingImage: HTMLImageElement | null = null

function drawFrameFromBase64(base64: string) {
  if (!alive) return
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  // 取消上一帧的加载，避免旧帧覆盖新帧
  if (pendingImage) {
    pendingImage.onload = null
    pendingImage = null
  }

  const image = new Image()
  pendingImage = image
  image.onload = () => {
    if (!alive || !ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const ratio = Math.min(canvas.width / image.width, canvas.height / image.height)
    const drawWidth = image.width * ratio
    const drawHeight = image.height * ratio
    const dx = (canvas.width - drawWidth) / 2
    const dy = (canvas.height - drawHeight) / 2
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
    pendingImage = null
  }
  image.src = base64
}

// 事件名是固定的 'video_frame'，handler 内部按 roomId 过滤
const handler = (data: { roomId: string; frame: string }) => {
  if (data.roomId === props.roomId) {
    drawFrameFromBase64(data.frame)
  }
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
  }
  if (!ws.isConnected) {
    ws.connect()
  }
  ws.on('video_frame', handler)
  ws.joinRoom(props.roomId)
})

onUnmounted(() => {
  alive = false
  if (pendingImage) {
    pendingImage.onload = null
    pendingImage = null
  }
  ws.off('video_frame', handler)
  ws.leaveRoom(props.roomId)
})

watch(() => props.roomId, (newId, oldId) => {
  if (oldId) {
    ws.leaveRoom(oldId)
  }
  ws.joinRoom(newId)
})
</script>

<style scoped>
.ws-video {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-lg);
}

.ws-video__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.ws-video__header h3 {
  margin: 0;
  font-size: 18px;
}

.ws-video__canvas {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
}

canvas { display: block; width: 100%; height: auto; }
</style>


