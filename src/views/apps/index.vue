<template>
  <div class="pnos-page apps-page">
    <PageHeader title="应用" description="发现并管理服务器应用" eyebrow="应用" />

    <!-- 工具栏 -->
    <div class="apps-toolbar pnos-surface">
      <div class="tab-switch">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'installed' && componentsStore.appCount" class="tab-count">
            {{ componentsStore.appCount }}
          </span>
        </button>
      </div>
      <n-input
        v-model:value="search"
        clearable
        placeholder="搜索应用"
        class="apps-search"
      >
        <template #prefix>⌕</template>
      </n-input>
    </div>

    <!-- 商店 tab -->
    <div v-if="activeTab === 'store'" class="tab-content">
      <!-- 分类筛选 -->
      <div v-if="storeStore.categories.length" class="category-pills">
        <button
          :class="['pill', { active: category === 'all' }]"
          @click="category = 'all'"
        >全部</button>
        <button
          v-for="cat in storeStore.categories"
          :key="cat"
          :class="['pill', { active: category === cat }]"
          @click="category = cat"
        >{{ categoryLabel(cat) }}</button>
      </div>

      <!-- 应用卡片网格 -->
      <div v-if="filteredStoreApps.length" class="app-grid">
        <article
          v-for="app in filteredStoreApps"
          :key="app.id"
          class="app-card pnos-surface"
          @click="openStoreDetail(app)"
        >
          <div class="app-card-head">
            <AppIcon :name="app.name" :tone="appTone(app.id)" size="md" />
            <n-tag v-if="app.official" round size="small" type="info">官方</n-tag>
          </div>
          <h3 class="app-card-title">{{ app.name }}</h3>
          <p class="app-card-desc">{{ app.description || '实用的服务器服务' }}</p>
          <div class="app-card-footer">
            <span class="app-version">v{{ app.version }}</span>
            <n-button
              v-if="!componentsStore.isInstalled(app.id)"
              type="primary"
              secondary
              size="small"
              :loading="storeStore.installingId === app.id"
              @click.stop="installApp(app)"
            >安装</n-button>
            <n-button
              v-else
              size="small"
              @click.stop="activeTab = 'installed'"
            >已安装</n-button>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else
        icon="⌕"
        title="没有找到应用"
        description="试试其他搜索关键词或分类"
      />
    </div>

    <!-- 已安装 tab -->
    <div v-else class="tab-content">
      <div v-if="installedApps.length" class="installed-list pnos-surface">
        <div
          v-for="app in installedApps"
          :key="app.id"
          class="installed-row"
          @click="openInstalledDetail(app)"
        >
          <AppIcon :name="app.name" :tone="appTone(app.id)" size="md" />
          <div class="installed-info">
            <strong class="installed-name">{{ app.name }}</strong>
            <span class="installed-meta">{{ app.version }} · {{ app.base_url }}</span>
          </div>
          <StatusBadge :status="app.status" />
          <div class="installed-actions" @click.stop>
            <n-button
              v-if="app.status === 'running' && app.web_path"
              size="small"
              type="primary"
              secondary
              @click="openAppWeb(app)"
            >打开</n-button>
            <n-button
              size="small"
              :loading="actionLoadingId === app.id"
              @click="toggleApp(app)"
            >
              {{ app.status === 'running' ? '停止' : '启动' }}
            </n-button>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        icon="▦"
        title="暂无已安装应用"
        description="从应用商店发现并安装应用"
      >
        <n-button type="primary" @click="activeTab = 'store'">浏览应用商店</n-button>
      </EmptyState>
    </div>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="detailVisible" :mask-closable="true">
      <div v-if="detailApp" class="detail-panel pnos-surface">
        <div class="detail-header">
          <AppIcon :name="detailApp.name" :tone="appTone(detailApp.id)" size="lg" />
          <div class="detail-title-group">
            <div class="detail-title-row">
              <h2 class="detail-title">{{ detailApp.name }}</h2>
              <n-tag v-if="isStoreApp && (detailApp as any).official" round size="small" type="info">官方</n-tag>
            </div>
            <p class="detail-desc">{{ (detailApp as any).description || '服务器应用' }}</p>
            <StatusBadge v-if="!isStoreApp" :status="(detailApp as any).status" />
          </div>
          <n-button quaternary circle class="detail-close" @click="detailVisible = false">×</n-button>
        </div>

        <n-divider />

        <div class="detail-body">
          <!-- 商店应用信息 -->
          <template v-if="isStoreApp">
            <div class="detail-grid">
              <div class="detail-info-block">
                <h4>关于</h4>
                <p>{{ (detailApp as any).description || '在 pnos 服务器上安装此应用，统一管理。' }}</p>
              </div>
              <div class="detail-info-block">
                <h4>信息</h4>
                <p>版本 {{ (detailApp as any).version }}</p>
                <p v-if="(detailApp as any).categories?.length">分类 {{ (detailApp as any).categories.join(', ') }}</p>
                <p v-if="(detailApp as any).image">镜像 {{ (detailApp as any).image }}</p>
              </div>
            </div>
            <div class="detail-actions">
              <n-button
                v-if="!componentsStore.isInstalled(detailApp.id)"
                type="primary"
                size="large"
                :loading="storeStore.installingId === detailApp.id"
                @click="installApp(detailApp as any)"
              >安装应用</n-button>
              <n-button
                v-else
                size="large"
                @click="activeTab = 'installed'; detailVisible = false"
              >查看已安装</n-button>
            </div>
          </template>

          <!-- 已安装应用信息 -->
          <template v-else>
            <div class="detail-grid">
              <div class="detail-info-block">
                <h4>运行信息</h4>
                <p>状态 <StatusBadge :status="(detailApp as any).status" /></p>
                <p>版本 {{ (detailApp as any).version }}</p>
                <p>地址 {{ (detailApp as any).base_url }}</p>
                <p v-if="(detailApp as any).serve_url">对外地址 {{ (detailApp as any).serve_url }}</p>
              </div>
              <div class="detail-info-block">
                <h4>注册信息</h4>
                <p>组件 ID {{ (detailApp as any).id }}</p>
                <p>注册时间 {{ formatTime((detailApp as any).registered_at) }}</p>
                <p>最后心跳 {{ formatTime((detailApp as any).last_heartbeat) }}</p>
              </div>
            </div>
            <div class="detail-actions">
              <n-button
                v-if="(detailApp as any).status === 'running' && (detailApp as any).web_path"
                type="primary"
                size="large"
                @click="openAppWeb(detailApp as any)"
              >打开 Web 界面</n-button>
              <n-button
                size="large"
                :loading="actionLoadingId === detailApp.id"
                @click="toggleApp(detailApp as any)"
              >{{ (detailApp as any).status === 'running' ? '停止应用' : '启动应用' }}</n-button>
            </div>
          </template>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useComponentsStore } from '@/stores/components'
