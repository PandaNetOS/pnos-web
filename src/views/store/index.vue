<template>
  <div class="pnos-page">
    <PageHeader title="应用商店" description="发现并安装服务器应用">
      <template #actions>
        <n-button quaternary @click="refresh">刷新</n-button>
      </template>
    </PageHeader>

    <div class="store-tools pnos-surface">
      <n-input v-model:value="search" clearable placeholder="搜索应用" class="store-search">
        <template #prefix>⌕</template>
      </n-input>
      <div class="category-pills">
        <button v-for="item in categoryPills" :key="item.value" :class="['pill', { active: category === item.value }]" @click="category = item.value">{{ item.label }}</button>
      </div>
    </div>

    <section class="store-section">
      <div class="section-title-row"><div><div class="pnos-section-title">精选</div><div class="section-subtitle">为新服务器精选的必备应用</div></div><span>{{ filteredApps.length }} 个应用</span></div>

      <n-grid :cols="3" :x-gap="14" :y-gap="14" responsive="screen">
        <n-gi v-for="app in featuredApps" :key="app.id" span="3 s:1 m:1">
          <article class="app-card pnos-surface" @click="showDetail(app)">
            <div class="app-card-head">
              <div class="app-logo"><span>{{ (app.name || 'A').slice(0, 1).toUpperCase() }}</span></div>
              <n-tag v-if="app.official" round size="small" type="info">官方</n-tag>
            </div>
            <h3>{{ app.name }}</h3>
            <p>{{ app.description || '实用的服务器服务' }}</p>
            <div class="app-card-footer"><span>v{{ app.version }}</span><n-button type="primary" secondary size="small" :loading="installing === app.id" @click.stop="install(app.id)">安装</n-button></div>
          </article>
        </n-gi>
      </n-grid>
    </section>

    <section v-if="restApps.length" class="store-section">
      <div class="section-title-row"><div><div class="pnos-section-title">全部应用</div></div></div>
      <div class="all-apps pnos-surface">
        <div v-for="app in restApps" :key="app.id" class="list-app" @click="showDetail(app)">
          <div class="app-logo small"><span>{{ (app.name || 'A').slice(0, 1).toUpperCase() }}</span></div>
          <div class="list-app-info"><strong>{{ app.name }}</strong><span>{{ app.description || '服务器应用' }}</span></div>
          <n-tag v-if="app.official" round size="small" type="info">官方</n-tag>
          <n-button type="primary" secondary size="small" :loading="installing === app.id" @click.stop="install(app.id)">安装</n-button>
        </div>
      </div>
    </section>

    <n-modal v-model:show="detailVisible" :mask-closable="true">
      <div v-if="selectedApp" class="detail-card pnos-surface">
        <div class="detail-hero"><div class="app-logo large"><span>{{ (selectedApp.name || 'A').slice(0, 1).toUpperCase() }}</span></div><div class="detail-title"><div class="detail-title-row"><h2>{{ selectedApp.name }}</h2><n-tag v-if="selectedApp.official" round size="small" type="info">官方</n-tag></div><p>{{ selectedApp.description || '服务器应用' }}</p><span class="rating">免费 · 开源</span></div><n-button type="primary" size="large" :loading="installing === selectedApp.id" @click="install(selectedApp.id)">安装</n-button></div>
        <n-divider />
        <div class="detail-grid"><div><h4>关于</h4><p>{{ selectedApp.description || '在 pnos 服务器上安装此应用，统一管理。' }}</p></div><div><h4>信息</h4><p>版本 {{ selectedApp.version }}</p><p v-if="selectedApp.image">{{ selectedApp.image }}</p></div></div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getStoreApps, installApp } from '@/api'
import { useMessage } from 'naive-ui'
import PageHeader from '@/components/PageHeader.vue'

