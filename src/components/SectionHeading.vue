<template>
  <div class="section-heading">
    <div class="section-heading-copy">
      <h2 class="section-heading-title">{{ title }}</h2>
      <p v-if="description" class="section-heading-desc">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="section-heading-actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.section-heading-copy { min-width: 0; }
.section-heading-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.section-heading-desc {
  margin: 4px 0 0;
  color: var(--pnos-muted);
  font-size: 12px;
}
.section-heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
