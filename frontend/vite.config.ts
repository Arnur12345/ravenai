import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isProd = mode === 'production'
  
  // Определяем окружение более надежно
  const isLocalDev = isDev && !process.env.VITE_API_BASE_URL?.includes('ravenai.site')
  const isProductionAPI = process.env.VITE_API_BASE_URL?.includes('ravenai.site')

  console.log('🔧 Vite Config:', {
    command,
    mode,
    isDev,
    isProd,
    isLocalDev,
    isProductionAPI,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL
  })

  return {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ravenai.site'
    ],
      // HMR настройки в зависимости от окружения
      hmr: isLocalDev ? {
      port: 3000,
      clientPort: 3000,
        overlay: true
      } : false, // Отключаем HMR если используется продакшн API
    watch: {
      usePolling: true,
    },
  },
    build: {
      // Оптимизация для продакшена
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['axios', 'date-fns']
          }
        }
      }
    },
    // Превью режим для локального тестирования продакшн билда
    preview: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true
    },
    // Настройка для правильной работы с разными окружениями
    define: {
      // Добавляем глобальные переменные для отладки
      __DEV__: isDev,
      __PROD__: isProd,
      __LOCAL_DEV__: isLocalDev
    }
  }
})