import { useStoreStore } from '@/stores/store'
import { useSettingsStore } from '@/stores/settings'
import type { StoreApp, ComponentInfo } from '@/types'

const message = useMessage()
const componentsStore = useComponentsStore()
const storeStore = useStoreStore()
const settingsStore = useSettingsStore()

const tabs = [
  { label: '商店', value: 'store' as const },
  { label: '已安装', value: 'installed' as const },
]

const activeTab = ref<'store' | 'installed'>('store')
const search = ref('')
const category = ref('all')
const detailVisible = ref(false)
const detailApp = ref<StoreApp | ComponentInfo | null>(null)
const isStoreApp = ref(false)
const actionLoadingId = ref<string | null>(null)

const categoryLabels: Record<string, string> = {
  media: '媒体',
  download: '下载',
  tool: '工具',
  network: '网络',
  database: '数据库',
  security: '安全',
}

function categoryLabel(cat: string): string {
  return categoryLabels[cat] || cat
}

const filteredStoreApps = computed(() => {
  const q = search.value.trim().toLowerCase()
  return storeStore.apps.filter((app) => {
    const matchSearch = !q || app.name.toLowerCase().includes(q) || (app.description || '').toLowerCase().includes(q)
    const matchCategory = category.value === 'all' || app.categories?.includes(category.value)
    return matchSearch && matchCategory
  })
})

const installedApps = computed(() => {
  const q = search.value.trim().toLowerCase()
  return componentsStore.apps.filter((app) => {
    if (!q) return true
    return app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q)
  })
})

const tones: Array<'blue' | 'green' | 'orange' | 'red' | 'violet' | 'slate'> = ['blue', 'green', 'orange', 'violet', 'slate', 'red']

function appTone(id: string): 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'slate' {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return tones[Math.abs(hash) % tones.length]
}

function formatTime(iso: string): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

