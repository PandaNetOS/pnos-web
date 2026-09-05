import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSystemInfo, getSystemStats } from '@/api'

export const useSystemStore = defineStore('system', () => {
  const info = ref<any>(null)
  const stats = ref<any>(null)
  const loading = ref(false)

  async function fetchInfo() {
    try {
      const res: any = await getSystemInfo()
      info.value = res.data
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  }

  async function fetchStats() {
    try {
      const res: any = await getSystemStats()
      stats.value = res.data
    } catch (e) {
      console.error('获取系统状态失败', e)
    }
  }

  return { info, stats, loading, fetchInfo, fetchStats }
})
