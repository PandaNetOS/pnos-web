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

// 系统
export const getSystemInfo = () => api.get('/system/info')
export const getSystemStats = () => api.get('/system/stats')

// 容器
export const getContainers = (all = true) => api.get(`/containers?all=${all}`)
export const getContainerDetail = (id: string) => api.get(`/containers/${id}`)
export const startContainer = (id: string) => api.post(`/containers/${id}/start`)
export const stopContainer = (id: string) => api.post(`/containers/${id}/stop`)
export const restartContainer = (id: string) => api.post(`/containers/${id}/restart`)
export const removeContainer = (id: string) => api.delete(`/containers/${id}`)
export const getContainerLogs = (id: string, tail = 100) =>
  api.get(`/containers/${id}/logs?tail=${tail}`)

// 商店
export const getStoreSources = () => api.get('/store/sources')
export const refreshStoreSource = (id: string) => api.post(`/store/sources/${id}/refresh`)
export const getStoreApps = () => api.get('/store/apps')
export const getStoreAppDetail = (id: string) => api.get(`/store/apps/${id}`)
export const installApp = (id: string) => api.post(`/store/apps/${id}/install`)
export const uninstallApp = (id: string) => api.post(`/store/apps/${id}/uninstall`)

export default api
