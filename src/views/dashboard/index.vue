<template>
  <div class="pnos-page">
    <PageHeader :title="greeting" description="一切运行正常" />

    <section class="hero-state pnos-surface">
      <div>
        <div class="eyebrow">{{ serverName }}</div>
        <div class="health-title"><span class="health-ring"><span /></span> 系统健康</div>
        <div class="health-meta">已运行 {{ uptimeText }}</div>
      </div>
      <div class="hero-actions">
        <n-button quaternary @click="refresh">刷新</n-button>
        <n-button type="primary" secondary @click="router.push('/settings')">系统设置</n-button>
      </div>
    </section>

    <div class="section-head">
      <div class="pnos-section-title">资源</div>
      <div class="section-note">实时 · 每 3 秒更新</div>
    </div>

    <n-grid :cols="4" :x-gap="14" :y-gap="14" responsive="screen" class="resource-grid">
      <n-gi span="4 s:2 m:1">
        <div class="metric pnos-surface">
          <div class="metric-label">CPU</div>
          <div class="metric-main"><strong>{{ cpuUsage }}%</strong><span>{{ cpuCores }} 核</span></div>
          <div ref="cpuChartRef" class="mini-chart" />
        </div>
      </n-gi>
      <n-gi span="4 s:2 m:1">
        <div class="metric pnos-surface">
          <div class="metric-label">内存</div>
          <div class="metric-main"><strong>{{ memoryUsage }}%</strong><span>{{ memoryDetail }}</span></div>
          <div ref="memChartRef" class="mini-chart" />
        </div>
      </n-gi>
      <n-gi span="4 s:2 m:1">
        <div class="metric pnos-surface">
          <div class="metric-label">存储</div>
          <div class="metric-main"><strong>{{ storageUsage }}%</strong><span>{{ storageDetail }}</span></div>
          <div class="storage-bar"><span :style="{ width: `${storageUsage}%` }" /></div>
        </div>
      </n-gi>
      <n-gi span="4 s:2 m:1">
        <div class="metric pnos-surface">
          <div class="metric-label">负载</div>
          <div class="network-main"><div><strong>{{ load1 }}</strong><span>1 分钟</span></div><div><strong>{{ load5 }}</strong><span>5 分钟</span></div></div>
        </div>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="14" :y-gap="14" responsive="screen" class="lower-grid">
      <n-gi span="2 s:2 m:1">
        <section class="pnos-surface panel">
          <div class="panel-header"><div><div class="pnos-section-title">应用</div><div class="panel-subtitle">已安装的服务</div></div><n-button text type="primary" @click="router.push('/store')">查看全部</n-button></div>
          <div v-if="apps.length" class="app-list">
            <div v-for="app in apps" :key="app.name" class="app-row">
              <div class="app-icon"><span>{{ app.symbol }}</span></div>
              <div class="app-info"><strong>{{ app.name }}</strong><span>{{ app.description }}</span></div>
              <div class="app-state"><span class="status-dot" /> {{ app.state }}</div>
            </div>
          </div>
          <div v-else class="empty-inline">暂无已安装应用</div>
        </section>
      </n-gi>
      <n-gi span="2 s:2 m:1">
        <section class="pnos-surface panel">
          <div class="panel-header"><div><div class="pnos-section-title">最近活动</div><div class="panel-subtitle">最近的系统变化</div></div></div>
          <div class="activity-list">
            <div class="activity-row"><span class="activity-dot blue" /><div><strong>系统状态已刷新</strong><span>刚刚</span></div></div>
            <div class="activity-row"><span class="activity-dot" /><div><strong>应用检查完成</strong><span>几秒前</span></div></div>
            <div class="activity-row"><span class="activity-dot" /><div><strong>后台服务正常</strong><span>今天</span></div></div>
          </div>
        </section>
      </n-gi>
    </n-grid>

    <section class="notice pnos-surface" :class="storageStatus.level">
      <div class="notice-icon">{{ storageStatus.icon }}</div>
      <div><strong>{{ storageStatus.title }}</strong><span>{{ storageFree }} 可用。{{ storageStatus.hint }}</span></div>
      <n-button text type="primary" @click="router.push('/settings')">管理存储</n-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { getRegisteredApps } from '@/api'
import PageHeader from '@/components/PageHeader.vue'
import * as echarts from 'echarts'

const router = useRouter()
const systemStore = useSystemStore()
const cpuChartRef = ref<HTMLElement>()
const memChartRef = ref<HTMLElement>()
const registeredApps = ref<any[]>([])
let cpuChart: echarts.ECharts | null = null
let memChart: echarts.ECharts | null = null
let timer: ReturnType<typeof setInterval> | null = null

