<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 顶部栏 -->
    <n-layout-header bordered style="height: 56px; display: flex; align-items: center; padding: 0 20px">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600">
        <span style="font-size: 24px">🐼</span>
        <span>pnos</span>
      </div>
      <div style="flex: 1"></div>
      <n-tag size="small" type="success">{{ systemStore.info?.version || 'v0.1.0' }}</n-tag>
    </n-layout-header>

    <n-layout has-sider>
      <!-- 侧边栏 -->
      <n-layout-sider bordered width="200" :collapsed-width="64" show-trigger="bar" collapse-mode="width">
        <n-menu
          :value="activeMenu"
          :options="menuOptions"
          @update:value="handleMenuClick"
        />
        <n-divider style="margin: 8px 0" />
        <div style="padding: 0 16px 8px; font-size: 12px; color: #999">已安装应用</div>
        <n-menu :options="installedApps" @update:value="handleAppClick" />
      </n-layout-sider>

      <!-- 内容区 -->
      <n-layout-content content-style="padding: 20px">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { useSystemStore } from '@/stores/system'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()

const activeMenu = computed(() => route.path)

const menuOptions = [
  { label: '仪表盘', key: '/dashboard' },
  { label: '应用商店', key: '/store' },
  { label: '容器管理', key: '/containers' },
  { label: '文件管理', key: '/files' },
  { label: '设置', key: '/settings' },
]

const installedApps = [
  { label: '下载 (pk)', key: '/app/pk/' },
]

function handleMenuClick(key: string) {
  router.push(key)
}

function handleAppClick(key: string) {
  window.open(key, '_blank')
}

onMounted(() => {
  systemStore.fetchInfo()
})
</script>
