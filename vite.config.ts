import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    watch: {
      // 编辑器/AI 工具原子写文件时会临时生成 <name>.<pid>.<uuid>.tmpdir/ 目录，
      // Windows 上 Vite 若去 watch 这些正被占用的临时文件会抛 EBUSY 直接崩掉
      // dev server（已实际踩到：写 AGENTS.md 时崩过一次），这里显式忽略。
      ignored: ['**/*.tmpdir/**', '**/.*.tmp', '**/*.swp'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
