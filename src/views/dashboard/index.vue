<template>
  <div class="overview-page pnos-page">
    <header class="overview-header">
      <div>
        <div class="pnos-eyebrow">系统概览</div>
        <h1 class="pnos-page-title">{{ serverName }}</h1>
        <p class="pnos-page-description">这台服务器目前一切运行正常。</p>
      </div>
      <div class="overview-status" :class="healthLevel">
        <span class="status-orb" />
        <div>
          <strong>{{ healthLabel }}</strong>
          <span>已运行 {{ uptimeText }}</span>
        </div>
      </div>
    </header>

    <section class="health-line" :class="healthLevel" aria-live="polite">
      <span class="health-line-mark" aria-hidden="true"><span /></span>
      <div class="health-line-copy">
        <strong>{{ healthTitle }}</strong>
        <span>{{ healthDetail }}</span>
      </div>
      <n-button quaternary size="small" class="health-action" @click="refresh" :loading="refreshing">{{ refreshing ? '更新中' : '更新' }}</n-button>
    </section>

    <section class="overview-section resource-section">
      <div class="section-heading">
        <div>
          <h2>资源</h2>
          <p>过去一段时间的运行状态</p>
        </div>
        <span class="live-indicator" aria-label="资源数据正在实时更新"><span /> 实时</span>
      </div>

      <div class="resource-table">
        <article class="resource-row">
          <div class="resource-label">
            <span class="resource-name">CPU</span>
            <div><strong>{{ cpuUsage }}%</strong><span>{{ cpuCores }} 核</span></div>
          </div>
          <div class="resource-chart"><div ref="cpuChartRef" /></div>
          <div class="resource-value"><span>当前</span></div>
        </article>

        <article class="resource-row">
          <div class="resource-label">
            <span class="resource-name">Memory</span>
            <div><strong>{{ memoryUsage }}%</strong><span>{{ memoryDetail }}</span></div>
          </div>
          <div class="resource-chart"><div ref="memChartRef" /></div>
          <div class="resource-value"><span>当前</span></div>
        </article>

        <article class="resource-row">
          <div class="resource-label">
            <span class="resource-name">Storage</span>
            <div><strong>{{ storageUsage }}%</strong><span>{{ storageFree }} 可用 · {{ storageDetail }} 总计</span></div>
          </div>
          <div class="storage-meter"><span :style="{ width: `${storageUsage}%` }" /></div>
          <div class="resource-value"><span>已使用</span></div>
        </article>

        <article class="resource-row load-row">
          <div class="resource-label">
            <span class="resource-name">Load</span>
            <div><strong>{{ load1 }}</strong><span>1 分钟平均负载 · {{ load5 }} / 5 分钟</span></div>
          </div>
          <div class="load-track"><span :style="{ width: `${Math.min(100, Number(load1) * 20)}%` }" /></div>
          <div class="resource-value"><span>稳定</span></div>
        </article>
      </div>
    </section>

    <section class="overview-section apps-section">
      <div class="section-heading">
        <div>
          <h2>应用</h2>
          <p>{{ apps.length ? `${apps.length} 个已安装应用` : '还没有安装应用' }}</p>
        </div>
        <n-button text type="primary" @click="router.push('/store')">查看全部</n-button>
      </div>

      <div v-if="apps.length" class="app-list">
        <button v-for="app in apps" :key="app.name" class="app-item" type="button" @click="openApp(app)">
          <span class="app-icon" :class="app.tone"><span>{{ app.symbol }}</span></span>
          <span class="app-content">
            <strong>{{ app.name }}</strong>
            <span>{{ app.description }}</span>
          </span>
          <span class="app-state" :class="app.tone"><span class="status-dot" />{{ app.state }}</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">+</div>
        <strong>还没有安装应用</strong>
        <span>从应用商店开始，为这台服务器添加第一个服务。</span>
        <n-button type="primary" secondary @click="router.push('/store')">浏览应用商店</n-button>
      </div>
    </section>

    <section class="activity-grid">
      <div class="overview-section activity-section">
        <div class="section-heading">
          <div>
            <h2>最近活动</h2>
            <p>系统最近的变化</p>
          </div>
        </div>
        <div class="activity-list">
          <div v-for="item in activities" :key="item.title" class="activity-item">
            <span class="activity-icon" :class="item.tone">{{ item.icon }}</span>
            <div><strong>{{ item.title }}</strong><span>{{ item.time }}</span></div>
          </div>
        </div>
      </div>

      <div class="overview-section attention-section" :class="storageStatus.level">
        <div class="section-heading">
          <div>
            <h2>需要注意</h2>
            <p>只有真正需要处理的事项才会出现在这里</p>
          </div>
        </div>
        <div class="attention-content">
          <div class="attention-mark">{{ storageStatus.icon }}</div>
          <div class="attention-copy">
            <strong>{{ storageStatus.title }}</strong>
            <span>{{ storageFree }} 可用。{{ storageStatus.hint }}</span>
          </div>
          <n-button v-if="storageStatus.level !== 'ok'" text type="primary" @click="router.push('/settings')">管理</n-button>
          <span v-else class="attention-ok">目前不需要处理任何事项</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { getRegisteredApps } from '@/api'
