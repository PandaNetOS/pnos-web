<template>
  <n-layout has-sider style="height: 100vh; background: #0d1117">
    <!-- 顶部栏 -->
    <n-layout-header bordered style="height: 56px; display: flex; align-items: center; padding: 0 20px; background: #161b22; border-color: #30363d !important">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: #e6edf3">
        <span style="font-size: 24px">🐼</span>
        <span>PandaNetOS</span>
      </div>
      <div style="flex: 1"></div>
      <n-tag size="small" type="success" :bordered="false">{{ systemStore.info?.pnos_version || 'v0.1.0' }}</n-tag>
    </n-layout-header>

    <n-layout has-sider>
      <!-- 侧边栏 -->
      <n-layout-sider bordered width="220" :collapsed-width="64" show-trigger="bar" collapse-mode="width"
        style="background: #161b22; border-color: #30363d !important">
        <n-menu
          :value="activeMenu"
          :options="menuOptions"
          @update:value="handleMenuClick"
          :root-indent="16"
          :indent="20"
        />

        <n-divider style="margin: 8px 0; border-color: #30363d" />
        <div style="padding: 0 20px 8px; font-size: 11px; color: #8b949e; letter-spacing: 0.5px">已安装应用</div>
        <n-menu :options="installedAppMenu" @update:value="handleAppClick" :root-indent="16" />
      </n-layout-sider>

      <!-- 内容区 -->
      <n-layout-content content-style="padding: 24px; background: #0d1117; min-height: calc(100vh - 56px)">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { getRegisteredApps } from '@/api'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()

const activeMenu = computed(() => route.path)
const registeredApps = ref<any[]>([])

const menuOptions = [
  {
    label: '系统状态',
    key: '__system__',
    children: [
      { label: '系统概览', key: '/dashboard' },
    ],
  },
  {
    label: '应用',
    key: '__apps__',
    children: [
      { label: '应用商店', key: '/store' },
      { label: '已安装应用', key: '/apps' },
    ],
  },
  {
    label: '系统设置',
    key: '__settings__',
    children: [
      { label: '通用设置', key: '/settings' },
    ],
  },
]

const installedAppMenu = computed(() =>
  registeredApps.value.map((app: any) => ({
    label: app.name || app.id,
    key: `/app/${app.id}/`,
  }))
)

function handleMenuClick(key: string) {
  if (!key.startsWith('__')) {
    router.push(key)
  }
}

function handleAppClick(key: string) {
  window.open(key, '_blank')
}

async function fetchRegisteredApps() {
  try {
    const res: any = await getRegisteredApps()
    registeredApps.value = res.data || []
  } catch (e) {
    console.error('获取已注册应用失败', e)
  }
}

onMounted(() => {
  systemStore.fetchInfo()
  fetchRegisteredApps()
  setInterval(fetchRegisteredApps, 10000)
})
</script>
