import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemApi } from '@/api'
import type { SystemInfo, SystemStats } from '@/types'

export const useSystemStore = defineStore('system', () => {
  const info = ref<SystemInfo | null>(null)
  const stats = ref<SystemStats | null>(null)
  const loading = ref(false)
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  const serverName = computed(() => info.value?.hostname || 'pnos')
  const version = computed(() => info.value?.pnos_version || 'v0.1.0')
  const cpuUsage = computed(() => Math.round(stats.value?.cpu_usage ?? 0))
  const cpuCores = computed(() => info.value?.cpu_cores || 0)
  const memoryUsage = computed(() => Math.round(stats.value?.memory_usage ?? 0))
  const memoryUsed = computed(() => stats.value?.memory_used ?? 0)
  const memoryTotal = computed(() => stats.value?.memory_total ?? info.value?.memory_total ?? 0)
  const primaryDisk = computed(() => stats.value?.disks?.[0] ?? null)
  const storageUsage = computed(() => Math.round(primaryDisk.value?.usage ?? 0))
  const storageFree = computed(() => primaryDisk.value?.available ?? 0)
  const storageTotal = computed(() => primaryDisk.value?.total ?? 0)
  const load1 = computed(() => stats.value?.load_average?.[0] ?? 0)
  const load5 = computed(() => stats.value?.load_average?.[1] ?? 0)
  const uptime = computed(() => info.value?.uptime ?? 0)

  const uptimeText = computed(() => {
    const seconds = uptime.value
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days) return `${days} 天 ${hours} 小时`
    if (hours) return `${hours} 小时 ${minutes} 分钟`
    return `${minutes} 分钟`
  })

  const healthLevel = computed<'healthy' | 'warning' | 'danger'>(() => {
    if (storageUsage.value >= 90 || cpuUsage.value >= 95 || memoryUsage.value >= 95) return 'danger'
    if (storageUsage.value >= 75 || cpuUsage.value >= 85 || memoryUsage.value >= 85) return 'warning'
    return 'healthy'
  })

  async function fetchInfo() {
    try {
      info.value = await systemApi.getInfo()
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  }

  async function fetchStats() {
    try {
      stats.value = await systemApi.getStats()
    } catch (e) {
      console.error('获取系统状态失败', e)
    }
  }

  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      await Promise.all([fetchInfo(), fetchStats()])
    } finally {
      loading.value = false
    }
  }

  function startPolling(intervalMs = 5000) {
    stopPolling()
    pollingTimer = setInterval(fetchStats, intervalMs)
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  return {
    info,
    stats,
    loading,
    serverName,
    version,
    cpuUsage,
    cpuCores,
    memoryUsage,
    memoryUsed,
    memoryTotal,
    primaryDisk,
    storageUsage,
    storageFree,
    storageTotal,
    load1,
    load5,
    uptime,
    uptimeText,
    healthLevel,
    fetchInfo,
    fetchStats,
    refresh,
    startPolling,
    stopPolling,
  }
})
