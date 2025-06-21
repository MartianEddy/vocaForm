import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // API calls - Network first with cache fallback
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          // Form templates - Stale while revalidate
          {
            urlPattern: /\/templates\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'templates-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'VocaForm - Voice Form Filling',
        short_name: 'VocaForm',
        description: 'Voice-powered form filling for East African government forms',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr'
      }
    })
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom'],
          // Routing
          router: ['react-router-dom'],
          // UI Components
          ui: ['lucide-react'],
          // Form handling
          forms: ['react-hook-form', 'zod'],
          // Date utilities
          dates: ['date-fns'],
          // Supabase
          supabase: ['@supabase/supabase-js', '@supabase/auth-helpers-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    // Compression for development
    middlewareMode: false
  },
  // Asset optimization
  assetsInclude: ['**/*.woff2', '**/*.woff'],
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types')
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})