<template>
  <div class="layout-container">
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-button
            v-if="showMenuToggle"
            class="menu-toggle"
            type="text"
            @click="toggleSidebar"
          >
            <el-icon :size="20"><Menu /></el-icon>
          </el-button>

          <div class="header-logo">
            <div class="logo-icon">
              <el-icon :size="32"><Monitor /></el-icon>
            </div>
            <div class="logo-text">
              <h1 class="header-title">{{ title }}</h1>
              <span class="header-subtitle">智能监控系统</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="header-status">
            <div class="status-badge" :class="{ 'status-badge--has-alerts': alarmCount > 0 }">
              <el-badge :value="alarmCount" :hidden="alarmCount === 0" type="danger" :max="99">
                <el-button type="text" @click="$router.push('/alarms')" class="notification-btn">
                  <el-icon :size="20"><Bell /></el-icon>
                </el-button>
              </el-badge>
            </div>
          </div>

          <div class="connection-status" :class="{ 'connected': connected }">
            <div class="connection-indicator">
              <div class="connection-dot"></div>
              <div class="connection-pulse"></div>
            </div>
            <span class="connection-text">{{ connected ? '已连接' : '未连接' }}</span>
          </div>

          <el-dropdown class="user-dropdown-wrapper" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="36" :src="userAvatar" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-info">
                <span class="username">{{ username }}</span>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <el-dropdown-item @click="$router.push('/profile')" class="dropdown-item">
                  <el-icon><User /></el-icon>
                  个人设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout" class="dropdown-item dropdown-item--danger">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside
          v-if="showSidebar"
          :width="sidebarWidth"
          class="layout-sidebar"
          :class="{ 'collapsed': sidebarCollapsed }"
        >
          <div class="sidebar-backdrop"></div>
          <nav class="sidebar-nav">
            <el-menu
              :default-active="currentRoute"
              mode="vertical"
              :collapse="sidebarCollapsed"
              @select="handleMenuSelect"
              class="sidebar-menu"
            >
              <el-menu-item
                v-for="item in menuItems"
                :key="item.path"
                :index="item.path"
                class="sidebar-menu-item"
              >
                <el-icon><component :is="item.icon" /></el-icon>
                <span class="menu-title">{{ item.title }}</span>
              </el-menu-item>
            </el-menu>
          </nav>
        </el-aside>

        <el-main class="layout-main">
          <div class="main-background"></div>
          <div class="main-content">
            <slot />
          </div>
        </el-main>
      </el-container>
    </el-container>

    <div
      v-if="showSidebar && !sidebarCollapsed"
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  Bell,
  User,
  ArrowDown,
  Monitor,
  HomeFilled,
  Warning,
  DataAnalysis,
  Camera,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAlarmStore, useWebSocketStore } from '@/stores'

interface Props {
  title?: string
  showSidebar?: boolean
  showMenuToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '机房监控',
  showSidebar: true,
  showMenuToggle: true
})

const route = useRoute()
const router = useRouter()
const alarmStore = useAlarmStore()
const wsStore = useWebSocketStore()

const sidebarCollapsed = ref(false)
const username = ref('用户')
const userAvatar = ref('')

const currentRoute = computed(() => route.path)
const alarmCount = computed(() => alarmStore.activeAlarms.length)
const connected = computed(() => wsStore.connected)

const sidebarWidth = computed(() => {
  return sidebarCollapsed.value ? '80px' : '240px'
})

const menuItems = [
  {
    path: '/',
    title: '房间概览',
    icon: HomeFilled
  },
  {
    path: '/alarms',
    title: '报警管理',
    icon: Warning
  },
  {
    path: '/history',
    title: '历史数据',
    icon: DataAnalysis
  },
  {
    path: '/detection-history',
    title: '检测记录',
    icon: Camera
  }
]

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleMenuSelect(path: string) {
  router.push(path)
  if (window.innerWidth <= 768) {
    sidebarCollapsed.value = true
  }
}

function handleLogout() {
  localStorage.removeItem('access_token')
  router.push('/login')
}
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.layout-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-xl);
  height: 72px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 100;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-lg);

    .menu-toggle {
      padding: var(--space-sm);
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);

      &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
        transform: scale(1.05);
      }
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: var(--space-md);

      .logo-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: var(--shadow-md);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: var(--radius-lg);
          background: var(--gradient-primary);
          z-index: -1;
          filter: blur(8px);
          opacity: 0.6;
        }
      }

      .logo-text {
        .header-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-lg);

    .header-status {
      .status-badge {
        position: relative;

        .notification-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
            transform: scale(1.05);
          }
        }

        &--has-alerts {
          .notification-btn {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%);
            color: var(--error-color);
            animation: pulse-notification 2s infinite;
          }
        }
      }
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;

      .connection-indicator {
        position: relative;
        width: 12px;
        height: 12px;

        .connection-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--error-color);
          transition: all 0.3s ease;
        }

        .connection-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--error-color);
          opacity: 0.6;
        }
      }

      .connection-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--error-color);
      }

      &.connected {
        .connection-dot {
          background: var(--success-color);
        }

        .connection-pulse {
          background: var(--success-color);
          animation: pulse-connection 2s infinite;
        }

        .connection-text {
          color: var(--success-color);
        }
      }
    }

    .user-dropdown-wrapper {
      .user-dropdown {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .user-avatar {
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: var(--shadow-sm);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .username {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.2;
          }
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
          color: var(--text-secondary);
        }

        &:hover .dropdown-arrow {
          transform: translateY(1px);
        }
      }
    }
  }
}

