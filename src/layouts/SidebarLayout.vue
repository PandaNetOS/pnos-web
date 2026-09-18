<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <div class="sidebar-inner">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><span /></div>
        <div>
          <div class="brand-name">pnos</div>
          <div class="brand-caption">服务器，更简单</div>
        </div>
      </div>

      <n-menu
        :value="activeMenu"
        :options="menuOptions"
        class="main-menu"
        @update:value="handleMenuClick"
      />

      <div class="sidebar-footer">
        <div class="health-row" :class="`is-${systemStore.systemStatus}`">
          <span class="health-dot" />
          <span>{{ systemStore.statusText }}</span>
        </div>
        <div class="version">{{ systemStore.version || 'v0.1.0' }}</div>
      </div>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="mobile-brand">
            <n-button quaternary circle aria-label="Menu" @click="mobileDrawer = true">☰</n-button>
            <div class="brand-mark small"><span /></div>
            <strong>pnos</strong>
          </div>

          <n-input
            v-model:value="search"
            class="global-search"
            placeholder="搜索"
            clearable
          >
            <template #prefix><span class="search-symbol">⌘</span></template>
          </n-input>

          <div class="topbar-actions">
            <div class="top-status" :class="`is-${systemStore.systemStatus}`">
              <span class="health-dot" /> {{ systemStore.statusText }}
            </div>
            <n-button quaternary circle aria-label="Account">
              <span class="avatar">P</span>
            </n-button>
          </div>
        </div>
      </header>

      <div class="content-area">
        <simple-bar class="content-scrollbar">
          <router-view />
        </simple-bar>
      </div>
    </div>

    <n-drawer v-model:show="mobileDrawer" placement="left" :width="260">
      <div class="mobile-drawer">
        <div class="brand mobile-drawer-brand">
          <div class="brand-mark"><span /></div>
          <div><div class="brand-name">pnos</div><div class="brand-caption">服务器，更简单</div></div>
        </div>
        <n-menu :value="activeMenu" :options="menuOptions" @update:value="handleMobileClick" />
      </div>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import SimpleBar from 'simplebar-vue'
import 'simplebar/dist/simplebar.min.css'
import { useSystemStore } from '@/stores/system'
import { useComponentsStore } from '@/stores/components'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const componentsStore = useComponentsStore()
const settingsStore = useSettingsStore()
const search = ref('')
const mobileDrawer = ref(false)
const isMobile = ref(false)

const makeIcon = (glyph: string) => () => h(NIcon, { size: 17 }, { default: () => h('span', { class: 'menu-glyph' }, glyph) })

/** 应用快捷入口：运行中、有 web_path、且未被开关隐藏的应用（manifest/注册表驱动，零按应用代码） */
const appShortcuts = computed(() =>
  componentsStore.apps.filter(
    (a) => a.status === 'running' && a.web_path && settingsStore.isAppVisible(a.id),
  ),
)

const menuOptions = computed(() => [
  { label: '概览', key: '/dashboard', icon: makeIcon('⌂') },
  { label: '应用', key: '/apps', icon: makeIcon('⊞') },
  { label: '设置', key: '/settings', icon: makeIcon('⚙') },
  ...(appShortcuts.value.length
    ? [
        {
          type: 'group' as const,
          label: '应用快捷入口',
          key: 'app-shortcuts',
          children: appShortcuts.value.map((a) => ({
            label: a.name,
            key: `/apps/${a.id}`,
            icon: makeIcon('▣'),
          })),
        },
      ]
    : []),
])

const activeMenu = computed(() => {
  if (route.path.startsWith('/dashboard')) return '/dashboard'
  // 应用壳（/apps/<id>）要高亮对应快捷入口，必须先于 /apps 列表判断
  if (route.path.startsWith('/apps/')) return route.path
  if (route.path.startsWith('/apps') || route.path.startsWith('/store')) return '/apps'
  return '/settings'
})

function handleMenuClick(key: string) { router.push(key) }
function handleMobileClick(key: string) { mobileDrawer.value = false; router.push(key) }
function updateViewport() { isMobile.value = window.innerWidth < 900 }

/**
 * 侧栏是最常驻的组件，系统指标轮询由它统一持有：
 * 这样任何页面都能看到真实的系统状态，其他视图不要再调用 systemStore 的
 * startPolling/stopPolling，否则离开该视图会顺带把这里的轮询停掉。
 */
function startStatusPolling() {
  systemStore.startPolling(settingsStore.refreshInterval)
}

onMounted(() => {
  systemStore.fetchInfo()
  systemStore.fetchStats()
  componentsStore.fetch()
  startStatusPolling()
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  systemStore.stopPolling()
  window.removeEventListener('resize', updateViewport)
})