const cpuUsage = computed(() => Number(systemStore.stats?.cpu_usage ?? 0).toFixed(0))
const cpuCores = computed(() => systemStore.info?.cpu_cores || 8)
const memoryUsage = computed(() => Number(systemStore.stats?.memory_usage ?? 0).toFixed(0))
const memoryDetail = computed(() => {
  const total = systemStore.info?.memory_total
  const pct = Number(systemStore.stats?.memory_usage ?? 0)
  if (!total) return '—'
  const used = total * pct / 100
  return `${formatBytes(used)} / ${formatBytes(total)}`
})
const storageSource = computed(() => systemStore.stats?.disks?.[0])
const storageUsage = computed(() => Number(storageSource.value?.usage ?? 0).toFixed(0))
const storageDetail = computed(() => storageSource.value?.total ? formatBytes(storageSource.value.total) : '—')
const storageFree = computed(() => storageSource.value?.available ? formatBytes(storageSource.value.available) : '—')
const uptimeText = computed(() => {
  const uptime = Number(systemStore.info?.uptime || 0)
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  return days ? `${days}d ${hours}h` : `${hours}h`
})
const load1 = computed(() => Number(systemStore.stats?.load_average?.[0] ?? 0).toFixed(2))
const load5 = computed(() => Number(systemStore.stats?.load_average?.[1] ?? 0).toFixed(2))
const serverName = computed(() => systemStore.info?.hostname || 'Panda Server')
const greeting = computed(() => {
  const h = new Date().getHours()
  const pool = {
    night: ['夜深了，早点休息。', '还在忙吗？注意身体。', '深夜了，服务器陪你。', '晚安，辛苦了。'],
    morning: ['早上好，新的一天。', '早安，今天也要加油。', '清晨好，系统已就绪。', '早上好，喝杯咖啡吧。'],
    noon: ['中午好，记得吃饭。', '午安，休息一下吧。', '中午了，吃点好的。', '晌午好，别太拼。'],
    afternoon: ['下午好，喝杯茶吧。', '午后时光，慢慢来。', '下午好，继续加油。', '下午茶时间到了。'],
    evening: ['晚上好，辛苦了一天。', '晚安前的时光，放松一下。', '晚上好，今天过得怎么样？', '夜幕降临，该休息了。'],
  }
  const key = h < 6 ? 'night' : h < 12 ? 'morning' : h < 14 ? 'noon' : h < 18 ? 'afternoon' : 'evening'
  const list = pool[key]
  return list[Math.floor(Math.random() * list.length)]
})
const storageStatus = computed(() => {
  const pct = Number(storageUsage.value)
  if (pct >= 90) return { level: 'danger', icon: '!', title: '存储即将用尽', hint: '建议清理或扩容。' }
  if (pct >= 70) return { level: 'warning', icon: '!', title: '存储使用率较高', hint: '请留意剩余空间。' }
  return { level: 'ok', icon: '✓', title: '存储状态良好', hint: '空间不足时会及时提醒。' }
})

const apps = computed(() =>
  registeredApps.value.slice(0, 5).map((item: any) => ({
    name: item.name || item.id || 'Application',
    description: item.id ? `127.0.0.1:${item.port}` : 'Server application',
    state: item.status || 'Running',
    symbol: (item.name || item.id || 'A').slice(0, 1).toUpperCase(),
  }))
)

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}
function initCharts() {
  cpuChart = cpuChartRef.value ? echarts.init(cpuChartRef.value) : null
  memChart = memChartRef.value ? echarts.init(memChartRef.value) : null
  const common = { animationDuration: 350, grid: { left: 0, right: 0, top: 4, bottom: 0 }, xAxis: { show: false, type: 'category' }, yAxis: { show: false, type: 'value', min: 0, max: 100 }, tooltip: { show: false } }
  cpuChart?.setOption({ ...common, series: [{ type: 'line', smooth: true, showSymbol: false, data: [], lineStyle: { width: 2, color: '#3478f6' }, areaStyle: { color: 'rgba(52,120,246,0.1)' } }] })
  memChart?.setOption({ ...common, series: [{ type: 'line', smooth: true, showSymbol: false, data: [], lineStyle: { width: 2, color: '#22a06b' }, areaStyle: { color: 'rgba(34,160,107,0.1)' } }] })
}
async function refresh() {
  await Promise.all([systemStore.fetchStats(), fetchApps()])
  // push chart data
  const now = new Date().toLocaleTimeString()
  if (cpuChart) {
    const opt: any = cpuChart.getOption()
    const xData = [...(opt.xAxis[0].data || []), now].slice(-20)
    const yData = [...(opt.series[0].data || []), Number(cpuUsage.value)].slice(-20)
    cpuChart.setOption({ xAxis: { data: xData }, series: [{ data: yData }] })
  }
  if (memChart) {
    const opt: any = memChart.getOption()
    const xData = [...(opt.xAxis[0].data || []), now].slice(-20)
    const yData = [...(opt.series[0].data || []), Number(memoryUsage.value)].slice(-20)
    memChart.setOption({ xAxis: { data: xData }, series: [{ data: yData }] })
  }
}
async function fetchApps() {
  try {
    const res: any = await getRegisteredApps()
    registeredApps.value = res.data || []
  } catch (e) { /* ignore */ }
}

