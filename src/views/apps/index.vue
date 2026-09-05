<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="color: #e6edf3; margin: 0; font-size: 20px">已安装应用</h2>
      <n-button @click="fetchApps" size="small">刷新</n-button>
    </div>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-gi v-for="app in apps" :key="app.id">
        <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: #21262d; display: flex; align-items: center; justify-content: center; font-size: 20px">
              📦
            </div>
            <div style="flex: 1">
              <div style="color: #e6edf3; font-weight: 600; font-size: 14px">{{ app.name }}</div>
              <div style="color: #8b949e; font-size: 11px">v{{ app.version }}</div>
            </div>
            <n-tag :type="statusType(app.status)" size="small" :bordered="false">
              {{ statusText(app.status) }}
            </n-tag>
          </div>
          <div style="color: #8b949e; font-size: 12px; margin-bottom: 12px; min-height: 32px">
            {{ app.id }} · 127.0.0.1:{{ app.port }}
          </div>
          <div style="display: flex; gap: 8px">
            <n-button size="small" type="primary" ghost @click="openApp(app)" :disabled="app.status !== 'running'">
              打开
            </n-button>
            <n-button size="small" @click="toggleApp(app)" :loading="loadingId === app.id">
              {{ app.status === 'running' ? '停止' : '启动' }}
            </n-button>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-empty v-if="apps.length === 0" description="暂无已安装应用" style="margin-top: 60px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRegisteredApps, startApp, stopApp } from '@/api'
import { useMessage } from 'naive-ui'

const message = useMessage()
const apps = ref<any[]>([])
const loadingId = ref<string | null>(null)

async function fetchApps() {
  try {
    const res: any = await getRegisteredApps()
    apps.value = res.data || []
  } catch (e) {
    console.error('获取应用列表失败', e)
  }
}

function statusType(status: string) {
  switch (status) {
    case 'running': return 'success'
    case 'stopped': return 'default'
    case 'error': return 'error'
    case 'installing': return 'warning'
    default: return 'default'
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '异常',
    installing: '安装中',
    not_installed: '未安装',
  }
  return map[status] || status
}

function openApp(app: any) {
  window.open(`/app/${app.id}/`, '_blank')
}

async function toggleApp(app: any) {
  loadingId.value = app.id
  try {
    if (app.status === 'running') {
      await stopApp(app.id)
      message.success('已停止')
    } else {
      await startApp(app.id)
      message.success('已启动')
    }
    setTimeout(fetchApps, 1000)
  } catch (e: any) {
    message.error(e.response?.data?.message || '操作失败')
  } finally {
    loadingId.value = null
  }
}

onMounted(() => {
  fetchApps()
  setInterval(fetchApps, 5000)
})
</script>