import * as echarts from 'echarts'

const router = useRouter()
const systemStore = useSystemStore()
const cpuChartRef = ref<HTMLElement>()
const memChartRef = ref<HTMLElement>()
const registeredApps = ref<any[]>([])
const refreshing = ref(false)
let cpuChart: echarts.ECharts | null = null
let memChart: echarts.ECharts | null = null
let timer: ReturnType<typeof setInterval> | null = null
let resizeHandler: (() => void) | null = null

const cpuUsage = computed(() => Math.round(Number(systemStore.stats?.cpu_usage ?? systemStore.stats?.cpu?.usage ?? 0)))
const cpuCores = computed(() => systemStore.info?.cpu_cores || 8)
const memoryUsage = computed(() => Math.round(Number(systemStore.stats?.memory_usage ?? systemStore.stats?.memory?.usage_percent ?? 0)))
const memoryDetail = computed(() => {
  const total = systemStore.info?.memory_total || systemStore.stats?.memory?.total
  if (!total) return '—'
  return `${formatBytes(Number(systemStore.stats?.memory?.used ?? total * memoryUsage.value / 100))} / ${formatBytes(Number(total))}`
})
const storageSource = computed(() => systemStore.stats?.disks?.[0])
const storageUsage = computed(() => Math.round(Number(storageSource.value?.usage ?? 0)))
const storageDetail = computed(() => storageSource.value?.total ? formatBytes(Number(storageSource.value.total)) : '—')
const storageFree = computed(() => storageSource.value?.available ? formatBytes(Number(storageSource.value.available)) : '—')
const uptimeText = computed(() => {
  const uptime = Number(systemStore.info?.uptime || 0)
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  if (days) return `${days} 天 ${hours} 小时`
  if (hours) return `${hours} 小时 ${minutes} 分钟`
  return `${minutes} 分钟`
})
const load1 = computed(() => Number(systemStore.stats?.load_average?.[0] ?? 0).toFixed(2))
const load5 = computed(() => Number(systemStore.stats?.load_average?.[1] ?? 0).toFixed(2))
const serverName = computed(() => systemStore.info?.hostname || 'Panda Server')
const healthLevel = computed(() => {
  if (storageUsage.value >= 90 || cpuUsage.value >= 95 || memoryUsage.value >= 95) return 'danger'
  if (storageUsage.value >= 75 || cpuUsage.value >= 85 || memoryUsage.value >= 85) return 'warning'
  return 'healthy'
})
const healthLabel = computed(() => healthLevel.value === 'healthy' ? '运行正常' : healthLevel.value === 'warning' ? '需要注意' : '需要处理')
const healthTitle = computed(() => healthLevel.value === 'healthy' ? '一切运行正常' : healthLevel.value === 'warning' ? '服务器运行正常，但有事项需要留意' : '服务器需要你的关注')
const healthDetail = computed(() => healthLevel.value === 'healthy' ? `CPU ${cpuUsage.value}% · 内存 ${memoryUsage.value}% · 存储 ${storageUsage.value}%` : [storageUsage.value >= 75 ? `存储 ${storageUsage.value}%` : '', cpuUsage.value >= 85 ? `CPU ${cpuUsage.value}%` : '', memoryUsage.value >= 85 ? `内存 ${memoryUsage.value}%` : ''].filter(Boolean).join(' · '))

