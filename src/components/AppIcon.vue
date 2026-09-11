<template>
  <div class="app-icon" :class="[sizeClass, toneClass]">
    <img v-if="showIcon" :src="icon" alt="icon" class="icon-img" @error="iconError = true" />
    <span v-else>{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    icon?: string
    size?: 'sm' | 'md' | 'lg'
    tone?: 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'slate'
  }>(),
  { size: 'md', tone: 'blue', icon: '' },
)

const iconError = ref(false)
const showIcon = computed(() => props.icon && !iconError.value)

// 当 icon URL 变化时重置错误状态，重新尝试加载
watch(() => props.icon, () => {
  iconError.value = false
})

const initial = computed(() => {
  const n = props.name?.trim() || '?'
  return n.slice(0, 1).toUpperCase()
})

const sizeClass = computed(() => `icon-${props.size}`)
const toneClass = computed(() => `tone-${props.tone}`)
</script>

<style scoped>
.app-icon {
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
.icon-sm {
  width: 34px;
  height: 34px;
  font-size: 14px;
  border-radius: 9px;
}
.icon-md {
  width: 42px;
  height: 42px;
  font-size: 17px;
}
.icon-lg {
  width: 56px;
  height: 56px;
  font-size: 22px;
  border-radius: 15px;
}
.tone-blue {
  background: linear-gradient(145deg, #3f78e8, #6b9af2);
}
.tone-green {
  background: linear-gradient(145deg, #39a974, #69c095);
}
.tone-orange {
  background: linear-gradient(145deg, #d98b37, #ecae63);
}
.tone-red {
  background: linear-gradient(145deg, #d85c68, #eb8a93);
}
.tone-violet {
  background: linear-gradient(145deg, #6c59d9, #8d7bea);
}
.tone-slate {
  background: linear-gradient(145deg, #606a78, #86909d);
}
</style>