watch(() => settingsStore.refreshInterval, () => {
  startStatusPolling()
})
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--pnos-bg);
}
.app-sidebar {
  width: var(--pnos-sidebar-width);
  flex-shrink: 0;
  background: var(--pnos-glass);
  backdrop-filter: blur(18px);
  border-right: 1px solid var(--pnos-divider);
  overflow: hidden;
}
.sidebar-inner { display:flex; flex-direction:column; height:100%; overflow:hidden; }
.brand { display:flex; align-items:center; gap:11px; padding:22px 20px 18px; flex-shrink:0; }
.brand-name { font-size:18px; font-weight:700; letter-spacing:-.025em; }
.brand-caption { margin-top:2px; color:var(--pnos-subtle); font-size:11px; }
.brand-mark { width:34px; height:34px; border-radius:11px; background:var(--pnos-brandmark-bg); display:grid; place-items:center; position:relative; flex:none; transition:var(--pnos-transition); }
.brand-mark::before, .brand-mark::after, .brand-mark span { content:""; position:absolute; background:var(--pnos-brandmark-shape); border-radius:99px; }
.brand-mark::before { width:17px; height:11px; top:9px; left:8px; }
.brand-mark::after { width:7px; height:7px; top:11px; left:11px; box-shadow:9px 0 0 var(--pnos-brandmark-shape); }
.brand-mark span { width:12px; height:6px; bottom:7px; left:11px; }
.brand-mark.small { width:29px; height:29px; border-radius:9px; }
.main-menu { padding:8px 10px; flex:1; overflow-y:auto; min-height:0; }
.sidebar-footer { padding:14px 18px 20px; flex-shrink:0; margin-top:auto; background:var(--pnos-glass-strong); transition:var(--pnos-transition); }
.health-row { display:flex; align-items:center; gap:7px; font-size:12px; font-weight:600; color:var(--pnos-text-soft); }
.health-dot { width:7px; height:7px; border-radius:50%; background:var(--pnos-success); display:inline-block; box-shadow:0 0 0 3px var(--pnos-success-soft); }
.health-row.is-warning .health-dot, .top-status.is-warning .health-dot { background:var(--pnos-warning); box-shadow:0 0 0 3px var(--pnos-warning-soft); }
.health-row.is-danger .health-dot, .top-status.is-danger .health-dot { background:var(--pnos-danger); box-shadow:0 0 0 3px var(--pnos-danger-soft); }
.health-row.is-offline .health-dot, .top-status.is-offline .health-dot { background:var(--pnos-subtle); box-shadow:0 0 0 3px var(--pnos-surface-soft); }
.health-row.is-warning { color:var(--pnos-warning); }
.health-row.is-danger { color:var(--pnos-danger); }
.health-row.is-offline { color:var(--pnos-muted); }
.version { color:var(--pnos-subtle); font-size:11px; margin-top:8px; }

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.topbar {
  height: var(--pnos-header-height);
  flex-shrink: 0;
  background: var(--pnos-glass-soft);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--pnos-divider);
  overflow: hidden;
  transition: var(--pnos-transition);
}
.topbar-inner { height:100%; display:flex; align-items:center; gap:20px; padding:0 26px; }
.global-search { width:min(460px, 46vw); }
.search-symbol { color:var(--pnos-subtle); font-size:14px; }
.topbar-actions { margin-left:auto; display:flex; align-items:center; gap:8px; }
.top-status { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--pnos-text-soft-2); font-weight:600; }
.top-status.is-warning { color:var(--pnos-warning); }
.top-status.is-danger { color:var(--pnos-danger); }
.top-status.is-offline { color:var(--pnos-muted); }
.avatar { width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:#3478f6; color:white; font-size:12px; font-weight:700; }

.content-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.content-scrollbar { height: 100%; }
.content-scrollbar :deep(.simplebar-content) { padding:28px 34px; }
.content-scrollbar :deep(.simplebar-track.simplebar-vertical) { width: 20px; }
.content-scrollbar :deep(.simplebar-scrollbar) {
  width: 20px;
  min-height: 80px;
  max-height: 80px;
  height: 80px;
}
.content-scrollbar :deep(.simplebar-scrollbar::before) {
  background: var(--pnos-scrollbar);
  border-radius: 3px;
  opacity: 1;
  transition: background 0.2s ease;
}
.content-scrollbar :deep(.simplebar-hover .simplebar-scrollbar::before),
.content-scrollbar :deep(.simplebar-scrollbar:hover::before) {
  background: var(--pnos-scrollbar-hover);
}

.mobile-brand { display:none; align-items:center; gap:8px; }
.mobile-drawer { padding: 8px 12px 20px; }
.mobile-drawer-brand { padding-left: 8px; }
.menu-glyph { display:block; width:16px; text-align:center; color:var(--pnos-glyph); font-size:16px; }
:deep(.n-menu-item-content) { border-radius:10px; }
:deep(.n-menu-item-content--selected) { background:var(--pnos-primary-soft); color:var(--pnos-primary); }
:deep(.n-menu-item-content--selected .menu-glyph) { color:var(--pnos-primary); }
@media (max-width: 900px) {
  .app-sidebar { display:none; }
  .mobile-brand { display:flex; }
  .global-search { flex:1; width:auto; }
  .content-scrollbar :deep(.simplebar-content) { padding:20px 16px; }
  .top-status { display:none; }
}
</style>
