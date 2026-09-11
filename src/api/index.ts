import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  ComponentInfo,
  InstallProgress,
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
  // 统一走 /installed/* 家族（install_service，带安装进度），不用旧版 /apps/* 兼容路径
  // 安装可能持续较久（下载+解压+试运行），放宽前端超时
  install: (id: string): Promise<string> => http.post(`/installed/${id}/install`, null, { timeout: 600000 }),
  start: (id: string): Promise<string> => http.post(`/installed/${id}/start`),
  stop: (id: string): Promise<string> => http.post(`/installed/${id}/stop`),
  /** 注销外部注册组件（pnos-comm 注册的，如 pk），从 runtime 注册表移除 */
  unregister: (id: string): Promise<boolean> => http.post('/apps/unregister', { id }),
}

// ===== 商店 API =====

export const storeApi = {
  listSources: (): Promise<StoreSource[]> => http.get('/store/sources'),
  refreshSource: (id: string): Promise<void> => http.post(`/store/sources/${id}/refresh`),
  listApps: (): Promise<StoreApp[]> => http.get('/store/apps'),
  getAppDetail: (id: string): Promise<StoreApp> => http.get(`/store/apps/${id}`),
  uninstall: (id: string, keepData = true): Promise<void> =>
    http.delete(`/installed/${id}/uninstall`, { params: { keep_data: keepData } }),
  listInstalled: (): Promise<Array<{ id: string }>> => http.get('/installed'),
  installProgress: (id: string): Promise<InstallProgress | null> =>
    http.get(`/installed/${id}/progress`),
}

export default http