type AppItem = { id: string; name: string; version: string; description?: string; image?: string; categories?: string[]; official?: boolean }
const message = useMessage()
const apps = ref<AppItem[]>([])
const search = ref('')
const category = ref('all')
const installing = ref('')
const detailVisible = ref(false)
const selectedApp = ref<AppItem | null>(null)
const categoryPills = [{ label: '全部', value: 'all' }, { label: '媒体', value: 'media' }, { label: '下载', value: 'download' }, { label: '工具', value: 'tool' }, { label: '网络', value: 'network' }]
const filteredApps = computed(() => apps.value.filter(app => {
  const q = search.value.trim().toLowerCase()
  const matchSearch = !q || app.name.toLowerCase().includes(q) || (app.description || '').toLowerCase().includes(q)
  const matchCategory = category.value === 'all' || app.categories?.includes(category.value)
  return matchSearch && matchCategory
}))
const featuredApps = computed(() => filteredApps.value.slice(0, 3))
const restApps = computed(() => filteredApps.value.slice(3))

async function fetchApps() { try { const res: any = await getStoreApps(); apps.value = res.data || [] } catch { message.error('加载应用失败') } }
async function install(id: string) { installing.value = id; try { await installApp(id); message.success('安装已开始') } catch { message.error('安装失败') } finally { installing.value = '' } }
function showDetail(app: AppItem) { selectedApp.value = app; detailVisible.value = true }
function refresh() { fetchApps(); message.success('应用目录已刷新') }
onMounted(fetchApps)
</script>

<style scoped>
.store-tools { padding:14px; margin-bottom:30px; }
.store-search { width:100%; }
.category-pills { display:flex; gap:7px; margin-top:12px; flex-wrap:wrap; }
.pill { border:0; background:transparent; color:#717783; border-radius:9px; padding:7px 12px; cursor:pointer; font-size:12px; font-weight:600; }
.pill.active { color:var(--pnos-primary); background:var(--pnos-primary-soft); }
.store-section { margin-top:24px; }
.section-title-row { display:flex; align-items:end; justify-content:space-between; margin-bottom:12px; }
.section-title-row > span, .section-subtitle { color:var(--pnos-muted); font-size:12px; }
.app-card { padding:18px; cursor:pointer; transition:transform .18s ease, box-shadow .18s ease; min-height:236px; }
.app-card:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(17,24,39,.08); }
.app-card-head { display:flex; align-items:flex-start; justify-content:space-between; }
.app-logo { width:54px; height:54px; border-radius:15px; display:grid; place-items:center; background:linear-gradient(145deg,#edf4ff,#f4f0ff); color:#3478f6; font-size:21px; font-weight:750; }
.app-logo.small { width:38px; height:38px; border-radius:11px; font-size:15px; }
.app-logo.large { width:76px; height:76px; border-radius:20px; font-size:30px; flex:none; }
.app-card h3 { margin:18px 0 6px; font-size:17px; letter-spacing:-.02em; }
.app-card p { margin:0; color:var(--pnos-muted); font-size:12px; line-height:1.6; min-height:38px; }
.app-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:18px; color:var(--pnos-muted); font-size:11px; }
.all-apps { overflow:hidden; }
.list-app { display:flex; align-items:center; gap:12px; padding:14px 16px; border-top:1px solid #f0f1f4; cursor:pointer; }
.list-app:first-child { border-top:0; }
.list-app:hover { background:#fafbfc; }
.list-app-info { flex:1; min-width:0; }
.list-app-info strong { display:block; font-size:13px; }
.list-app-info span { display:block; color:var(--pnos-muted); margin-top:3px; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.empty-store { color:var(--pnos-muted); text-align:center; padding:32px; font-size:13px; }
.detail-card { width:min(760px, calc(100vw - 32px)); padding:28px; }
.detail-hero { display:flex; align-items:center; gap:18px; }
.detail-title { flex:1; }
.detail-title-row { display:flex; align-items:center; gap:8px; }
.detail-title h2 { margin:0; font-size:24px; letter-spacing:-.03em; }
.detail-title p { margin:7px 0; color:var(--pnos-muted); font-size:13px; }
.rating { color:var(--pnos-muted); font-size:11px; }
.detail-grid { display:grid; grid-template-columns:1.4fr 1fr; gap:28px; }
.detail-grid h4 { margin:0 0 8px; font-size:13px; }
.detail-grid p { margin:6px 0; color:var(--pnos-muted); font-size:12px; line-height:1.6; }
@media (max-width:760px) { .detail-hero { align-items:flex-start; flex-wrap:wrap; } .detail-title { min-width:calc(100% - 100px); } .detail-grid { grid-template-columns:1fr; } }
</style>