onMounted(async () => {
  await systemStore.fetchInfo()
  await nextTick()
  initCharts()
  refresh()
  timer = setInterval(refresh, 3000)
  window.addEventListener('resize', () => { cpuChart?.resize(); memChart?.resize() })
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  cpuChart?.dispose(); memChart?.dispose()
})
</script>

<style scoped>
.hero-state { display:flex; align-items:center; justify-content:space-between; padding:22px 24px; margin-bottom:28px; }
.eyebrow { color:var(--pnos-muted); font-size:13px; margin-bottom:7px; }
.health-title { display:flex; align-items:center; gap:10px; font-size:18px; font-weight:700; letter-spacing:-.015em; }
.health-ring { width:12px; height:12px; border-radius:50%; background:var(--pnos-success); box-shadow:0 0 0 5px var(--pnos-success-soft); display:inline-block; }
.health-meta { margin-top:7px; color:var(--pnos-muted); font-size:13px; }
.hero-actions { display:flex; gap:8px; }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.section-note { color:var(--pnos-subtle); font-size:12px; }
.metric { min-height:156px; padding:18px; }
.metric-label { color:var(--pnos-muted); font-size:13px; font-weight:600; }
.metric-main { display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-top:12px; }
.metric-main strong { font-size:28px; letter-spacing:-.04em; }
.metric-main span, .network-main span { color:var(--pnos-muted); font-size:12px; }
.mini-chart { height:46px; margin-top:12px; }
.storage-bar { margin-top:26px; height:8px; border-radius:99px; background:#edf0f4; overflow:hidden; }
.storage-bar span { display:block; height:100%; background:var(--pnos-primary); border-radius:99px; }
.network-main { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:26px; }
.network-main strong { display:block; font-size:17px; letter-spacing:-.02em; margin-bottom:4px; }
.lower-grid { margin-top:14px; }
.panel { min-height:262px; padding:20px; }
.panel-header { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.panel-subtitle { font-size:12px; color:var(--pnos-muted); margin-top:-6px; }
.app-list, .activity-list { margin-top:18px; }
.app-row, .activity-row { display:flex; align-items:center; gap:11px; padding:12px 0; border-top:1px solid #f0f1f4; }
.app-row:first-child, .activity-row:first-child { border-top:0; }
.app-icon { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; background:#f1f4fb; color:#3478f6; font-weight:700; }
.app-info { flex:1; min-width:0; }
.app-info strong, .activity-row strong { display:block; font-size:13px; }
.app-info span, .activity-row span { display:block; margin-top:3px; color:var(--pnos-muted); font-size:11px; }
.app-state { color:#4e5865; font-size:11px; font-weight:600; display:flex; align-items:center; gap:6px; }
.status-dot { width:6px; height:6px; border-radius:50%; background:var(--pnos-success); }
.activity-row { align-items:flex-start; }
.activity-dot { width:7px; height:7px; border-radius:50%; background:#c6cbd3; margin-top:7px; flex:none; }
.activity-dot.blue { background:var(--pnos-primary); }
.empty-inline { color:var(--pnos-muted); font-size:13px; padding:30px 0; }
.notice { display:flex; align-items:center; gap:12px; margin-top:14px; padding:15px 18px; }
.notice-icon { width:28px; height:28px; border-radius:9px; background:var(--pnos-success-soft); color:var(--pnos-success); display:grid; place-items:center; font-weight:800; }
.notice.warning .notice-icon { background:var(--pnos-warning-soft); color:var(--pnos-warning); }
.notice.danger .notice-icon { background:var(--pnos-danger-soft); color:var(--pnos-danger); }
.notice > div:nth-child(2) { flex:1; }
.notice strong { display:block; font-size:13px; }
.notice span { display:block; color:var(--pnos-muted); font-size:12px; margin-top:3px; }
@media (max-width:760px) { .hero-state { align-items:flex-start; flex-direction:column; gap:18px; } .hero-actions { width:100%; } .hero-actions .n-button { flex:1; } .notice { align-items:flex-start; flex-wrap:wrap; } }
</style>