function openStoreDetail(app: StoreApp) {
  detailApp.value = app
  isStoreApp.value = true
  detailVisible.value = true
}

function openInstalledDetail(app: ComponentInfo) {
  detailApp.value = app
  isStoreApp.value = false
  detailVisible.value = true
}

async function installApp(app: StoreApp) {
  try {
    await storeStore.installApp(app.id)
    message.success(`正在安装 ${app.name}`)
    await componentsStore.fetch()
  } catch (e: any) {
    message.error(e.message || '安装失败')
  }
}

async function toggleApp(app: ComponentInfo) {
  actionLoadingId.value = app.id
  try {
    if (app.status === 'running') {
      await storeStore.stopApp(app.id)
      message.success('已停止')
    } else {
      await storeStore.startApp(app.id)
      message.success('已启动')
    }
    setTimeout(() => componentsStore.fetch(), 800)
  } catch (e: any) {
    message.error(e.message || '操作失败')
  } finally {
    actionLoadingId.value = null
  }
}

function openAppWeb(app: ComponentInfo) {
  const path = app.web_path || '/'
  window.open(`/app/${app.id}${path}`, '_blank')
}

function startPolling() {
  componentsStore.stopPolling()
  componentsStore.startPolling(settingsStore.refreshInterval)
}

onMounted(() => {
  storeStore.fetchApps()
  componentsStore.fetch()
  startPolling()
})

onUnmounted(() => {
  componentsStore.stopPolling()
})

watch(() => settingsStore.refreshInterval, () => {
  startPolling()
})
</script>

<style scoped>
.apps-page { padding-top: 12px; }

.apps-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 24px;
}

.tab-switch {
  display: flex;
  gap: 4px;
  background: var(--pnos-surface-soft);
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  border: 0;
  background: transparent;
  padding: 7px 16px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  color: var(--pnos-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: var(--pnos-transition);
}

.tab-btn:hover { color: var(--pnos-text); }

.tab-btn.active {
  background: var(--pnos-surface);
  color: var(--pnos-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-count {
  background: var(--pnos-primary-soft);
  color: var(--pnos-primary);
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

.apps-search {
  width: 280px;
}

.tab-content { min-height: 400px; }

.category-pills {
  display: flex;
  gap: 7px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.pill {
  border: 0;
  background: transparent;
  color: var(--pnos-muted);
  border-radius: 9px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: var(--pnos-transition);
}

.pill:hover { color: var(--pnos-text); background: var(--pnos-surface-soft); }

.pill.active {
  color: var(--pnos-primary);
  background: var(--pnos-primary-soft);
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.app-card {
  padding: 18px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
}

.app-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.app-card-title {
  margin: 16px 0 6px;
  font-size: 16px;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.app-card-desc {
  margin: 0;
  color: var(--pnos-muted);
  font-size: 12px;
  line-height: 1.6;
  flex: 1;
}

.app-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.app-version {
  color: var(--pnos-subtle);
  font-size: 11px;
  font-family: 'SF Mono', Monaco, monospace;
}

.installed-list {
  overflow: hidden;
}

.installed-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-top: 1px solid var(--pnos-border);
  cursor: pointer;
  transition: background 0.15s ease;
}

.installed-row:first-child { border-top: 0; }
.installed-row:hover { background: #fafbfc; }

.installed-info {
  flex: 1;
  min-width: 0;
}

.installed-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.installed-meta {
  display: block;
  color: var(--pnos-muted);
  margin-top: 3px;
  font-size: 11.5px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.installed-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.detail-panel {
  width: min(720px, calc(100vw - 32px));
  padding: 28px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.detail-title-group {
  flex: 1;
  min-width: 0;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.025em;
}

.detail-desc {
  margin: 6px 0 8px;
  color: var(--pnos-muted);
  font-size: 13px;
}

.detail-close {
  flex-shrink: 0;
}

.detail-body {
  padding-top: 4px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 28px;
  margin-bottom: 24px;
}

.detail-info-block h4 {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--pnos-muted);
  font-weight: 600;
}

.detail-info-block p {
  margin: 6px 0;
  color: var(--pnos-text);
  font-size: 13px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

@media (max-width: 900px) {
  .app-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .apps-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .apps-search { width: 100%; }
  .app-grid { grid-template-columns: 1fr; }
  .installed-row { flex-wrap: wrap; }
  .installed-actions { width: 100%; }
}
</style>
