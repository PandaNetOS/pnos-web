<template>
  <div>
    <h2 style="margin-bottom: 20px">仪表盘</h2>

    <!-- 资源概览卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 20px">
      <n-gi>
        <n-card>
          <n-statistic label="CPU 使用率" :value="cpuUsage" suffix="%">
            <template #prefix>
              <n-icon size="20" color="#18a058">⚡</n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="内存使用率" :value="memoryUsage" suffix="%">
            <template #prefix>
              <n-icon size="20" color="#2080f0">💾</n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="运行容器" :value="runningContainers">
            <template #prefix>
              <n-icon size="20" color="#f0a020">📦</n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="系统运行" :value="uptimeText">
            <template #prefix>
              <n-icon size="20" color="#d03050">⏱️</n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- CPU/内存图表 -->
    <n-grid :cols="2" :x-gap="16" style="margin-bottom: 20px">
      <n-gi>
        <n-card title="CPU 使用率">
          <div ref="cpuChartRef" style="height: 250px"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="内存使用率">
          <div ref="memChartRef" style="height: 250px"></div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 磁盘信息 -->
    <n-card title="磁盘信息">
      <n-table :data="diskData" :columns="diskColumns" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/stores/system'
import * as echarts from 'echarts'

const systemStore = useSystemStore()
const cpuChartRef = ref<HTMLElement>()
const memChartRef = ref<HTMLElement>()
let cpuChart: echarts.ECharts | null = null
let memChart: echarts.ECharts | null = null
let timer: any = null

const cpuUsage = computed(() => systemStore.stats?.cpu?.usage?.toFixed(1) || '0')
const memoryUsage = computed(() => systemStore.stats?.memory?.usage_percent?.toFixed(1) || '0')
const runningContainers = ref(0)

const uptimeText = computed(() => {
  const uptime = systemStore.stats?.uptime || 0
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  return `${days}天${hours}小时`
})

const diskColumns = [
  { title: '挂载点', key: 'mount_point' },
  { title: '文件系统', key: 'file_system' },
  { title: '总容量', key: 'total' },
  { title: '可用', key: 'available' },
  { title: '使用率', key: 'usage' },
]

const diskData = computed(() => {
  return (systemStore.stats?.disks || []).map((d: any) => ({
    mount_point: d.mount_point,
    file_system: d.file_system,
    total: formatBytes(d.total_space),
    available: formatBytes(d.available_space),
    usage: `${(((d.total_space - d.available_space) / d.total_space) * 100).toFixed(1)}%`,
  }))
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

function initCharts() {
  if (cpuChartRef.value) {
    cpuChart = echarts.init(cpuChartRef.value)
    cpuChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value', max: 100 },
      series: [{ name: 'CPU', type: 'line', data: [], smooth: true, areaStyle: {} }],
    })
  }
  if (memChartRef.value) {
    memChart = echarts.init(memChartRef.value)
    memChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value', max: 100 },
      series: [{ name: '内存', type: 'line', data: [], smooth: true, areaStyle: {} }],
    })
  }
}

async function refresh() {
  await systemStore.fetchStats()
  const now = new Date().toLocaleTimeString()
  if (cpuChart) {
    const option = cpuChart.getOption()
    const xData = [...(option.xAxis[0].data || []), now].slice(-20)
    const yData = [...(option.series[0].data || []), cpuUsage.value].slice(-20)
    cpuChart.setOption({ xAxis: { data: xData }, series: [{ data: yData }] })
  }
  if (memChart) {
    const option = memChart.getOption()
    const xData = [...(option.xAxis[0].data || []), now].slice(-20)
    const yData = [...(option.series[0].data || []), memoryUsage.value].slice(-20)
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
