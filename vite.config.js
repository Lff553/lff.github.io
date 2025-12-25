// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://involved-robinett-lostandfound-c03d715f.koyeb.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/files': {
        target: process.env.VITE_BACKEND_URL || 'https://involved-robinett-lostandfound-c03d715f.koyeb.app',
        changeOrigin: true,
      },
    },
  },
  // 添加 base 配置
  base: process.env.NODE_ENV === 'production' 
    ? '/lff.github.io/'  // GitHub Pages 需要子路径
    : '/',         // 开发环境
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 可选：优化构建
  build: {
    outDir: 'docs',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios', 'lodash']
        }
      }
    }
  }
})
