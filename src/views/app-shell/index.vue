<template>
  <div class="app-shell-page">
    <!-- 顶部条：应用名 + 状态 + 操作 -->
    <div class="shell-header pnos-surface">
      <div class="shell-head-left">
        <AppIcon
          :name="app?.name || appId"
          :icon="iconUrl"
          :tone="tone"
          size="sm"
        />
        <strong class="shell-title">{{ app?.name || appId }}</strong>
        <StatusBadge v-if="app" :status="app.status" />
        <span v-if="src" class="shell-url">{{ src }}</span>
      </div>
      <div class="shell-head-actions">
        <n-button size="small" :disabled="!src" @click="reload">刷新</n-button>
        <n-button size="small" :disabled="!src" @click="openNewTab">新窗口打开</n-button>
      </div>
    </div>

    <!-- iframe 载体 -->
    <div class="shell-frame-wrap pnos-surface">
      <EmptyState
        v-if="!src"
        icon="▦"
        title="该应用没有可打开的界面"
        description="应用未注册 web_path 或未提供对外地址"
      />
      <iframe
        v-else
        :key="reloadKey"
        :src="src"
        class="shell-frame"
        title="app-shell"
        allow="clipboard-read; clipboard-write; fullscreen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useComponentsStore } from '@/stores/components'
import { useStoreStore } from '@/stores/store'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const componentsStore = useComponentsStore()
const storeStore = useStoreStore()

const appId = computed(() => String(route.params.id || ''))
const app = computed(() => componentsStore.getById(appId.value))
const reloadKey = ref(0)

const tones: Array<'blue' | 'green' | 'orange' | 'red' | 'violet' | 'slate'> =
  ['blue', 'green', 'orange', 'violet', 'slate', 'red']

const tone = computed(() => {
  let hash = 0
  const id = appId.value
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return tones[Math.abs(hash) % tones.length]
})

const storeBaseUrl = computed(() => {
  const source = storeStore.sources.find((s) => s.enabled) || storeStore.sources[0]
  if (!source?.url) return ''
  return source.url.replace(/\/[^\/]*$/, '/')
})

const iconUrl = computed(() => {
  const storeApp = storeStore.apps.find((a) => a.id === appId.value)
  const icon = storeApp?.icon
  if (!icon) return ''
  if (icon.startsWith('http://') || icon.startsWith('https://')) return icon
  if (!icon.includes('/')) return storeBaseUrl.value + 'apps/' + appId.value + '/' + icon
  return storeBaseUrl.value + icon
})

/** iframe 地址：优先对外地址 serve_url，否则 base_url + web_path */
const src = computed(() => {
  const a = app.value
  if (!a) return ''
  if (a.serve_url) return a.serve_url
  if (a.base_url) {
    const path = a.web_path || '/'
    return a.base_url.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path)
  }
  return ''
})

function reload() {
  reloadKey.value++
}

function openNewTab() {
  if (src.value) window.open(src.value, '_blank')
}

onMounted(() => {
  if (!componentsStore.list.length) componentsStore.fetch()
})
</script>

<style scoped>
.app-shell-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: calc(100vh - var(--pnos-header-height) - 120px);
  min-height: 480px;
}

.shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  flex-shrink: 0;
}

.shell-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.shell-title {
  font-size: 14px;
  letter-spacing: -0.01em;
}

.shell-url {
  color: var(--pnos-subtle);
  font-size: 11px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shell-head-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.shell-frame-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
}

.shell-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #fff;
}

@media (max-width: 640px) {
  .shell-url { display: none; }
  .shell-head-actions .n-button:first-child { display: none; }
}
</style>
