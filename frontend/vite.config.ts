import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const enableMock = command === 'serve' || command === 'build'
  return {
    plugins: [
      vue(),
      vueDevTools(),
      viteMockServe({
        mockPath: 'mock',
        enable: enableMock,
        watchFiles: true
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173
    }
  }
})
