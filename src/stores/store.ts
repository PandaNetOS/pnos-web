import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storeApi, appActionsApi } from '@/api'
import type { StoreApp, StoreSource } from '@/types'

export const useStoreStore = defineStore('store', () => {
  const apps = ref<StoreApp[]>([])
  const sources = ref<StoreSource[]>([])
  const loadingApps = ref(false)
  const loadingSources = ref(false)
  const installingId = ref<string | null>(null)
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  const categories = computed(() => {
    const set = new Set<string>()
    apps.value.forEach((app) => {
      app.categories?.forEach((c) => set.add(c))
    })
    return Array.from(set)
  })

  function searchApps(query: string, category?: string): StoreApp[] {
    const q = query.trim().toLowerCase()
    return apps.value.filter((app) => {
      const matchSearch = !q || app.name.toLowerCase().includes(q) || (app.description || '').toLowerCase().includes(q)
      const matchCategory = !category || category === 'all' || app.categories?.includes(category)
      return matchSearch && matchCategory
    })
  }

  async function fetchApps() {
    loadingApps.value = true
    try {
      apps.value = await storeApi.listApps()
    } catch (e) {
      console.error('获取商店应用失败', e)
    } finally {
      loadingApps.value = false
    }
  }

  async function fetchSources() {
    loadingSources.value = true
    try {
      sources.value = await storeApi.listSources()
    } catch (e) {
      console.error('获取商店源失败', e)
    } finally {
      loadingSources.value = false
    }
  }

  async function refreshSource(id: string) {
    try {
      await storeApi.refreshSource(id)
      // 刷新源后重新获取商店应用列表
      await fetchApps()
    } catch (e) {
      console.error('刷新商店源失败', e)
      throw e
    }
  }

  async function installApp(id: string) {
    installingId.value = id
    try {
      await appActionsApi.install(id)
    } finally {
      installingId.value = null
    }
  }

  async function startApp(id: string) {
    await appActionsApi.start(id)
  }

  async function stopApp(id: string) {
    await appActionsApi.stop(id)
  }

  function startPolling(intervalMs = 5000) {
    stopPolling()
    pollingTimer = setInterval(fetchApps, intervalMs)
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  return {
    apps,
    sources,
    loadingApps,
    loadingSources,
    installingId,
    categories,
    searchApps,
    fetchApps,
    fetchSources,
    refreshSource,
    installApp,
    startApp,
    stopApp,
    startPolling,
    stopPolling,
  }
})
