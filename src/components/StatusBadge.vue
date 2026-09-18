<template>
  <span class="status-badge" :class="toneClass">
    <span class="status-dot" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentStatus } from '@/types'

const props = defineProps<{
  status: ComponentStatus | string
  label?: string
}>()

const statusMap: Record<string, { label: string; tone: string }> = {
  running: { label: '运行中', tone: 'success' },
  busy: { label: '忙碌', tone: 'warning' },
  offline: { label: '离线', tone: 'muted' },
  error: { label: '错误', tone: 'danger' },
  not_installed: { label: '未安装', tone: 'muted' },
  installing: { label: '安装中', tone: 'primary' },
  stopped: { label: '已停止', tone: 'muted' },
}

const toneClass = computed(() => {
  const key = String(props.status).toLowerCase()
  return statusMap[key]?.tone || 'muted'
})

const label = computed(() => {
  if (props.label) return props.label
  const key = String(props.status).toLowerCase()
  return statusMap[key]?.label || String(props.status)
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status-badge.success {
  background: var(--pnos-success-soft);
  color: var(--pnos-success);
}
.status-badge.success .status-dot {
  box-shadow: 0 0 6px currentColor;
}
.status-badge.warning {
  background: var(--pnos-warning-soft);
  color: var(--pnos-warning);
}
.status-badge.danger {
  background: var(--pnos-danger-soft);
  color: var(--pnos-danger);
}
.status-badge.primary {
  background: var(--pnos-primary-soft);
  color: var(--pnos-primary);
}
.status-badge.muted {
  background: var(--pnos-track-muted);
  color: var(--pnos-muted);
}
</style>
