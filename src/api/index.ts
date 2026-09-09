import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  ComponentInfo,
  SystemInfo,
  SystemStats,
  StoreApp,
  StoreSource,
} from '@/types'

// ===== 传输层抽象（预留：后续替换为 pnos-sdk 通信能力时只改这里） =====

function createTransport(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
    timeout: 30000,
  })

  // 请求拦截器（预留 token 注入）
  instance.interceptors.request.use((config) => {
    return config
  })

  // 响应拦截器：解包 ApiResponse，统一错误处理
  instance.interceptors.response.use(
    (response) => {
      const body = response.data as ApiResponse<unknown>
      if (body && typeof body === 'object' && 'code' in body) {
        if (body.code === 0) {
          return body.data as any
        }
        return Promise.reject(new Error(body.message || '请求失败'))
      }
      return body as any
    },
    (error) => {
      const message = error?.response?.data?.message || error?.message || '网络错误'
      console.error('API Error:', message)
      return Promise.reject(new Error(message))
    },
  )

  return instance
}

const http = createTransport()

// ===== 系统 API =====

export const systemApi = {
  getInfo: (): Promise<SystemInfo> => http.get('/system/info'),
  getStats: (): Promise<SystemStats> => http.get('/system/stats'),
}

// ===== 组件 API（统一 /components 路径） =====

export const componentsApi = {
  list: (): Promise<ComponentInfo[]> => http.get('/components'),
  detail: (id: string): Promise<ComponentInfo> => http.get(`/components/${id}`),
}

// ===== 应用操作 API（商店应用的安装/启停） =====

export const appActionsApi = {
  install: (id: string): Promise<string> => http.post(`/apps/${id}/install`),
  start: (id: string): Promise<string> => http.post(`/apps/${id}/start`),
  stop: (id: string): Promise<string> => http.post(`/apps/${id}/stop`),
}

// ===== 商店 API =====

export const storeApi = {
  listSources: (): Promise<StoreSource[]> => http.get('/store/sources'),
  refreshSource: (id: string): Promise<void> => http.post(`/store/sources/${id}/refresh`),
  listApps: (): Promise<StoreApp[]> => http.get('/store/apps'),
  getAppDetail: (id: string): Promise<StoreApp> => http.get(`/store/apps/${id}`),
}

export default http
