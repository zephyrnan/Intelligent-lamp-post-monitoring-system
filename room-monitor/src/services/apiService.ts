import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'
import { createApiError, errorHandler } from '@/utils/errorHandler'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        const apiError = createApiError('请求配置失败')
        errorHandler.addError(apiError)
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response

        if (!data.success) {
          const apiError = createApiError(data.message, data.code)
          errorHandler.addError(apiError)
          return Promise.reject(new Error(data.message))
        }

        return response
      },
      (error) => {
        let message = '网络请求失败'
        let code = 0

        if (error.response) {
          code = error.response.status
          message = error.response.data?.message || `HTTP ${code} 错误`
        } else if (error.request) {
          message = '网络连接失败，请检查网络设置'
        } else {
          message = error.message || '请求配置错误'
        }

        const apiError = createApiError(message, code)
        errorHandler.addError(apiError)

        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, { params })
    return response.data.data
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data)
    return response.data.data
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data)
    return response.data.data
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url)
    return response.data.data
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data)
    return response.data.data
  }

  setAuthToken(token: string) {
    localStorage.setItem('access_token', token)
  }

  clearAuthToken() {
    localStorage.removeItem('access_token')
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token')
  }
}

export const apiService = new ApiService()
export default apiService