<template>
  <div class="pnos-page">
    <PageHeader title="设置" description="配置你的服务器" />

    <n-input v-model:value="search" placeholder="搜索设置" clearable class="settings-search" />

    <div class="settings-grid">
      <SettingsGroup title="系统">
        <SettingRow title="通用" description="名称、地区和基本系统信息" icon="⚙" @click="open('general')" />
        <SettingRow title="更新" description="系统版本和更新偏好" icon="↻" last @click="open('updates')" />
      </SettingsGroup>
      <SettingsGroup title="硬件与资源">
        <SettingRow title="存储" description="磁盘、挂载和存储池" icon="▤" @click="open('storage')" />
        <SettingRow title="网络" description="网络接口和连接" icon="◉" last @click="open('network')" />
      </SettingsGroup>
      <SettingsGroup title="用户与安全">
        <SettingRow title="用户与权限" description="账户和访问控制" icon="◎" @click="open('users')" />
        <SettingRow title="安全" description="认证和防护" icon="⚿" last @click="open('security')" />
      </SettingsGroup>
      <SettingsGroup title="应用">
        <SettingRow title="应用商店" description="源和仓库" icon="▦" @click="open('store')" />
        <SettingRow title="默认配置" description="新安装应用的默认设置" icon="☰" last @click="open('defaults')" />
      </SettingsGroup>
      <SettingsGroup title="关于">
        <SettingRow title="关于 pnos" :description="`${systemStore.info?.version || 'v0.1.0'} · MIT 协议`" icon="ℹ" last @click="open('about')" />
      </SettingsGroup>
    </div>

    <n-modal v-model:show="detailVisible">
      <div class="detail-panel pnos-surface">
        <div class="detail-header"><div><div class="pnos-eyebrow">设置</div><h2>{{ detailTitle }}</h2><p>{{ detailDescription }}</p></div><n-button quaternary circle @click="detailVisible = false">×</n-button></div>
        <n-divider />
        <div v-if="selected === 'general'" class="detail-content">
          <n-descriptions :column="1" label-placement="left">
            <n-descriptions-item label="名称">{{ systemStore.info?.name || 'pnos' }}</n-descriptions-item>
            <n-descriptions-item label="版本">{{ systemStore.info?.version || '-' }}</n-descriptions-item>
            <n-descriptions-item label="操作系统">{{ systemStore.info?.os || '-' }}</n-descriptions-item>
            <n-descriptions-item label="架构">{{ systemStore.info?.arch || '-' }}</n-descriptions-item>
          </n-descriptions>
        </div>
        <div v-else-if="selected === 'store'" class="detail-content"><n-data-table :columns="sourceColumns" :data="sources" :loading="loadingSources" :bordered="false" /></div>
        <div v-else class="placeholder-detail"><div class="placeholder-icon">○</div><strong>{{ detailTitle }}</strong><p>该功能将在后续版本中集成。</p></div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useSystemStore } from '@/stores/system'
import { getStoreSources } from '@/api'
import PageHeader from '@/components/PageHeader.vue'

const SettingsGroup = defineComponent({ props: { title: { type: String, required: true } }, setup(props, { slots }) { return () => h('section', { class: 'settings-group' }, [h('div', { class: 'group-title', style: 'padding:0 0 8px 16px;' }, props.title), h('div', { class: 'group-card pnos-surface' }, slots.default?.())]) } })
const SettingRow = defineComponent({ props: { title: { type: String, required: true }, description: { type: String, required: true }, icon: { type: String, default: '○' }, last: { type: Boolean, default: false } }, emits: ['click'], setup(props, { emit }) { return () => h('button', { class: ['setting-row', { 'no-border': props.last }], onClick: () => emit('click') }, [h('div', { class: 'setting-icon' }, props.icon), h('div', { class: 'setting-copy' }, [h('div', { class: 'setting-title' }, props.title), h('div', { class: 'setting-desc' }, props.description)])]) } })

const systemStore = useSystemStore()
const sources = ref<any[]>([])
const loadingSources = ref(false)
const search = ref('')
const selected = ref('general')
const detailVisible = ref(false)

const detailTitle = computed(() => ({ general: '通用', updates: '更新', storage: '存储', network: '网络', users: '用户与权限', security: '安全', store: '应用商店', defaults: '默认配置', about: '关于 pnos' } as Record<string, string>)[selected.value] || '设置')
const detailDescription = computed(() => ({ general: '名称和系统信息', updates: '保持 pnos 最新', storage: '管理磁盘和存储', network: '配置网络连接', users: '管理账户和访问', security: '认证和系统防护', store: '配置应用源', defaults: '选择应用默认设置', about: 'pnos 系统 Web 界面' } as Record<string, string>)[selected.value] || '')
const sourceColumns = [{ title: '名称', key: 'name' }, { title: '地址', key: 'url' }, { title: '状态', key: 'enabled', render: (row: any) => row.enabled ? '已启用' : '已禁用' }]

async function fetchSources() { loadingSources.value = true; try { const res: any = await getStoreSources(); sources.value = res.data || [] } finally { loadingSources.value = false } }
function open(key: string) { selected.value = key; detailVisible.value = true }

onMounted(() => { systemStore.fetchInfo(); fetchSources() })

void search
</script>

<style scoped>
.settings-search { max-width:640px; margin-bottom:28px; }
.settings-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px 20px; }
.settings-group { display:flex; flex-direction:column; }
.group-title { color:#8e8e93; font-size:12px; font-weight:500; letter-spacing:.02em; }
.group-card { background:white; border-radius:12px; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.setting-row { width:100%; border:0; border-bottom:1px solid #f2f2f7; background:transparent; display:flex; align-items:center; text-align:left; gap:12px; padding:12px 16px; cursor:pointer; transition:background .15s ease; }
.setting-row:hover { background:#f9f9fb; }
.setting-row.no-border { border-bottom:0; }
.setting-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(145deg,#e8f0fe,#f0eafe); color:#3478f6; display:grid; place-items:center; flex:none; font-size:14px; }
.setting-copy { flex:1; min-width:0; }
.setting-title { display:block; font-size:14px; font-weight:500; color:#1c1c1e; }
.setting-desc { display:block; color:#8e8e93; margin-top:2px; font-size:12px; line-height:1.4; }
.detail-panel { width:min(720px, calc(100vw - 32px)); padding:28px; }
.detail-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.detail-header h2 { margin:0; font-size:22px; letter-spacing:-.025em; }
.detail-header p { margin:6px 0 0; color:var(--pnos-muted); font-size:12px; }
.detail-content { min-height:150px; }
.placeholder-detail { min-height:180px; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; }
.placeholder-icon { width:46px; height:46px; display:grid; place-items:center; background:#f2f4f7; border-radius:14px; margin-bottom:12px; color:#69717c; }
.placeholder-detail strong { font-size:14px; }
.placeholder-detail p { color:var(--pnos-muted); font-size:12px; max-width:360px; line-height:1.6; }
@media (max-width:860px) { .settings-grid { grid-template-columns:1fr; } }
</style>
