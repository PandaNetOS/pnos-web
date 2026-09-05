import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// ===== 系统 =====
export const getSystemInfo = () => api.get('/system/info')
export const getSystemStats = () => api.get('/system/stats')

// ===== 应用注册与发现 =====
export const getRegisteredApps = () => api.get('/apps')
export const getAppDetail = (id: string) => api.get(`/apps/${id}`)
export const discoverApp = (id: string) => api.get(`/apps/${id}/discover`)

// ===== 应用管理 =====
export const installApp = (id: string) => api.post(`/apps/${id}/install`)
export const startApp = (id: string) => api.post(`/apps/${id}/start`)
export const stopApp = (id: string) => api.post(`/apps/${id}/stop`)

// ===== 商店 =====
export const getStoreSources = () => api.get('/store/sources')
export const refreshStoreSource = (id: string) => api.post(`/store/sources/${id}/refresh`)
export const getStoreApps = () => api.get('/store/apps')
export const getStoreAppDetail = (id: string) => api.get(`/store/apps/${id}`)

export default api
