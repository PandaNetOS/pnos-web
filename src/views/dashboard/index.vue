<template>
  <div>
    <!-- 状态卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 20px">
      <n-gi>
        <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px">
            <div style="font-size: 28px">⚡</div>
            <div>
              <div style="font-size: 12px; color: #8b949e">CPU 使用率</div>
              <div style="font-size: 24px; font-weight: 600; color: #58a6ff; font-family: monospace">{{ cpuUsage }}%</div>
            </div>
          </div>
          <n-progress type="line" :percentage="Number(cpuUsage)" :show-indicator="false"
            :fill-color="'#58a6ff'" :rail-color="'#21262d'" style="margin-top: 8px" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px">
            <div style="font-size: 28px">💾</div>
            <div>
              <div style="font-size: 12px; color: #8b949e">内存使用率</div>
              <div style="font-size: 24px; font-weight: 600; color: #3fb950; font-family: monospace">{{ memoryUsage }}%</div>
            </div>
          </div>
          <n-progress type="line" :percentage="Number(memoryUsage)" :show-indicator="false"
            :fill-color="'#3fb950'" :rail-color="'#21262d'" style="margin-top: 8px" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px">
            <div style="font-size: 28px">📦</div>
            <div>
              <div style="font-size: 12px; color: #8b949e">运行中应用</div>
              <div style="font-size: 24px; font-weight: 600; color: #d29922; font-family: monospace">{{ runningApps }}</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #8b949e">
            负载: {{ loadAvg }}
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px">
            <div style="font-size: 28px">⏱️</div>
            <div>
              <div style="font-size: 12px; color: #8b949e">系统运行</div>
              <div style="font-size: 24px; font-weight: 600; color: #f85149; font-family: monospace">{{ uptimeText }}</div>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #8b949e">
            {{ systemStore.info?.hostname || 'pnos' }}
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- CPU/内存图表 -->
    <n-grid :cols="2" :x-gap="16" style="margin-bottom: 20px">
      <n-gi>
        <n-card title="CPU 使用率" :bordered="false" size="small"
          style="background: #161b22; border-radius: 8px">
          <template #header>
            <span style="color: #e6edf3; font-size: 14px">CPU 使用率</span>
          </template>
          <div ref="cpuChartRef" style="height: 220px"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="内存使用率" :bordered="false" size="small"
          style="background: #161b22; border-radius: 8px">
          <template #header>
            <span style="color: #e6edf3; font-size: 14px">内存使用率</span>
          </template>
          <div ref="memChartRef" style="height: 220px"></div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 磁盘信息 -->
    <n-card :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
      <template #header>
        <span style="color: #e6edf3; font-size: 14px">磁盘信息</span>
      </template>
      <n-data-table :data="diskData" :columns="diskColumns" :bordered="false" size="small" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/system'
import { getRegisteredApps } from '@/api'
import * as echarts from 'echarts'

const systemStore = useSystemStore()
const cpuChartRef = ref<HTMLElement>()
const memChartRef = ref<HTMLElement>()
let cpuChart: echarts.ECharts | null = null
let memChart: echarts.ECharts | null = null
let timer: any = null
const runningApps = ref(0)

const cpuUsage = computed(() => (systemStore.stats?.cpu_usage ?? 0).toFixed(1))
const memoryUsage = computed(() => (systemStore.stats?.memory_usage ?? 0).toFixed(1))
const loadAvg = computed(() => {
  const la = systemStore.stats?.load_average || [0, 0, 0]
  return `${la[0]?.toFixed(2)} / ${la[1]?.toFixed(2)} / ${la[2]?.toFixed(2)}`
})

const uptimeText = computed(() => {
  const uptime = systemStore.info?.uptime || 0
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const mins = Math.floor((uptime % 3600) / 60)
  return days > 0 ? `${days}天${hours}时` : `${hours}时${mins}分`
})

const diskColumns = [
  { title: '挂载点', key: 'mount_point' },
  { title: '文件系统', key: 'fs_type' },
  { title: '总容量', key: 'total' },
  { title: '已用', key: 'used' },
  { title: '可用', key: 'available' },
  { title: '使用率', key: 'usage' },
]

const diskData = computed(() => {
  return (systemStore.stats?.disks || []).map((d: any) => ({
    mount_point: d.mount_point,
    fs_type: d.fs_type,
    total: formatBytes(d.total),
    used: formatBytes(d.used),
    available: formatBytes(d.available),
    usage: `${d.usage?.toFixed(1)}%`,
  }))
})

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

const darkChartTheme = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 27, 34, 0.95)',
    borderColor: '#30363d',
    textStyle: { color: '#e6edf3' },
  },
  grid: { left: 40, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: { lineStyle: { color: '#30363d' } },
    axisLabel: { color: '#8b949e', fontSize: 10 },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisLabel: { color: '#8b949e', fontSize: 10, formatter: '{value}%' },
    splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } },
  },
}

function initCharts() {
  if (cpuChartRef.value) {
    cpuChart = echarts.init(cpuChartRef.value)
    cpuChart.setOption({
      ...darkChartTheme,
      series: [{
        name: 'CPU',
        type: 'line',
        data: [],
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#58a6ff', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(88, 166, 255, 0.3)' },
            { offset: 1, color: 'rgba(88, 166, 255, 0)' },
          ]),
        },
      }],
    })
  }
  if (memChartRef.value) {
    memChart = echarts.init(memChartRef.value)
    memChart.setOption({
      ...darkChartTheme,
      series: [{
        name: '内存',
        type: 'line',
        data: [],
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3fb950', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(63, 185, 80, 0.3)' },
            { offset: 1, color: 'rgba(63, 185, 80, 0)' },
          ]),
        },
      }],
    })
  }
}

async function refresh() {
  await systemStore.fetchStats()
  try {
    const res: any = await getRegisteredApps()
    runningApps.value = (res.data || []).filter((a: any) => a.status === 'running').length
  } catch (e) { /* ignore */ }

  const now = new Date().toLocaleTimeString()
  if (cpuChart) {
    const option: any = cpuChart.getOption()
    const xData = [...(option.xAxis[0].data || []), now].slice(-20)
    const yData = [...(option.series[0].data || []), Number(cpuUsage.value)].slice(-20)
    cpuChart.setOption({ xAxis: { data: xData }, series: [{ data: yData }] })
  }
  if (memChart) {
    const option: any = memChart.getOption()
    const xData = [...(option.xAxis[0].data || []), now].slice(-20)
    const yData = [...(option.series[0].data || []), Number(memoryUsage.value)].slice(-20)
    memChart.setOption({ xAxis: { data: xData }, series: [{ data: yData }] })
  }
}

onMounted(() => {
  initCharts()
  refresh()
  timer = setInterval(refresh, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  cpuChart?.dispose()
  memChart?.dispose()
})
</script>
