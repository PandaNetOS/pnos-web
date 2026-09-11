import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'pnos-settings'

interface PersistedSettings {
  theme: ThemeMode
  refreshInterval: number
  cpuAlertThreshold: number
  memoryAlertThreshold: number
  diskAlertThreshold: number
  autoUpdateApps: boolean
  hiddenApps: string[]
}

const defaults: PersistedSettings = {
  theme: 'light',
  refreshInterval: 5000,
  cpuAlertThreshold: 85,
  memoryAlertThreshold: 85,
  diskAlertThreshold: 75,
  autoUpdateApps: false,
  hiddenApps: [],
}

function load(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) }
    }
  } catch {
    // ignore
  }
  return { ...defaults }
}

function save(settings: PersistedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const persisted = ref<PersistedSettings>(load())

  const theme = ref<ThemeMode>(persisted.value.theme)
  const refreshInterval = ref(persisted.value.refreshInterval)
  const cpuAlertThreshold = ref(persisted.value.cpuAlertThreshold)
  const memoryAlertThreshold = ref(persisted.value.memoryAlertThreshold)
  const diskAlertThreshold = ref(persisted.value.diskAlertThreshold)
  const autoUpdateApps = ref(persisted.value.autoUpdateApps)
  const hiddenApps = ref<string[]>(persisted.value.hiddenApps ?? [])

  /** 应用开关：控制是否在侧栏展示（true=显示） */
  function toggleAppVisible(appId: string, visible: boolean) {
    const set = new Set(hiddenApps.value)
    if (visible) set.delete(appId)
    else set.add(appId)
    hiddenApps.value = Array.from(set)
  }

  function isAppVisible(appId: string): boolean {
    return !hiddenApps.value.includes(appId)
  }

  function applyTheme(mode: ThemeMode) {
    theme.value = mode
    document.documentElement.setAttribute('data-theme', mode)
  }

  function initTheme() {
    applyTheme(theme.value)
  }

  watch([theme, refreshInterval, cpuAlertThreshold, memoryAlertThreshold, diskAlertThreshold, autoUpdateApps, hiddenApps], () => {
    save({
      theme: theme.value,
      refreshInterval: refreshInterval.value,
      cpuAlertThreshold: cpuAlertThreshold.value,
      memoryAlertThreshold: memoryAlertThreshold.value,
      diskAlertThreshold: diskAlertThreshold.value,
      autoUpdateApps: autoUpdateApps.value,
      hiddenApps: hiddenApps.value,
    })
  })

  return {
    theme,
    refreshInterval,
    cpuAlertThreshold,
    memoryAlertThreshold,
    diskAlertThreshold,
    autoUpdateApps,
    hiddenApps,
    toggleAppVisible,
    isAppVisible,
    applyTheme,
    initTheme,
  }
})
