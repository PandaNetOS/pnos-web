import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { componentsApi } from '@/api'
import type { ComponentInfo, ComponentType, ComponentStatus } from '@/types'

export const useComponentsStore = defineStore('components', () => {
  const list = ref<ComponentInfo[]>([])
  const loading = ref(false)
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  const apps = computed(() => list.value.filter((c) => c.component_type === 'app'))
  const agents = computed(() => list.value.filter((c) => c.component_type === 'agent'))
  const running = computed(() => list.value.filter((c) => c.status === 'running'))
  const offline = computed(() => list.value.filter((c) => c.status === 'offline' || c.status === 'error' || c.status === 'stopped'))

  const count = computed(() => list.value.length)
  const runningCount = computed(() => running.value.length)
  const offlineCount = computed(() => offline.value.length)
  const appCount = computed(() => apps.value.length)
  const agentCount = computed(() => agents.value.length)

  function getById(id: string): ComponentInfo | undefined {
    return list.value.find((c) => c.id === id)
  }

  function isInstalled(appId: string): boolean {
    return list.value.some((c) => c.id === appId && c.component_type === 'app')
  }

  function getStatusText(status: ComponentStatus): string {
    const map: Record<ComponentStatus, string> = {
      running: '运行中',
      busy: '忙碌',
      offline: '离线',
      error: '错误',
      not_installed: '未安装',
      installing: '安装中',
      stopped: '已停止',
    }
    return map[status] || status
  }

  function getTypeText(type: ComponentType): string {
    const map: Record<ComponentType, string> = {
      app: '应用',
      agent: 'Agent',
      runtime: '运行时',
      pk: '主控台',
    }
    return map[type] || type
  }

  async function fetch() {
    if (loading.value) return
    loading.value = true
    try {
      list.value = await componentsApi.list()
    } catch (e) {
      console.error('获取组件列表失败', e)
    } finally {
      loading.value = false
    }
  }

  function startPolling(intervalMs = 5000) {
    stopPolling()
    pollingTimer = setInterval(fetch, intervalMs)
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  return {
    list,
    loading,
    apps,
    agents,
    running,
    offline,
    count,
    runningCount,
    offlineCount,
    appCount,
    agentCount,
    getById,
    isInstalled,
    getStatusText,
    getTypeText,
    fetch,
    startPolling,
    stopPolling,
  }
})
