<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <strong class="empty-title">{{ title }}</strong>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
  }>(),
  { icon: '○' },
)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 56px 24px;
}
.empty-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 6px;
  border-radius: 14px;
  background: var(--pnos-surface-soft);
  color: var(--pnos-subtle);
  font-size: 22px;
  font-weight: 300;
}
.empty-title {
  font-size: 14px;
  font-weight: 600;
}
.empty-desc {
  color: var(--pnos-muted);
  font-size: 12px;
  margin: 0;
  max-width: 320px;
  line-height: 1.6;
}
.empty-actions {
  margin-top: 10px;
}
</style>
