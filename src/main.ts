import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

// 初始化主题（从 localStorage 读取）
const settingsStore = useSettingsStore()
settingsStore.initTheme()

app.config.errorHandler = (error) => {
  console.error('[PNOS]', error)
}

app.mount('#app')
