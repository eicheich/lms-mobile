import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { storage } from '@/utils/storage'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'

export interface ApiError extends Error {
  status?: number
  isModuleLocked?: boolean
  isNetworkError?: boolean
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Inject Bearer Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getSync('accessToken')
    if (token && !token.startsWith('demo_')) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Silent Refresh Token Rotation with Mutex Queue
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 403 Module Inactive Flag
    if (error.response?.status === 403) {
      const msg = error.response.data?.message || 'Modul tidak aktif untuk sekolah ini'
      const customErr: ApiError = new Error(msg)
      customErr.status = 403
      customErr.isModuleLocked = true
      return Promise.reject(customErr)
    }

    // 401 Silent Refresh Rotation
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = storage.getSync('refreshToken')
      if (!refreshToken || refreshToken.startsWith('demo_')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(apiClient(originalRequest))
            },
            reject
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        })

        const newAccessToken = data.tokens?.accessToken || data.accessToken
        const newRefreshToken = data.tokens?.refreshToken || data.refreshToken

        if (newAccessToken) await storage.set('accessToken', newAccessToken)
        if (newRefreshToken) await storage.set('refreshToken', newRefreshToken)

        processQueue(null, newAccessToken)

        if (originalRequest.headers && newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await storage.remove('accessToken')
        await storage.remove('refreshToken')
        await storage.remove('authUser')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const customErr: ApiError = new Error(
      error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan'
    )
    customErr.status = error.response?.status
    customErr.isNetworkError = !error.response
    return Promise.reject(customErr)
  }
)

export default apiClient
