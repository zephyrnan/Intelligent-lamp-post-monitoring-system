import type { App } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import type { GlobalError } from '@/types'

class ErrorHandler {
  private errors: GlobalError[] = []
  private maxErrors = 100

  addError(error: GlobalError) {
    this.errors.unshift(error)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
    this.handleError(error)
  }

  private handleError(error: GlobalError) {
    console.error('Global Error:', error)

    if (error.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return
    }

    if (error.code === 403) {
      ElMessage.error('权限不足')
      return
    }

    if (error.code === 404) {
      ElMessage.warning('请求的资源不存在')
      return
    }

    if (error.code === 500) {
      ElNotification.error({
        title: '服务器错误',
        message: '服务器内部错误，请稍后重试',
        duration: 5000
      })
      return
    }

    if (error.code && error.code >= 400) {
      ElMessage.error(error.message || '请求失败')
      return
    }

    ElNotification.error({
      title: '系统错误',
      message: error.message,
      duration: 5000
    })
  }

  getErrors(): GlobalError[] {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }
}

export const errorHandler = new ErrorHandler()

export function setupErrorHandler(app: App) {
  app.config.errorHandler = (err: any, instance: any, info: string) => {
    const error: GlobalError = {
      message: err?.message || String(err),
      timestamp: new Date(),
      source: info,
      stack: err?.stack
    }
    errorHandler.addError(error)
  }

  window.addEventListener('unhandledrejection', (event) => {
    const error: GlobalError = {
      message: event.reason?.message || String(event.reason),
      timestamp: new Date(),
      source: 'unhandledrejection',
      stack: event.reason?.stack
    }
    errorHandler.addError(error)
  })

  window.addEventListener('error', (event) => {
    const error: GlobalError = {
      message: event.message,
      timestamp: new Date(),
      source: `${event.filename}:${event.lineno}:${event.colno}`,
      stack: event.error?.stack
    }
    errorHandler.addError(error)
  })
}

export function createApiError(message: string, code?: number): GlobalError {
  return {
    message,
    code,
    timestamp: new Date(),
    source: 'api'
  }
}