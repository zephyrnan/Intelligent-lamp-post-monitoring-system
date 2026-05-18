<template>
  <div class="device-control-section">
    <div class="section-header">
      <h2>设备控制</h2>
      <el-tag :type="deviceStatus === '1' ? 'success' : 'info'" size="large">
        {{ deviceStatus === '1' ? '已开启' : '已关闭' }}
      </el-tag>
    </div>

    <div class="device-list">
      <div class="device-item">
        <div class="device-info">
          <div class="device-icon" :class="{ active: deviceStatus === '1' }">
            <el-icon :size="32">
              <component :is="Sunny" />
            </el-icon>
          </div>
          <div class="device-details">
            <h3>灯光控制</h3>
            <p class="device-description">控制房间灯光的开关状态</p>
          </div>
        </div>

        <div class="device-control">
          <el-switch
            v-model="switchValue"
            :loading="loading"
            size="large"
            active-text="开启"
            inactive-text="关闭"
            @change="handleDeviceControl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Sunny } from '@element-plus/icons-vue'
import { realRoomApi } from '@/api'

interface Props {
  roomId: string
}

const props = defineProps<Props>()

const deviceStatus = ref<'0' | '1'>('0')
const loading = ref(false)

// 将字符串状态转换为布尔值供 el-switch 使用
const switchValue = computed({
  get: () => deviceStatus.value === '1',
  set: (val: boolean) => {
    deviceStatus.value = val ? '1' : '0'
  }
})

// 获取设备控制状态
async function fetchDeviceStatus() {
  try {
    const response = await realRoomApi.getDeviceControl(props.roomId)
    if (response.code === 200) {
      deviceStatus.value = response.data.control as '0' | '1'
    }
  } catch (error) {
    console.error('获取设备状态失败:', error)
    ElMessage.error('获取设备状态失败')
  }
}

// 处理设备控制
async function handleDeviceControl(value: boolean) {
  const newStatus = value ? '1' : '0'
  const previousStatus = deviceStatus.value
  loading.value = true

  try {
    const response = await realRoomApi.updateDeviceControl(props.roomId, newStatus)
    if (response.code === 200) {
      deviceStatus.value = newStatus
      ElMessage.success(`灯光已${value ? '开启' : '关闭'}`)
    } else {
      // 非 200 响应，恢复之前的状态
      deviceStatus.value = previousStatus
      ElMessage.error(response.message || '控制设备失败')
    }
  } catch (error: any) {
    console.error('控制设备失败:', error)
    ElMessage.error(error.message || '控制设备失败')
    deviceStatus.value = previousStatus
  } finally {
    loading.value = false
  }
}

// 监听 roomId 变化（immediate: true 替代 onMounted 中的重复调用）
watch(() => props.roomId, () => {
  fetchDeviceStatus()
}, { immediate: true })
</script>

<style scoped lang="scss">
.device-control-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .device-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .device-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      transition: all 0.3s ease;

      .device-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .device-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: var(--radius-lg);
          color: #2196f3;
          transition: all 0.3s ease;

          &.active {
            background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
            color: #f57f17;
            box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
          }
        }

        .device-details {
          h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .device-description {
            margin: 0;
            font-size: 14px;
            color: var(--text-tertiary);
          }
        }
      }

      .device-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .device-control-section {
    padding: 16px;

    .device-list {
      .device-item {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;

        .device-info {
          justify-content: flex-start;
        }

        .device-control {
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
