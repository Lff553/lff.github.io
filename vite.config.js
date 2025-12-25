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
  // 关键修改：GitHub Pages 配置
  base: process.env.NODE_ENV === 'production' 
    ? '/lff.github.io/'  // 改为你的仓库名
    : '/',
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  build: {
    outDir: 'docs',  // GitHub Pages 默认读取 docs 目录
    sourcemap: false,
    emptyOutDir: true,  // 构建前清空输出目录
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
