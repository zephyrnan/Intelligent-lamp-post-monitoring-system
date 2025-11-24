<template>
  <div class="ws-video">
    <div class="ws-video__header">
      <h3>{{ title }}</h3>
      <el-tag size="small" :type="connected ? 'success' : 'info'">{{ connected ? '已连接' : '未连接' }}</el-tag>
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
const connected = ws.connected

function drawFrameFromBase64(base64: string) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const image = new Image()
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // cover style draw
    const ratio = Math.min(canvas.width / image.width, canvas.height / image.height)
    const drawWidth = image.width * ratio
    const drawHeight = image.height * ratio
    const dx = (canvas.width - drawWidth) / 2
    const dy = (canvas.height - drawHeight) / 2
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
  }
  image.src = base64
}

const handler = (data: { roomId: string; frame: string }) => {
  if (data.roomId === props.roomId) {
    drawFrameFromBase64(data.frame)
  }
}

onMounted(() => {
  ws.connect()
  ws.on(`video_frame_${props.roomId}`, handler)
  ws.joinRoom(props.roomId)
})

onUnmounted(() => {
  ws.off(`video_frame_${props.roomId}`, handler)
  ws.leaveRoom(props.roomId)
})

watch(() => props.roomId, (newId, oldId) => {
  if (oldId) ws.off(`video_frame_${oldId}`, handler)
  ws.on(`video_frame_${newId}`, handler)
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


