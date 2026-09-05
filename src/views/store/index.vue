<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>应用商店</h2>
      <div style="display: flex; gap: 10px">
        <n-input v-model:value="search" placeholder="搜索应用" style="width: 200px" clearable />
        <n-select v-model:value="category" :options="categoryOptions" placeholder="全部分类" style="width: 140px" clearable />
        <n-button @click="refresh">刷新</n-button>
      </div>
    </div>

    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi v-for="app in filteredApps" :key="app.id">
        <n-card hoverable>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
            <div style="width: 48px; height: 48px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px">
              📦
            </div>
            <div>
              <div style="font-weight: 600">{{ app.name }}</div>
              <div style="font-size: 12px; color: #999">v{{ app.version }}</div>
            </div>
          </div>
          <p style="font-size: 13px; color: #666; margin-bottom: 12px; min-height: 36px">{{ app.description }}</p>
          <div style="display: flex; gap: 6px; margin-bottom: 12px">
            <n-tag v-for="cat in app.categories" :key="cat" size="small" type="info">{{ cat }}</n-tag>
          </div>
          <n-space>
            <n-button type="primary" size="small" @click="install(app.id)" :loading="installing === app.id">
              安装
            </n-button>
            <n-button size="small" @click="showDetail(app)">详情</n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal v-model:show="detailVisible" preset="card" title="应用详情" style="width: 600px">
      <div v-if="selectedApp">
        <p><strong>ID：</strong>{{ selectedApp.id }}</p>
        <p><strong>版本：</strong>{{ selectedApp.version }}</p>
        <p><strong>镜像：</strong>{{ selectedApp.image }}</p>
        <p><strong>描述：</strong>{{ selectedApp.description }}</p>
        <p><strong>端口：</strong></p>
        <ul>
          <li v-for="(p, i) in selectedApp.ports" :key="i">{{ p.container }} → {{ p.host }} ({{ p.protocol }})</li>
        </ul>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStoreApps, installApp } from '@/api'
import { useMessage } from 'naive-ui'

const message = useMessage()
const apps = ref<any[]>([])
const search = ref('')
const category = ref('')
const installing = ref('')
const detailVisible = ref(false)
const selectedApp = ref<any>(null)

const categoryOptions = [
  { label: '下载', value: 'download' },
  { label: '媒体', value: 'media' },
  { label: '工具', value: 'tool' },
  { label: '系统', value: 'system' },
]

const filteredApps = computed(() => {
  return apps.value.filter((app) => {
    const matchSearch = !search.value ||
      app.name.toLowerCase().includes(search.value.toLowerCase()) ||
      app.description.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !category.value || app.categories?.includes(category.value)
    return matchSearch && matchCategory
  })
})

async function fetchApps() {
  try {
    const res: any = await getStoreApps()
    apps.value = res.data || []
  } catch (e) {
    message.error('获取应用列表失败')
  }
}

async function install(id: string) {
  installing.value = id
  try {
    await installApp(id)
    message.success('安装任务已提交')
  } catch (e) {
    message.error('安装失败')
  } finally {
    installing.value = ''
  }
}

function showDetail(app: any) {
  selectedApp.value = app
  detailVisible.value = true
}

function refresh() {
  fetchApps()
  message.success('已刷新')
}

onMounted(fetchApps)
</script>
