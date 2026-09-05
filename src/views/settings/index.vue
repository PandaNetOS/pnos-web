<template>
  <div>
    <h2 style="margin-bottom: 20px">设置</h2>
    <n-card title="系统信息" style="margin-bottom: 16px">
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="系统名称">pnos</n-descriptions-item>
        <n-descriptions-item label="版本">{{ systemStore.info?.version || '-' }}</n-descriptions-item>
        <n-descriptions-item label="操作系统">{{ systemStore.info?.os || '-' }}</n-descriptions-item>
        <n-descriptions-item label="架构">{{ systemStore.info?.arch || '-' }}</n-descriptions-item>
        <n-descriptions-item label="数据目录">{{ systemStore.info?.data_dir || '-' }}</n-descriptions-item>
        <n-descriptions-item label="媒体目录">{{ systemStore.info?.media_dir || '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card title="商店源" style="margin-bottom: 16px">
      <n-data-table :columns="sourceColumns" :data="sources" :loading="loadingSources" />
    </n-card>

    <n-card title="关于">
      <p>pnos - 面向家庭私有 NAS 的系统级运行框架</p>
      <p>许可证：MIT</p>
      <p>仓库：https://github.com/PandaNetOS</p>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemStore } from '@/stores/system'
import { getStoreSources } from '@/api'

const systemStore = useSystemStore()
const sources = ref<any[]>([])
const loadingSources = ref(false)

const sourceColumns = [
  { title: '名称', key: 'name' },
  { title: 'URL', key: 'url' },
  { title: '状态', key: 'enabled', render: (row: any) => row.enabled ? '启用' : '禁用' },
]

async function fetchSources() {
  loadingSources.value = true
  try {
    const res: any = await getStoreSources()
    sources.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingSources.value = false
  }
}

onMounted(() => {
  systemStore.fetchInfo()
  fetchSources()
})
</script>
