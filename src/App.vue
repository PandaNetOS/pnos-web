<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import './styles/tokens.css'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()

const naiveTheme = computed(() => settingsStore.theme === 'dark' ? darkTheme : null)

const themeOverrides = {
  common: {
    primaryColor: '#3478f6',
    primaryColorHover: '#5a91f8',
    primaryColorPressed: '#2465da',
    borderRadius: '12px',
    borderRadiusSmall: '8px',
  },
  Button: { fontWeight: '600' },
  Card: { borderRadius: '16px' },
  Input: { borderRadius: '10px' },
  Select: { peers: { InternalSelection: { borderRadius: '10px' } } },
}
</script>
