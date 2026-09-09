<template>
  <div class="pnos-page settings-page">
    <PageHeader title="设置" description="配置你的服务器" eyebrow="设置" />

    <!-- 外观 -->
    <section class="settings-section">
      <SectionHeading title="外观" description="主题与界面显示" />
      <div class="setting-card pnos-surface">
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">主题模式</strong>
            <span class="setting-row-desc">选择浅色或深色界面</span>
          </div>
          <n-segmented
            :value="settingsStore.theme"
            :options="themeOptions"
            @update:value="handleThemeChange"
          />
        </div>
      </div>
    </section>

    <!-- 监控 -->
    <section class="settings-section">
      <SectionHeading title="监控" description="数据刷新与告警阈值" />
      <div class="setting-card pnos-surface">
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">数据刷新间隔</strong>
            <span class="setting-row-desc">仪表盘和应用状态的自动刷新频率</span>
          </div>
          <n-select
            :value="settingsStore.refreshInterval"
            :options="refreshIntervalOptions"
            style="width: 140px"
            @update:value="handleRefreshIntervalChange"
          />
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">CPU 告警阈值</strong>
            <span class="setting-row-desc">使用率超过此值时触发告警</span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.cpuAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              :disabled="!backendSupported"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.cpuAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.cpuAlertThreshold }}%</span>
            <BackendBadge />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">内存告警阈值</strong>
            <span class="setting-row-desc">使用率超过此值时触发告警</span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.memoryAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              :disabled="!backendSupported"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.memoryAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.memoryAlertThreshold }}%</span>
            <BackendBadge />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">磁盘告警阈值</strong>
            <span class="setting-row-desc">使用率超过此值时触发告警</span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.diskAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              :disabled="!backendSupported"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.diskAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.diskAlertThreshold }}%</span>
            <BackendBadge />
          </div>
        </div>
      </div>
    </section>

    <!-- 应用商店 -->
    <section class="settings-section">
      <SectionHeading title="应用商店" description="源管理与更新策略">
        <n-button size="small" @click="showAddSource = true" :disabled="!sourceMutationsSupported">
          添加源
        </n-button>
      </SectionHeading>
      <div class="setting-card pnos-surface">
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">自动更新应用</strong>
            <span class="setting-row-desc">发现新版本时自动更新已安装的应用</span>
          </div>
          <div class="setting-control">
            <n-switch
              :value="settingsStore.autoUpdateApps"
              :disabled="!backendSupported"
              @update:value="(v: boolean) => settingsStore.autoUpdateApps = v"
            />
            <BackendBadge />
          </div>
        </div>
      </div>

      <div v-if="storeStore.sources.length" class="source-list pnos-surface" style="margin-top: 12px">
        <div v-for="source in storeStore.sources" :key="source.id" class="source-row">
          <div class="source-info">
            <strong class="source-name">{{ source.name }}</strong>
            <span class="source-url mono">{{ source.url }}</span>
          </div>
          <div class="source-status">
            <n-tag :type="source.enabled ? 'success' : 'default'" size="small" round>
              {{ source.enabled ? '已启用' : '已禁用' }}
            </n-tag>
          </div>
          <div class="source-actions">
            <n-button size="small" quaternary :loading="refreshingId === source.id" @click="refreshSource(source)">
              刷新
            </n-button>
            <n-button size="small" quaternary type="error" :disabled="!sourceMutationsSupported" @click="removeSource(source)">
              删除
            </n-button>
          </div>
        </div>
      </div>

      <n-alert v-if="!sourceMutationsSupported" type="warning" :show-icon="true" class="source-notice">
        当前后端仅支持源列表查看与单源刷新，添加 / 删除 / 启用禁用功能待后端 API 支持后开放。
      </n-alert>
    </section>

    <!-- 网络 -->
    <section class="settings-section">
      <SectionHeading title="网络" description="API 端口与代理配置" />
      <div class="setting-card pnos-surface">
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">API 监听端口</strong>
            <span class="setting-row-desc">pnos-runtime HTTP 服务监听端口</span>
          </div>
          <div class="setting-control">
            <n-input :value="runtimePort" disabled style="width: 120px" />
            <BackendBadge />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">反向代理前缀</strong>
            <span class="setting-row-desc">应用 Web 界面的反向代理路径前缀</span>
          </div>
          <div class="setting-control">
            <n-input value="/app" disabled style="width: 120px" />
            <BackendBadge />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">CORS 允许来源</strong>
            <span class="setting-row-desc">允许跨域访问的来源地址列表</span>
          </div>
          <div class="setting-control">
            <n-tag size="small">*</n-tag>
            <BackendBadge />
          </div>
        </div>
      </div>
    </section>

    <!-- 系统信息 -->
    <section class="settings-section">
      <SectionHeading title="系统信息" description="只读信息" />
      <div class="info-card pnos-surface">
        <div class="info-row">
          <span class="info-label">服务器名称</span>
          <span class="info-value">{{ systemStore.serverName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">系统版本</span>
          <span class="info-value mono">pnos {{ systemStore.version }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">操作系统</span>
          <span class="info-value">{{ systemStore.info?.os }} {{ systemStore.info?.os_version }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">内核</span>
          <span class="info-value mono">{{ systemStore.info?.kernel || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">架构</span>
          <span class="info-value mono">{{ systemStore.info?.arch }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CPU</span>
          <span class="info-value">{{ systemStore.info?.cpu_model }} · {{ systemStore.cpuCores }} 核</span>
        </div>
        <div class="info-row">
          <span class="info-label">总内存</span>
          <span class="info-value mono">{{ formatBytes(systemStore.memoryTotal) }}</span>
        </div>
        <div class="info-row last">
          <span class="info-label">运行时长</span>
          <span class="info-value">{{ systemStore.uptimeText }}</span>
        </div>
      </div>
    </section>

    <!-- 添加源弹窗 -->
    <n-modal v-model:show="showAddSource" :mask-closable="true">
      <div class="add-source-panel pnos-surface">
        <div class="detail-header">
          <h2 class="detail-title">添加应用源</h2>
          <n-button quaternary circle @click="showAddSource = false">×</n-button>
        </div>
        <n-divider />
        <div class="form-group">
          <label class="form-label">名称</label>
          <n-input v-model:value="newSource.name" placeholder="例如：官方源" />
        </div>
        <div class="form-group">
          <label class="form-label">地址</label>
          <n-input v-model:value="newSource.url" placeholder="https://example.com/index.json" />
        </div>
        <div class="form-actions">
          <n-button @click="showAddSource = false">取消</n-button>
          <n-button type="primary" @click="confirmAddSource" :disabled="!newSource.name || !newSource.url">
            添加
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, defineComponent } from 'vue'
import { useMessage } from 'naive-ui'
import PageHeader from '@/components/PageHeader.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useSystemStore } from '@/stores/system'
import { useStoreStore } from '@/stores/store'
import { useSettingsStore, type ThemeMode } from '@/stores/settings'
import type { StoreSource } from '@/types'

const message = useMessage()
const systemStore = useSystemStore()
const storeStore = useStoreStore()
const settingsStore = useSettingsStore()

// 后端暂不支持的功能标记
const backendSupported = false
const sourceMutationsSupported = false

const runtimePort = '8080'

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

const refreshIntervalOptions = [
  { label: '3 秒', value: 3000 },
  { label: '5 秒', value: 5000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
]

const showAddSource = ref(false)
const refreshingId = ref<string | null>(null)
const newSource = reactive({ name: '', url: '' })

// 待后端支持标签组件
const BackendBadge = defineComponent({
  setup() {
    return () => h('span', { class: 'backend-badge' }, '待后端')
  },
})

function handleThemeChange(value: string | number) {
  settingsStore.applyTheme(value as ThemeMode)
  message.success(`已切换到${value === 'dark' ? '深色' : '浅色'}主题`)
}

function handleRefreshIntervalChange(value: number | null) {
  if (value) {
    settingsStore.refreshInterval = value
    message.success(`刷新间隔已设为 ${value / 1000} 秒`)
  }
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}

async function refreshSource(source: StoreSource) {
  refreshingId.value = source.id
  try {
    await storeStore.refreshSource(source.id)
    message.success('刷新成功')
  } catch (e: any) {
    message.error(e.message || '刷新失败')
  } finally {
    refreshingId.value = null
  }
}

function removeSource(source: StoreSource) {
  message.info(`删除源「${source.name}」功能待后端支持`)
}

function confirmAddSource() {
  message.info('添加源功能待后端支持')
  showAddSource.value = false
  newSource.name = ''
  newSource.url = ''
}

onMounted(() => {
  systemStore.fetchInfo()
  storeStore.fetchSources()
})
</script>

<style scoped>
.settings-page { padding-top: 12px; }

.settings-section { margin-bottom: 36px; }

.setting-card { overflow: hidden; }

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.setting-row-info { flex: 1; min-width: 0; }

.setting-row-title {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
}

.setting-row-desc {
  display: block;
  color: var(--pnos-muted);
  margin-top: 3px;
  font-size: 11.5px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.setting-divider { margin: 0; }

.threshold-value {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 42px;
  text-align: right;
}

.backend-badge {
  font-size: 10px;
  font-weight: 600;
  color: var(--pnos-warning);
  background: var(--pnos-warning-soft);
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
}

.source-list { overflow: hidden; margin-top: 12px; }

.source-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-top: 1px solid var(--pnos-border);
}

.source-row:first-child { border-top: 0; }

.source-info { flex: 1; min-width: 0; }

.source-name {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
}

.source-url {
  display: block;
  color: var(--pnos-muted);
  margin-top: 3px;
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-status { flex-shrink: 0; }

.source-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.source-notice { margin-top: 12px; }

.info-card { overflow: hidden; }

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  border-top: 1px solid var(--pnos-border);
}

.info-row:first-child { border-top: 0; }
.info-row.last { border-bottom: 0; }

.info-label {
  color: var(--pnos-muted);
  font-size: 13px;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.info-value.mono {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12.5px;
}

.add-source-panel {
  width: min(480px, calc(100vw - 32px));
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-title {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.02em;
}

.form-group { margin-bottom: 18px; }

.form-label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--pnos-muted);
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.mono {
  font-family: 'SF Mono', Monaco, monospace;
}

@media (max-width: 640px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .setting-control { width: 100%; }
  .source-row { flex-wrap: wrap; }
  .source-actions { width: 100%; }
}
</style>
