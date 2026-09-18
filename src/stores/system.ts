import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemApi } from '@/api'
import { useSettingsStore } from '@/stores/settings'
import type { RuntimeConfig, SystemInfo, SystemStats } from '@/types'

/** 超过用户设定阈值多少个百分点后，告警从「注意」升级为「严重」 */
export const ALERT_DANGER_MARGIN = 10

export const useSystemStore = defineStore('system', () => {
  const settingsStore = useSettingsStore()
  const info = ref<SystemInfo | null>(null)
  const stats = ref<SystemStats | null>(null)
  const config = ref<RuntimeConfig | null>(null)
  /** 后端可达性：null=尚未探测成功过；false 时界面必须显示"未连接"，不得谎报运行正常 */
  const online = ref<boolean | null>(null)
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

  /**
   * 单项指标告警等级：达到用户在「设置 → 监控」里设定的阈值即告警（warning），
   * 再高 ALERT_DANGER_MARGIN 个百分点升级为「严重」（danger）。
   * 阈值下限保护：设置项被外部写入异常值时退回默认线，避免出现"永不告警"。
   */
  function metricLevel(value: number, threshold: number): 'healthy' | 'warning' | 'danger' {
    const warnAt = Number.isFinite(threshold) && threshold > 0 ? threshold : 85
    if (value >= Math.min(100, warnAt + ALERT_DANGER_MARGIN)) return 'danger'
    if (value >= warnAt) return 'warning'
    return 'healthy'
  }

  const cpuLevel = computed(() => metricLevel(cpuUsage.value, settingsStore.cpuAlertThreshold))
  const memoryLevel = computed(() => metricLevel(memoryUsage.value, settingsStore.memoryAlertThreshold))
  const storageLevel = computed(() => metricLevel(storageUsage.value, settingsStore.diskAlertThreshold))

  const healthLevel = computed<'healthy' | 'warning' | 'danger'>(() => {
    const levels = [cpuLevel.value, memoryLevel.value, storageLevel.value]
    if (levels.includes('danger')) return 'danger'
    if (levels.includes('warning')) return 'warning'
    return 'healthy'
  })

  /**
   * 侧栏页脚 / 顶栏 / 概览页共用的系统状态。
   * offline 优先于一切：后端拉不到数据时不能沿用旧值报"运行正常"。
   */
  const systemStatus = computed<'offline' | 'healthy' | 'warning' | 'danger'>(() =>
    online.value === false ? 'offline' : healthLevel.value,
  )

  const statusText = computed(() => {
    if (systemStatus.value === 'offline') return '后端未连接'
    if (systemStatus.value === 'danger') return '系统需要处理'
    if (systemStatus.value === 'warning') return '有事项需要留意'
    return '系统运行正常'
  })

  async function fetchInfo() {
    try {
      info.value = await systemApi.getInfo()
      online.value = true
    } catch (e) {
      console.error('获取系统信息失败', e)
      online.value = false
    }
  }

  async function fetchStats() {
    try {
      stats.value = await systemApi.getStats()
      online.value = true
    } catch (e) {
      console.error('获取系统状态失败', e)
      online.value = false
    }
  }

  /** 运行时配置（端口 / 反代前缀 / CORS），设置页展示真实生效值用 */
  async function fetchConfig() {
    try {
      config.value = await systemApi.getConfig()
    } catch (e) {
      console.error('获取运行时配置失败', e)
    }
  }

  async function refresh() {
    if (loading.value) return
    loading.value = true
    try {
      await Promise.all([fetchInfo(), fetchStats(), fetchConfig()])
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
    config,
    online,
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
    cpuLevel,
    memoryLevel,
    storageLevel,
    healthLevel,
    systemStatus,
    statusText,
    fetchInfo,
    fetchStats,
    fetchConfig,
    refresh,
    startPolling,
    stopPolling,
  }
})
