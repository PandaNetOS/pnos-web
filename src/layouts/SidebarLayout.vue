<template>
  <n-layout class="app-shell" has-sider>
    <n-layout-sider
      bordered
      :width="228"
      :collapsed-width="0"
      :collapsed="isMobile"
      :show-trigger="false"
      class="app-sidebar"
    >
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
        <div class="health-row">
          <span class="health-dot" />
          <span>系统运行正常</span>
        </div>
        <div class="version">{{ systemStore.info?.version || 'v0.1.0' }}</div>
      </div>
      </div>
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="topbar">
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
            <div class="top-status"><span class="health-dot" /> 运行正常</div>
            <n-button quaternary circle aria-label="Account">
              <span class="avatar">P</span>
            </n-button>
          </div>
        </div>
      </n-layout-header>

      <n-drawer v-model:show="mobileDrawer" placement="left" :width="260">
        <div class="mobile-drawer">
          <div class="brand mobile-drawer-brand">
            <div class="brand-mark"><span /></div>
            <div><div class="brand-name">pnos</div><div class="brand-caption">服务器，更简单</div></div>
          </div>
          <n-menu :value="activeMenu" :options="menuOptions" @update:value="handleMobileMenuClick" />
        </div>
      </n-drawer>

      <n-layout-content class="content-area">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { useSystemStore } from '@/stores/system'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const search = ref('')
const mobileDrawer = ref(false)
const isMobile = ref(false)

const makeIcon = (glyph: string) => () => h(NIcon, { size: 17 }, { default: () => h('span', { class: 'menu-glyph' }, glyph) })

const menuOptions = [
  { label: '概览', key: '/dashboard', icon: makeIcon('⌂') },
  { label: '应用', key: '/store', icon: makeIcon('⊞') },
  { label: '设置', key: '/settings', icon: makeIcon('⚙') },
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/dashboard')) return '/dashboard'
  if (route.path.startsWith('/store') || route.path.startsWith('/apps')) return '/store'
  return '/settings'
})

function handleMenuClick(key: string) { router.push(key) }
function handleMobileMenuClick(key: string) { mobileDrawer.value = false; router.push(key) }
function updateViewport() { isMobile.value = window.innerWidth < 900 }

onMounted(() => {
  systemStore.fetchInfo()
  updateViewport()
  window.addEventListener('resize', updateViewport)
})
</script>

<style scoped>
.app-shell { min-height: 100vh; height: 100vh; background: var(--pnos-bg); }
.app-shell :deep(.n-layout) { height: 100vh; }
.app-shell :deep(.n-layout-sider) { height: 100vh; }
.app-sidebar { position: relative; background: rgba(255,255,255,.92); backdrop-filter: blur(18px); padding:0; height:100vh; overflow:hidden; }
.app-sidebar :deep(.n-layout-sider-scroll-container) { height:100%; overflow:hidden; }
.sidebar-inner { display:flex; flex-direction:column; height:100vh; min-height:100vh; overflow:hidden; }
.brand { display:flex; align-items:center; gap:11px; padding:22px 20px 18px; flex-shrink:0; }
.brand-name { font-size:18px; font-weight:700; letter-spacing:-.025em; }
.brand-caption { margin-top:2px; color:var(--pnos-subtle); font-size:11px; }
.brand-mark { width:34px; height:34px; border-radius:11px; background:#16181d; display:grid; place-items:center; position:relative; flex:none; }
.brand-mark::before, .brand-mark::after, .brand-mark span { content:""; position:absolute; background:white; border-radius:99px; }
.brand-mark::before { width:17px; height:11px; top:9px; left:8px; }
.brand-mark::after { width:7px; height:7px; top:11px; left:11px; box-shadow:9px 0 0 white; }
.brand-mark span { width:12px; height:6px; bottom:7px; left:11px; }
.brand-mark.small { width:29px; height:29px; border-radius:9px; }
.main-menu { padding:8px 10px; flex:1; overflow-y:auto; min-height:0; }
.sidebar-footer { padding:14px 18px 20px; flex-shrink:0; margin-top:auto; background:rgba(255,255,255,.95); }
.health-row { display:flex; align-items:center; gap:7px; font-size:12px; font-weight:600; color:#4d5561; }
.health-dot { width:7px; height:7px; border-radius:50%; background:var(--pnos-success); display:inline-block; box-shadow:0 0 0 3px var(--pnos-success-soft); }
.version { color:var(--pnos-subtle); font-size:11px; margin-top:8px; }
.topbar { height:var(--pnos-header-height); background:rgba(255,255,255,.8); backdrop-filter:blur(18px); }
.topbar-inner { height:100%; display:flex; align-items:center; gap:20px; padding:0 26px; }
.global-search { width:min(460px, 46vw); }
.search-symbol { color:var(--pnos-subtle); font-size:14px; }
.topbar-actions { margin-left:auto; display:flex; align-items:center; gap:8px; }
.top-status { display:flex; align-items:center; gap:8px; font-size:12px; color:#5c6571; font-weight:600; }
.avatar { width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:#3478f6; color:white; font-size:12px; font-weight:700; }
.mobile-brand { display:none; align-items:center; gap:8px; }
.mobile-drawer { padding: 8px 12px 20px; }
.mobile-drawer-brand { padding-left: 8px; }
.content-area { padding:28px 34px; }
.menu-glyph { display:block; width:16px; text-align:center; color:#68707c; font-size:16px; }
:deep(.n-menu-item-content) { border-radius:10px; }
:deep(.n-menu-item-content--selected) { background:var(--pnos-primary-soft); color:var(--pnos-primary); }
:deep(.n-menu-item-content--selected .menu-glyph) { color:var(--pnos-primary); }
@media (max-width: 900px) {
  .app-sidebar { display:none; }
  .mobile-brand { display:flex; }
  .global-search { flex:1; width:auto; }
  .content-area { padding:20px 16px; }
  .top-status { display:none; }
}
</style>
