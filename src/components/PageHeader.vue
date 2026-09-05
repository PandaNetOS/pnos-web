<template>
  <header class="pnos-page-header">
    <div>
      <div v-if="eyebrow" class="pnos-eyebrow">{{ eyebrow }}</div>
      <h1 class="pnos-page-title">{{ title }}</h1>
      <p v-if="description" class="pnos-page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions"><slot name="actions" /></div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string; eyebrow?: string }>()
</script>

<style scoped>
.page-header-actions { display: flex; align-items: center; gap: 10px; }
@media (max-width: 760px) { .page-header-actions { width: 100%; } }
</style>
