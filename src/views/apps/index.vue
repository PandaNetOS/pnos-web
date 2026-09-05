<template>
  <div class="pnos-page">
    <PageHeader title="已安装应用" description="管理和控制已安装的应用">
      <template #actions>
        <n-button quaternary @click="fetchApps">刷新</n-button>
      </template>
    </PageHeader>

    <div v-if="apps.length" class="app-list pnos-surface">
      <div v-for="app in apps" :key="app.id" class="list-app">
        <div class="app-logo"><span>{{ (app.name || app.id || 'A').slice(0, 1).toUpperCase() }}</span></div>
        <div class="list-app-info">
          <strong>{{ app.name || app.id }}</strong>
          <span>{{ app.id }} · 127.0.0.1:{{ app.port }}</span>
        </div>
        <div class="status-badge" :class="app.status">
          <span class="status-dot" />
          {{ statusText(app.status) }}
        </div>
        <div class="list-actions">
          <n-button size="small" type="primary" secondary @click="openApp(app)" :disabled="app.status !== 'running'">打开</n-button>
          <n-button size="small" @click="toggleApp(app)" :loading="loadingId === app.id">
            {{ app.status === 'running' ? '停止' : '启动' }}
          </n-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">▦</div>
      <div class="empty-title">暂无已安装应用</div>
      <div class="empty-desc">从应用商店发现并安装应用</div>
      <n-button type="primary" @click="$router.push('/store')">浏览应用商店</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRegisteredApps, startApp, stopApp } from '@/api'
import { useMessage } from 'naive-ui'
import PageHeader from '@/components/PageHeader.vue'

const message = useMessage()
const apps = ref<any[]>([])
const loadingId = ref<string | null>(null)

async function fetchApps() {
  try {
    const res: any = await getRegisteredApps()
    apps.value = res.data || []
  } catch (e) {
    console.error('Failed to fetch apps', e)
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '错误',
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

<style scoped>
.app-list { overflow: hidden; }
.list-app {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-top: 1px solid #f0f1f4;
}
.list-app:first-child { border-top: 0; }
.list-app:hover { background: #fafbfc; }
.app-logo {
  width: 42px; height: 42px; border-radius: 12px;
  display: grid; place-items: center;
  background: linear-gradient(145deg,#edf4ff,#f4f0ff);
  color: #3478f6; font-size: 17px; font-weight: 750;
  flex-shrink: 0;
}
.list-app-info { flex: 1; min-width: 0; }
.list-app-info strong { display: block; font-size: 14px; }
.list-app-info span {
  display: block; color: var(--pnos-muted);
  margin-top: 3px; font-size: 11.5px;
  font-family: 'SF Mono', Monaco, monospace;
}
.status-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 8px;
  font-size: 11.5px; font-weight: 600; flex-shrink: 0;
}
.status-badge.running { background: var(--pnos-success-soft); color: var(--pnos-success); }
.status-badge.stopped { background: #f2f4f7; color: var(--pnos-muted); }
.status-badge.error { background: var(--pnos-danger-soft); color: var(--pnos-danger); }
.status-badge.installing { background: var(--pnos-warning-soft); color: var(--pnos-warning); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-badge.running .status-dot { box-shadow: 0 0 6px currentColor; }
.list-actions { display: flex; gap: 8px; flex-shrink: 0; }

.empty-state {
  text-align: center; padding: 80px 0;
}
.empty-icon { width:72px; height:72px; border-radius:20px; background:linear-gradient(145deg,#e8f0fe,#f0eafe); color:#3478f6; display:grid; place-items:center; font-size:32px; margin:0 auto 18px; box-shadow:0 4px 16px rgba(52,120,246,.15); }
.empty-title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
.empty-desc { font-size: 13px; color: var(--pnos-muted); margin-bottom: 20px; }
</style>
