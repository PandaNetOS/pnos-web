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
          <n-radio-group
            :value="settingsStore.theme"
            size="small"
            @update:value="handleThemeChange"
          >
            <n-radio-button value="light">浅色</n-radio-button>
            <n-radio-button value="dark">深色</n-radio-button>
          </n-radio-group>
        </div>
      </div>
    </section>

    <!-- 监控 -->
    <section class="settings-section">
      <SectionHeading title="监控" description="刷新频率与告警阈值，直接作用于概览页" />
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
            <span class="setting-row-desc">
              当前 {{ systemStore.cpuUsage }}%。达到阈值概览页开始告警，超过
              {{ dangerLine(settingsStore.cpuAlertThreshold) }}% 升级为严重
            </span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.cpuAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.cpuAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.cpuAlertThreshold }}%</span>
            <n-tag :type="levelTagType(systemStore.cpuLevel)" size="small" round>
              {{ levelText(systemStore.cpuLevel) }}
            </n-tag>
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">内存告警阈值</strong>
            <span class="setting-row-desc">
              当前 {{ systemStore.memoryUsage }}%。达到阈值概览页开始告警，超过
              {{ dangerLine(settingsStore.memoryAlertThreshold) }}% 升级为严重
            </span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.memoryAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.memoryAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.memoryAlertThreshold }}%</span>
            <n-tag :type="levelTagType(systemStore.memoryLevel)" size="small" round>
              {{ levelText(systemStore.memoryLevel) }}
            </n-tag>
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">磁盘告警阈值</strong>
            <span class="setting-row-desc">
              当前 {{ systemStore.storageUsage }}%。达到阈值概览页开始告警，超过
              {{ dangerLine(settingsStore.diskAlertThreshold) }}% 升级为严重
            </span>
          </div>
          <div class="setting-control">
            <n-slider
              :value="settingsStore.diskAlertThreshold"
              :min="50"
              :max="100"
              :step="5"
              style="width: 160px"
              @update:value="(v: number) => settingsStore.diskAlertThreshold = v"
            />
            <span class="threshold-value">{{ settingsStore.diskAlertThreshold }}%</span>
            <n-tag :type="levelTagType(systemStore.storageLevel)" size="small" round>
              {{ levelText(systemStore.storageLevel) }}
            </n-tag>
          </div>
        </div>
      </div>
    </section>

    <!-- 应用商店 -->
    <section class="settings-section">
      <SectionHeading title="应用商店" description="当前生效的商店源" />
      <div class="setting-card pnos-surface">
        <div v-if="storeStore.sources.length">
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
              <n-button
                size="small"
                quaternary
                :loading="refreshingId === source.id"
                @click="refreshSource(source)"
              >
                刷新
              </n-button>
            </div>
          </div>
        </div>
        <div v-else class="source-row">
          <div class="source-info">
            <strong class="source-name">暂无商店源</strong>
            <span class="source-url">运行时未返回任何商店源，应用商店可能不可用</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 网络 -->
    <section class="settings-section">
      <SectionHeading title="网络" description="运行时实际生效值（只读）" />
      <div class="setting-card pnos-surface">
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">API 监听端口</strong>
            <span class="setting-row-desc">来自 pnos-runtime 运行时配置（配置文件或 PNOS_PORT）</span>
          </div>
          <div class="setting-control">
            <n-input :value="configPort" disabled style="width: 120px" />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">反向代理前缀</strong>
            <span class="setting-row-desc">应用 Web 界面的反向代理路径前缀（与运行时注册的代理路由同源）</span>
          </div>
          <div class="setting-control">
            <n-input :value="proxyPrefix" disabled style="width: 120px" />
          </div>
        </div>
        <n-divider class="setting-divider" />
        <div class="setting-row">
          <div class="setting-row-info">
            <strong class="setting-row-title">CORS 允许来源</strong>
            <span class="setting-row-desc">运行时当前放行的跨域来源</span>
          </div>
          <div class="setting-control">
            <n-tag size="small">{{ corsOrigins }}</n-tag>
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
          <span class="info-value">pnos {{ systemStore.version }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">操作系统</span>
          <span class="info-value">{{ systemStore.info?.os }} {{ systemStore.info?.os_version }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">内核</span>
          <span class="info-value">{{ systemStore.info?.kernel || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">架构</span>
          <span class="info-value">{{ systemStore.info?.arch }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CPU</span>
          <span class="info-value">{{ systemStore.info?.cpu_model }} · {{ systemStore.cpuCores }} 核</span>
        </div>
        <div class="info-row">
          <span class="info-label">总内存</span>
          <span class="info-value">{{ formatBytes(systemStore.memoryTotal) }}</span>
        </div>
        <div class="info-row last">
          <span class="info-label">运行时长</span>
          <span class="info-value">{{ systemStore.uptimeText }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import PageHeader from '@/components/PageHeader.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { ALERT_DANGER_MARGIN, useSystemStore } from '@/stores/system'
import { useStoreStore } from '@/stores/store'
import { useSettingsStore, type ThemeMode } from '@/stores/settings'
import type { StoreSource } from '@/types'

const message = useMessage()
const systemStore = useSystemStore()
const storeStore = useStoreStore()
const settingsStore = useSettingsStore()

const refreshIntervalOptions = [
  { label: '3 秒', value: 3000 },
  { label: '5 秒', value: 5000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
]

const refreshingId = ref<string | null>(null)

/** 网络区展示运行时返回的真实生效值，取不到时用占位符而不是写死默认值 */
const configPort = computed(() => (systemStore.config ? String(systemStore.config.port) : '—'))
const proxyPrefix = computed(() => systemStore.config?.proxy_prefix || '—')
const corsOrigins = computed(() => {
  const origins = systemStore.config?.cors_origins
  return origins && origins.length ? origins.join(', ') : '—'
})

/** 阈值 + 固定余量 = 严重线（与 stores/system.ts 的判定规则保持一致） */
function dangerLine(threshold: number): number {
  return Math.min(100, threshold + ALERT_DANGER_MARGIN)
}

function levelTagType(level: 'healthy' | 'warning' | 'danger'): 'success' | 'warning' | 'error' {
  if (level === 'danger') return 'error'
  if (level === 'warning') return 'warning'
  return 'success'
}

function levelText(level: 'healthy' | 'warning' | 'danger'): string {
  if (level === 'danger') return '严重'
  if (level === 'warning') return '告警'
  return '正常'
}

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

/**
 * 阈值行要显示"当前值"，因此本页需要拉一次指标；
 * 持续刷新由侧栏统一持有的 systemStore 轮询负责（本页不要再 start/stopPolling，
 * 否则离开本页会把侧栏的状态轮询一起停掉）。
 */
onMounted(() => {
  systemStore.fetchInfo()
  systemStore.fetchStats()
  systemStore.fetchConfig()
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
