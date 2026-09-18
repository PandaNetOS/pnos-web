<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    phase?: string | null
    percent?: number | null
    /** 是否铺满父容器（详情页用 true，卡片脚部用 false） */
    block?: boolean
  }>(),
  { phase: null, percent: null, block: false },
)

const phaseOrder = ['downloading', 'extracting', 'starting']

function stepClass(step: string): string {
  const cur = props.phase
  if (!cur || cur === 'done') return 'is-done'
  const ci = phaseOrder.indexOf(cur)
  const si = phaseOrder.indexOf(step)
  if (si < ci) return 'is-done'
  if (si === ci) return 'is-active'
  return ''
}

const barWidth = computed(() => {
  if (props.percent === null) return '38%'
  return `${Math.min(100, Math.max(0, props.percent))}%`
})
</script>

<template>
  <div class="install-progress" :class="{ 'is-block': block }">
    <div class="ip-steps">
      <span :class="['ip-step', stepClass('downloading')]">下载</span>
      <span class="ip-sep" />
      <span :class="['ip-step', stepClass('extracting')]">解压</span>
      <span class="ip-sep" />
      <span :class="['ip-step', stepClass('starting')]">启动</span>
      <span v-if="percent !== null" class="ip-pct">{{ percent }}%</span>
    </div>
    <div class="ip-meter">
      <span :class="{ 'is-indeterminate': percent === null }" :style="{ width: barWidth }" />
    </div>
  </div>
</template>

<style scoped>
.install-progress {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.install-progress:not(.is-block) {
  flex: 1;
  max-width: 210px;
  margin-left: 12px;
}

.is-block {
  width: 100%;
}

.ip-steps {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: var(--pnos-subtle);
  line-height: 1;
}

.ip-step {
  transition: color 0.2s ease;
}

.ip-step.is-active {
  color: var(--pnos-text);
  font-weight: 600;
}

.ip-step.is-done {
  color: var(--pnos-muted);
}

.ip-sep {
  width: 12px;
  height: 1px;
  background: var(--pnos-border);
  border-radius: 1px;
}

.ip-pct {
  margin-left: auto;
  color: var(--pnos-text);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 配色与首页 Storage 用量条保持一致 */
.ip-meter {
  height: 5px;
  background: var(--pnos-track);
  border-radius: 999px;
  overflow: hidden;
}

.ip-meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #8c93a0;
  transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}

.ip-meter span.is-indeterminate {
  transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1);
  animation: ip-pulse 1.6s ease-in-out infinite;
}

@keyframes ip-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ip-meter span,
  .ip-meter span.is-indeterminate {
    transition: none;
    animation: none;
  }
}
</style>
