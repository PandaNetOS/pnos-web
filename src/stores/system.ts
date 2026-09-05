import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSystemInfo, getSystemStats } from '@/api'

export const useSystemStore = defineStore('system', () => {
  const rawInfo = ref<any>(null)
  const rawStats = ref<any>(null)
  const loading = ref(false)

  // 适配后端字段 → 前端期望结构
  const info = computed(() => {
    if (!rawInfo.value) return null
    return {
      ...rawInfo.value,
      name: rawInfo.value.hostname || 'pnos',
      version: rawInfo.value.pnos_version || rawInfo.value.version || 'v0.1.0',
    }
  })

  const stats = computed(() => {
    if (!rawStats.value) return null
    const memTotal = rawInfo.value?.memory_total || 0
    const memPct = Number(rawStats.value.memory_usage || 0)
    return {
      ...rawStats.value,
      cpu: {
        usage: rawStats.value.cpu_usage,
        cores: rawInfo.value?.cpu_cores || 8,
      },
      memory: {
        usage_percent: memPct,
        used: memTotal * memPct / 100,
        total: memTotal,
      },
      disks: (rawStats.value.disks || []).map((d: any) => ({
        ...d,
        total_space: d.total,
        available_space: d.available,
      })),
      uptime: rawInfo.value?.uptime || 0,
    }
  })

  async function fetchInfo() {
    try {
      const res: any = await getSystemInfo()
      rawInfo.value = res.data
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  }

  async function fetchStats() {
    try {
      const res: any = await getSystemStats()
      rawStats.value = res.data
    } catch (e) {
      console.error('获取系统状态失败', e)
    }
  }

  return { info, stats, loading, fetchInfo, fetchStats }
})