const apps = computed(() => registeredApps.value.slice(0, 5).map((item: any, index) => ({
  name: item.name || item.id || 'Application',
  description: item.port ? `端口 ${item.port}` : '服务器应用',
  state: normalizeState(item.status),
  symbol: (item.name || item.id || 'A').slice(0, 1).toUpperCase(),
  tone: stateTone(normalizeState(item.status)),
  raw: item,
})))

const activities = computed(() => [
  { title: '系统状态已更新', time: '刚刚', icon: '✓', tone: 'success' },
  { title: '应用状态已检查', time: '刚刚', icon: '⌁', tone: 'blue' },
  { title: apps.value.length ? `${apps.value.length} 个应用在线` : '尚未安装应用', time: '今天', icon: '●', tone: apps.value.length ? 'success' : 'muted' },
])

const storageStatus = computed(() => {
  const pct = storageUsage.value
  if (pct >= 90) return { level: 'danger', icon: '!', title: '存储空间即将用尽', hint: '建议清理不再需要的文件或扩容。' }
  if (pct >= 75) return { level: 'warning', icon: '!', title: '存储使用率较高', hint: '建议留意剩余空间。' }
  return { level: 'ok', icon: '✓', title: '一切正常', hint: '系统会在需要你处理时提醒你。' }
})

function stateTone(state: string) {
  if (state === '运行中') return 'green'
  if (state === '异常') return 'red'
  if (state === '安装中') return 'blue'
  return 'slate'
}

function normalizeState(state: unknown) {
  const value = String(state || '').toLowerCase()
  if (value.includes('running') || value.includes('up') || value.includes('运行')) return '运行中'
  if (value.includes('stop') || value.includes('exit') || value.includes('停止')) return '已停止'
  if (value.includes('error') || value.includes('fail') || value.includes('异常')) return '异常'
  return state ? String(state) : '运行中'
}

function formatBytes(bytes: number) {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}

function seedChart(chart: echarts.ECharts | null, base: number) {
  if (!chart) return
  const offsets = [-4, -2, 1, -1, 2, 0, 3, 1, -2, -1, 2, 0, 4, 2, 1, 3, 0, -2, 1, 0, 2, -1, 3, 2, -2, 0, 1, 2, -1, 1, 0, 2, -1, 1, -2, 0]
  const data = offsets.map((offset, i) => Math.max(1, Math.min(98, base + offset + Math.round(Math.sin(i / 4) * 2))))
  chart.setOption({
    animationDuration: 500,
    grid: { left: 0, right: 0, top: 7, bottom: 7 },
    xAxis: { type: 'category', show: false, boundaryGap: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    tooltip: { show: false },
    series: [{ type: 'line', smooth: 0.35, symbol: 'none', data, lineStyle: { width: 1.35, color: '#8c93a0' }, areaStyle: { opacity: 0.018, color: '#8c93a0' } }],
  })
}

function updateChart(chart: echarts.ECharts | null, value: number) {
  if (!chart) return
  const option: any = chart.getOption()
  const previous = Array.isArray(option.series?.[0]?.data) ? option.series[0].data : []
  const data = [...previous, value].slice(-36)
  chart.setOption({ animationDurationUpdate: 420, xAxis: { data: data.map((_, i) => i) }, series: [{ data }] })
}

function initCharts() {
  cpuChart = cpuChartRef.value ? echarts.init(cpuChartRef.value) : null
  memChart = memChartRef.value ? echarts.init(memChartRef.value) : null
  seedChart(cpuChart, cpuUsage.value)
  seedChart(memChart, memoryUsage.value)
}

async function fetchApps() {
  try {
    const res: any = await getRegisteredApps()
    registeredApps.value = res?.data || []
  } catch {
    registeredApps.value = []
  }
}

async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([systemStore.fetchStats(), fetchApps()])
    updateChart(cpuChart, cpuUsage.value)
    updateChart(memChart, memoryUsage.value)
  } finally {
    refreshing.value = false
  }
}

