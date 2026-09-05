<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>容器管理</h2>
      <n-space>
        <n-switch v-model:value="showAll" checked-value="true" unchecked-value="false">
          <template #checked>显示全部</template>
          <template #unchecked>仅运行中</template>
        </n-switch>
        <n-button @click="fetchContainers">刷新</n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="containers"
      :loading="loading"
      :row-key="(row: any) => row.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, watch } from 'vue'
import { NButton, NTag, useMessage } from 'naive-ui'
import { getContainers, startContainer, stopContainer, restartContainer, removeContainer } from '@/api'

const message = useMessage()
const containers = ref<any[]>([])
const loading = ref(false)
const showAll = ref(true)

const columns = [
  { title: '名称', key: 'name' },
  { title: '镜像', key: 'image' },
  {
    title: '状态',
    key: 'state',
    render: (row: any) => {
      const type = row.state === 'running' ? 'success' : row.state === 'exited' ? 'default' : 'warning'
      return h(NTag, { type, size: 'small' }, { default: () => row.state })
    },
  },
  { title: '状态详情', key: 'status' },
  {
    title: '操作',
    key: 'actions',
    render: (row: any) => {
      const isRunning = row.state === 'running'
      return h('div', { style: 'display: flex; gap: 6px' }, [
        h(NButton, {
          size: 'small',
          type: isRunning ? 'warning' : 'primary',
          onClick: () => isRunning ? doStop(row.id) : doStart(row.id),
        }, { default: () => isRunning ? '停止' : '启动' }),
        h(NButton, { size: 'small', onClick: () => doRestart(row.id) }, { default: () => '重启' }),
        h(NButton, { size: 'small', type: 'error', onClick: () => doRemove(row.id) }, { default: () => '删除' }),
      ])
    },
  },
]

async function fetchContainers() {
  loading.value = true
  try {
    const res: any = await getContainers(showAll.value)
    containers.value = res.data || []
  } catch (e) {
    message.error('获取容器列表失败')
  } finally {
    loading.value = false
  }
}

async function doStart(id: string) {
  try {
    await startContainer(id)
    message.success('已启动')
    fetchContainers()
  } catch (e) {
    message.error('启动失败')
  }
}

async function doStop(id: string) {
  try {
    await stopContainer(id)
    message.success('已停止')
    fetchContainers()
  } catch (e) {
    message.error('停止失败')
  }
}

async function doRestart(id: string) {
  try {
    await restartContainer(id)
    message.success('已重启')
    fetchContainers()
  } catch (e) {
    message.error('重启失败')
  }
}

async function doRemove(id: string) {
  if (!confirm('确定删除该容器？')) return
  try {
    await removeContainer(id)
    message.success('已删除')
    fetchContainers()
  } catch (e) {
    message.error('删除失败')
  }
}

watch(showAll, fetchContainers)
onMounted(fetchContainers)
</script>
