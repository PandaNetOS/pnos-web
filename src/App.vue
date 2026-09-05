<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#58a6ff',
    primaryColorHover: '#79b8ff',
    primaryColorPressed: '#388bfd',
    primaryColorSuppl: '#58a6ff',
    borderRadius: '8px',
    bodyColor: '#0d1117',
    cardColor: '#161b22',
    modalColor: '#161b22',
    textColorBase: '#e6edf3',
    borderColor: '#30363d',
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  background: #0d1117;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0d1117;
}
::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
