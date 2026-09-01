import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // 生产构建时把资源放到 /static/ 下，由 Django(whitenoise) 统一托管；
  // 本地开发保持 '/'，由 Vite dev server 提供。
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 拆分 vendor 分包：浏览器可并行下载、且 react 等稳定依赖可独立长缓存，
    // 后续改业务代码时无需重新下载 vendor 包，缩短二次访问耗时。
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router') || id.includes('scheduler')) return 'react-vendor'
          if (id.includes('ogl')) return 'ogl'
          if (id.includes('react-icons')) return 'icons'
          if (id.includes('axios')) return 'axios'
          return 'vendor'
        },
      },
    },
  },
})