.main-container {
  height: calc(100vh - 72px);
  position: relative;
}

.layout-sidebar {
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
  z-index: 50;

  .sidebar-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  &.collapsed {
    width: 80px !important;
  }

  .sidebar-nav {
    height: 100%;
    position: relative;
    z-index: 1;
    padding: var(--space-lg) 0;

    .sidebar-menu {
      border-right: none;
      background: transparent;

      .sidebar-menu-item {
        margin: var(--space-xs) var(--space-md);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);

        .el-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .menu-title {
          font-weight: 600;
          font-size: 14px;
        }

        &:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          transform: translateX(4px);
        }

        &.is-active {
          background: var(--gradient-primary);
          color: white;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: white;
            border-radius: 0 2px 2px 0;
          }
        }
      }
    }
  }
}

.layout-main {
  background: transparent;
  padding: 0;
  overflow-y: auto;
  position: relative;

  .main-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.3;
    pointer-events: none;
  }

  .main-content {
    padding: var(--space-xl);
    min-height: 100%;
    position: relative;
    z-index: 1;
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 40;
  display: none;
}

@keyframes pulse-notification {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

@keyframes pulse-connection {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.2;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .layout-header {
    padding: 0 var(--space-lg);

    .header-left .header-logo {
      .logo-text .header-title {
        font-size: 20px;
      }
    }
  }

  .layout-main .main-content {
    padding: var(--space-lg);
  }
}

@media (max-width: 768px) {
  .layout-header {
    padding: 0 var(--space-md);
    height: 64px;

    .header-left {
      gap: var(--space-md);

      .header-logo {
        gap: var(--space-sm);

        .logo-icon {
          width: 40px;
          height: 40px;
        }

        .logo-text {
          .header-title {
            font-size: 18px;
          }

          .header-subtitle {
            display: none;
          }
        }
      }
    }

    .header-right {
      gap: var(--space-md);

      .connection-status .connection-text {
        display: none;
      }

      .user-dropdown-wrapper .user-dropdown {
        .user-info {
          display: none;
        }

        .dropdown-arrow {
          display: none;
        }
      }
    }
  }

  .main-container {
    height: calc(100vh - 64px);
  }

  .layout-sidebar {
    position: fixed;
    top: 64px;
    left: -240px;
    height: calc(100vh - 64px);
    z-index: 1000;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:not(.collapsed) {
      left: 0;
    }
  }

  .layout-main .main-content {
    padding: var(--space-md);
  }

  .mobile-overlay {
    display: block;
  }
}

@media (max-width: 480px) {
  .layout-header {
    .header-left .header-logo .logo-text .header-title {
      font-size: 16px;
    }

    .header-right {
      gap: var(--space-sm);

      .user-dropdown-wrapper .user-dropdown {
        padding: var(--space-xs);
      }
    }
  }
}

:deep(.el-menu-item) {
  border-radius: var(--radius-lg) !important;
  margin: var(--space-xs) var(--space-md) !important;
  color: var(--text-secondary) !important;
  transition: all 0.3s ease !important;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
    color: var(--text-primary) !important;
    transform: translateX(4px);
  }

  &.is-active {
    background: var(--gradient-primary) !important;
    color: white !important;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: white;
      border-radius: 0 2px 2px 0;
    }
  }
}

:deep(.el-dropdown-menu) {
  background: var(--bg-primary) !important;
  border: 1px solid var(--border-light) !important;
  box-shadow: var(--shadow-xl) !important;
  border-radius: var(--radius-lg) !important;
  backdrop-filter: blur(20px);
  overflow: hidden;

  .el-dropdown-menu__item {
    padding: var(--space-md) var(--space-lg) !important;
    color: var(--text-secondary) !important;
    display: flex !important;
    align-items: center !important;
    gap: var(--space-sm) !important;
    transition: all 0.3s ease !important;

    &:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
      color: var(--text-primary) !important;
    }

    &--danger:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%) !important;
      color: var(--error-color) !important;
    }
  }
}
</style>