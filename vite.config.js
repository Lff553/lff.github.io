import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  
  // 关键修复：GitHub Pages 配置
  base: process.env.NODE_ENV === 'production' 
    ? '/lostfound-frontend/'  // 你的仓库名
    : '/',
  
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
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  
  build: {
    outDir: 'dist',
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
