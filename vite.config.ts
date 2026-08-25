import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          // Backend's better-auth only trusts localhost:3000-3333 by default.
          // Rewrite Origin/Referer so requests proxied from :5174 look same-origin
          // to the backend, avoiding CORS/SameSite issues without touching its config.
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:3000')
            proxyReq.setHeader('referer', 'http://localhost:3000/')
          })
        },
      },
    },
  },
})
