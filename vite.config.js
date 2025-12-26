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
        target:'https://involved-robinett-lostandfound-c03d715f.koyeb.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/files': {
        target:'https://involved-robinett-lostandfound-c03d715f.koyeb.app',
        changeOrigin: true,
      },
    },
  },
  base: './',
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  
  build: {
    outDir: 'docs',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 关键修改：禁用哈希，使用固定文件名
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // 保持原来的分块配置
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['axios', 'lodash']
        }
      }
    }
  }
})