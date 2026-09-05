<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import './styles/tokens.css'

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
