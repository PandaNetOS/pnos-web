<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2 style="color: #e6edf3; margin: 0; font-size: 20px">应用商店</h2>
      <div style="display: flex; gap: 10px">
        <n-input v-model:value="search" placeholder="搜索应用" style="width: 200px" clearable size="small" />
        <n-button @click="fetchApps" size="small">刷新</n-button>
      </div>
    </div>

    <n-grid :cols="3" :x-gap="16" :y-gap="16">
      <n-gi v-for="app in filteredApps" :key="app.id">
        <n-card hoverable :bordered="false" size="small" style="background: #161b22; border-radius: 8px">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
            <div style="width: 48px; height: 48px; background: #21262d; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px">
              📦
            </div>
            <div>
              <div style="font-weight: 600; color: #e6edf3; font-size: 14px">{{ app.name }}</div>
              <div style="font-size: 11px; color: #8b949e">v{{ app.version }}</div>
            </div>
          </div>
          <p style="font-size: 12px; color: #8b949e; margin-bottom: 12px; min-height: 32px">{{ app.description }}</p>
          <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap">
            <n-tag v-for="cat in app.categories" :key="cat" size="small" type="info" :bordered="false">{{ cat }}</n-tag>
          </div>
          <div style="display: flex; gap: 8px">
            <n-button type="primary" size="small" @click="install(app.id)" :loading="installing === app.id">
              安装
            </n-button>
            <n-button size="small" @click="showDetail(app)">详情</n-button>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-modal v-model:show="detailVisible" preset="card" title="应用详情" style="width: 560px"
      :theme-overrides="{ color: '#161b22', textColor: '#e6edf3', borderColor: '#30363d' }">
      <div v-if="selectedApp" style="color: #c9d1d9; font-size: 13px; line-height: 1.8">
        <p><strong style="color: #8b949e">ID：</strong>{{ selectedApp.id }}</p>
        <p><strong style="color: #8b949e">版本：</strong>{{ selectedApp.version }}</p>
        <p><strong style="color: #8b949e">描述：</strong>{{ selectedApp.description }}</p>
        <p><strong style="color: #8b949e">监听端口：</strong>{{ selectedApp.run?.port }}</p>
        <p><strong style="color: #8b949e">作者：</strong>{{ selectedApp.author || 'PandaNetOS' }}</p>
        <p v-if="selectedApp.depends_on?.length"><strong style="color: #8b949e">依赖：</strong>{{ selectedApp.depends_on.join(', ') }}</p>
        <p v-if="selectedApp.homepage"><strong style="color: #8b949e">主页：</strong><a :href="selectedApp.homepage" target="_blank" style="color: #58a6ff">{{ selectedApp.homepage }}</a></p>
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
const installing = ref('')
const detailVisible = ref(false)
const selectedApp = ref<any>(null)

const filteredApps = computed(() => {
  return apps.value.filter((app) => {
    return !search.value ||
      app.name.toLowerCase().includes(search.value.toLowerCase()) ||
      app.description.toLowerCase().includes(search.value.toLowerCase())
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
  } catch (e: any) {
    message.error(e.response?.data?.message || '安装失败')
  } finally {
    installing.value = ''
  }
}

function showDetail(app: any) {
  selectedApp.value = app
  detailVisible.value = true
}

onMounted(fetchApps)
</script>