function openApp(app: any) {
  router.push('/apps')
}

onMounted(async () => {
  await systemStore.fetchInfo()
  await nextTick()
  initCharts()
  await refresh()
  timer = setInterval(refresh, 5000)
  resizeHandler = () => { cpuChart?.resize(); memChart?.resize() }
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  cpuChart?.dispose()
  memChart?.dispose()
})
</script>

<style scoped>
.overview-page { padding-top: 12px; }
.overview-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:18px; }
.overview-status { display:flex; align-items:center; gap:10px; padding-bottom:3px; }
.overview-status > div { display:flex; flex-direction:column; gap:3px; }
.overview-status strong { font-size:13px; font-weight:650; letter-spacing:-.01em; }
.overview-status span:last-child { color:var(--pnos-muted); font-size:11px; }
.status-orb { width:8px; height:8px; border-radius:50%; background:var(--pnos-success); box-shadow:0 0 0 4px var(--pnos-success-soft); }
.overview-status.warning .status-orb { background:var(--pnos-warning); box-shadow:0 0 0 4px var(--pnos-warning-soft); }
.overview-status.danger .status-orb { background:var(--pnos-danger); box-shadow:0 0 0 4px var(--pnos-danger-soft); }
.health-line { display:flex; align-items:center; gap:12px; padding:11px 0 13px; margin-bottom:46px; border-top:1px solid var(--pnos-border); border-bottom:1px solid var(--pnos-border); background:transparent; }
.health-line.warning, .health-line.danger { border-color:var(--pnos-border); }
.health-line-mark { width:23px; height:23px; display:grid; place-items:center; flex:none; border-radius:50%; background:var(--pnos-success-soft); }
.health-line-mark span { width:7px; height:7px; border-radius:50%; background:var(--pnos-success); }
.health-line.warning .health-line-mark { background:var(--pnos-warning-soft); }
.health-line.warning .health-line-mark span { background:var(--pnos-warning); }
.health-line.danger .health-line-mark { background:var(--pnos-danger-soft); }
.health-line.danger .health-line-mark span { background:var(--pnos-danger); }
.health-line-copy { display:flex; flex-direction:column; min-width:0; flex:1; gap:2px; }
.health-line-copy strong { font-size:12.5px; font-weight:650; }
.health-line-copy span { color:var(--pnos-muted); font-size:11.5px; }
.health-action { flex:none; opacity:.88; }
.overview-section { margin-bottom:50px; }
.section-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:16px; }
.section-heading h2 { margin:0; font-size:18px; line-height:1.25; letter-spacing:-.025em; font-weight:700; }
.section-heading p { margin:5px 0 0; color:var(--pnos-muted); font-size:12px; }
.live-indicator { display:inline-flex; align-items:center; gap:7px; color:var(--pnos-muted); font-size:11px; }
.live-indicator > span { width:5px; height:5px; border-radius:50%; background:var(--pnos-success); box-shadow:0 0 0 3px var(--pnos-success-soft); animation:live-pulse 2.4s ease-out infinite; }
.resource-table { border-top:1px solid var(--pnos-border); }
.resource-row { display:grid; grid-template-columns:240px minmax(0,1fr) 58px; align-items:center; gap:22px; min-height:80px; padding:8px 0; border-bottom:1px solid var(--pnos-border); }
.resource-label { display:flex; align-items:center; gap:14px; min-width:0; }
.resource-label > div { display:flex; flex-direction:column; gap:4px; min-width:0; }
.resource-label strong { font-size:14px; font-weight:650; font-variant-numeric:tabular-nums; letter-spacing:-.01em; }
.resource-label span:not(.resource-name) { color:var(--pnos-muted); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.resource-name { width:38px; color:var(--pnos-subtle); font-size:10px; font-weight:650; letter-spacing:.02em; flex:none; }
.resource-chart { height:34px; min-width:0; }
.resource-chart > div { width:100%; height:100%; }
.storage-meter { height:5px; background:#eceef1; border-radius:999px; overflow:hidden; }
.storage-meter span { display:block; height:100%; border-radius:inherit; background:var(--pnos-primary); transition:width .55s cubic-bezier(.2,.7,.2,1); }
.resource-value { display:flex; justify-content:flex-end; text-align:right; }
.resource-value span { color:var(--pnos-muted); font-size:10px; white-space:nowrap; }
.load-track { height:4px; background:#eceef1; border-radius:999px; overflow:hidden; }
.load-track span { display:block; height:100%; border-radius:inherit; background:#8b93a1; transition:width .55s cubic-bezier(.2,.7,.2,1); }
.app-list { border-top:1px solid var(--pnos-border); }
.app-item { appearance:none; width:100%; display:grid; grid-template-columns:40px minmax(0,1fr) auto 12px; gap:13px; align-items:center; padding:13px 0; border:0; border-bottom:1px solid var(--pnos-border); background:transparent; text-align:left; cursor:pointer; transition:background .18s ease; }
.app-item:hover { background:rgba(0,0,0,.014); }
.app-icon { width:38px; height:38px; border-radius:10px; display:grid; place-items:center; color:white; font-size:14px; font-weight:700; box-shadow:inset 0 0 0 1px rgba(0,0,0,.06); }
.app-icon.violet { background:linear-gradient(145deg,#6c59d9,#8d7bea); }
.app-icon.blue { background:linear-gradient(145deg,#3f78e8,#6b9af2); }
.app-icon.green { background:linear-gradient(145deg,#39a974,#69c095); }
.app-icon.orange { background:linear-gradient(145deg,#d98b37,#ecae63); }
.app-icon.red { background:linear-gradient(145deg,#d85c68,#eb8a93); }
.app-icon.slate { background:linear-gradient(145deg,#606a78,#86909d); }
.app-content { display:flex; flex-direction:column; gap:4px; min-width:0; }
.app-content strong { font-size:13px; font-weight:650; letter-spacing:-.01em; }
.app-content span { color:var(--pnos-muted); font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.app-state { display:inline-flex; align-items:center; gap:7px; color:var(--pnos-muted); font-size:11px; white-space:nowrap; }
.app-state .status-dot { background:var(--pnos-success); }
.app-state.red .status-dot { background:var(--pnos-danger); }
.app-state.blue .status-dot { background:var(--pnos-primary); }
.app-state.slate .status-dot { background:#9aa1ac; }
.app-state.red { color:var(--pnos-danger); }
.app-state.blue { color:var(--pnos-primary); }
.app-state.slate { color:var(--pnos-muted); }
.chevron { color:#b8bcc4; font-size:18px; line-height:1; transform:translateX(0); transition:transform .18s ease,color .18s ease; }
.app-item:hover .chevron { color:#9096a0; transform:translateX(2px); }
.empty-state { display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; padding:56px 24px; border-top:1px solid var(--pnos-border); border-bottom:1px solid var(--pnos-border); }
.empty-icon { width:42px; height:42px; display:grid; place-items:center; margin-bottom:4px; border-radius:50%; background:var(--pnos-surface-soft); color:var(--pnos-muted); font-size:21px; font-weight:300; }
.empty-state strong { font-size:13px; }
.empty-state > span { color:var(--pnos-muted); font-size:11px; margin-bottom:7px; }
.activity-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:56px; margin-bottom:12px; }
.activity-section, .attention-section { margin-bottom:0; }
.activity-list { border-top:1px solid var(--pnos-border); }
.activity-item { display:flex; align-items:center; gap:12px; min-height:58px; border-bottom:1px solid var(--pnos-border); }
.activity-icon { width:25px; height:25px; display:grid; place-items:center; border-radius:50%; background:var(--pnos-success-soft); color:var(--pnos-success); font-size:12px; font-weight:700; }
.activity-icon.blue { background:var(--pnos-primary-soft); color:var(--pnos-primary); }
.activity-icon.muted { background:var(--pnos-surface-soft); color:var(--pnos-subtle); }
.activity-item > div { display:flex; flex-direction:column; gap:3px; }
.activity-item strong { font-size:12.5px; font-weight:600; }
.activity-item span:last-child { color:var(--pnos-muted); font-size:10.5px; }
.attention-content { min-height:58px; display:flex; align-items:center; gap:11px; padding:0; border-top:1px solid var(--pnos-border); border-bottom:1px solid var(--pnos-border); background:transparent; }
.attention-mark { width:25px; height:25px; display:grid; place-items:center; border-radius:50%; background:var(--pnos-success-soft); color:var(--pnos-success); font-size:11px; font-weight:700; flex:none; }
.attention-section.warning .attention-mark { background:var(--pnos-warning-soft); color:var(--pnos-warning); }
.attention-section.danger .attention-mark { background:var(--pnos-danger-soft); color:var(--pnos-danger); }
.attention-copy { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
.attention-copy strong { font-size:12.5px; }
.attention-copy span { color:var(--pnos-muted); font-size:10.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.attention-ok { color:var(--pnos-muted); font-size:10.5px; }
.overview-page :deep(.n-button) { --n-border-radius: 8px; }
.health-action { color:var(--pnos-muted); }
.health-action:hover { color:var(--pnos-text); background:rgba(0,0,0,.035); }
.app-item:focus-visible { outline:2px solid rgba(59,114,230,.30); outline-offset:-2px; }
.app-item:active { background:rgba(0,0,0,.024); }
@keyframes live-pulse { 0%,65%,100% { box-shadow:0 0 0 3px var(--pnos-success-soft); } 20% { box-shadow:0 0 0 5px var(--pnos-success-soft); } }
@media (prefers-reduced-motion: reduce) {
  .overview-page *, .overview-page *::before, .overview-page *::after { transition-duration:.01ms !important; animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; }
}
@media (max-width:920px) {
  .overview-header { align-items:flex-start; flex-direction:column; }
  .overview-status { align-items:flex-start; }
  .resource-row { grid-template-columns:190px minmax(0,1fr) 54px; gap:14px; }
  .activity-grid { grid-template-columns:1fr; gap:38px; }
}
@media (max-width:700px) {
  .overview-page { padding-top:6px; }
  .overview-header { margin-bottom:14px; }
  .pnos-page-title { font-size:27px; }
  .health-line { margin-bottom:38px; }
  .resource-row { grid-template-columns:1fr auto; gap:8px 10px; padding:13px 0; }
  .resource-chart { grid-column:1 / -1; grid-row:2; height:30px; }
  .resource-value { grid-column:2; grid-row:1; }
  .load-track { display:none; }
  .section-heading { align-items:flex-start; }
  .app-item { grid-template-columns:38px minmax(0,1fr) 12px; }
  .app-state { display:none; }
  .overview-section { margin-bottom:42px; }
}
</style>
