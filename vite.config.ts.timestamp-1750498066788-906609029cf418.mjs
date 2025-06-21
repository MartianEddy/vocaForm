// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5e6,
        // 5MB
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              }
            }
          },
          // Font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              }
            }
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              }
            }
          },
          // API calls - Network first with cache fallback
          {
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
                // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          },
          // Form templates - Stale while revalidate
          {
            urlPattern: /\/templates\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "templates-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24
                // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: "VocaForm - Voice Form Filling",
        short_name: "VocaForm",
        description: "Voice-powered form filling for East African government forms",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        categories: ["productivity", "utilities"],
        lang: "en",
        dir: "ltr"
      }
    })
  ],
  build: {
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ["react", "react-dom"],
          // Routing
          router: ["react-router-dom"],
          // UI Components
          ui: ["lucide-react"],
          // Form handling
          forms: ["react-hook-form", "zod"],
          // Date utilities
          dates: ["date-fns"],
          // Supabase
          supabase: ["@supabase/supabase-js", "@supabase/auth-helpers-react"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    // Asset optimization
    assetsInlineLimit: 4096,
    // Inline assets smaller than 4KB
    cssCodeSplit: true,
    sourcemap: false,
    // Disable sourcemaps for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log in production
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
  assetsInclude: ["**/*.woff2", "**/*.woff"],
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@components": resolve(__vite_injected_original_dirname, "src/components"),
      "@hooks": resolve(__vite_injected_original_dirname, "src/hooks"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@types": resolve(__vite_injected_original_dirname, "src/types")
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
      "@supabase/supabase-js"
    ],
    exclude: ["@vite/client", "@vite/env"]
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
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1MDAwMDAwLCAvLyA1TUJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICAvLyBHb29nbGUgRm9udHNcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIC8vIEZvbnQgZmlsZXNcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ3N0YXRpY1xcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dzdGF0aWMtZm9udHMtY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBJbWFnZXNcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXFwuKD86cG5nfGpwZ3xqcGVnfHN2Z3xnaWZ8d2VicCkkLyxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnaW1hZ2VzLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCAvLyAzMCBkYXlzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIC8vIEFQSSBjYWxscyAtIE5ldHdvcmsgZmlyc3Qgd2l0aCBjYWNoZSBmYWxsYmFja1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9cXC9hcGlcXC8uKi8sXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnYXBpLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNSAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiAxMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gRm9ybSB0ZW1wbGF0ZXMgLSBTdGFsZSB3aGlsZSByZXZhbGlkYXRlXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcL3RlbXBsYXRlc1xcLy4qLyxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdTdGFsZVdoaWxlUmV2YWxpZGF0ZScsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3RlbXBsYXRlcy1jYWNoZScsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAyMCxcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgLy8gMjQgaG91cnNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdWb2NhRm9ybSAtIFZvaWNlIEZvcm0gRmlsbGluZycsXG4gICAgICAgIHNob3J0X25hbWU6ICdWb2NhRm9ybScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVm9pY2UtcG93ZXJlZCBmb3JtIGZpbGxpbmcgZm9yIEVhc3QgQWZyaWNhbiBnb3Zlcm5tZW50IGZvcm1zJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjM2I4MmY2JyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGNhdGVnb3JpZXM6IFsncHJvZHVjdGl2aXR5JywgJ3V0aWxpdGllcyddLFxuICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICBkaXI6ICdsdHInXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBDb3JlIFJlYWN0XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIC8vIFJvdXRpbmdcbiAgICAgICAgICByb3V0ZXI6IFsncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgIC8vIFVJIENvbXBvbmVudHNcbiAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICAvLyBGb3JtIGhhbmRsaW5nXG4gICAgICAgICAgZm9ybXM6IFsncmVhY3QtaG9vay1mb3JtJywgJ3pvZCddLFxuICAgICAgICAgIC8vIERhdGUgdXRpbGl0aWVzXG4gICAgICAgICAgZGF0ZXM6IFsnZGF0ZS1mbnMnXSxcbiAgICAgICAgICAvLyBTdXBhYmFzZVxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcycsICdAc3VwYWJhc2UvYXV0aC1oZWxwZXJzLXJlYWN0J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgIC8vIEFzc2V0IG9wdGltaXphdGlvblxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LCAvLyBJbmxpbmUgYXNzZXRzIHNtYWxsZXIgdGhhbiA0S0JcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gRGlzYWJsZSBzb3VyY2VtYXBzIGZvciBwcm9kdWN0aW9uXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsIC8vIFJlbW92ZSBjb25zb2xlLmxvZyBpbiBwcm9kdWN0aW9uXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZSxcbiAgICAvLyBDb21wcmVzc2lvbiBmb3IgZGV2ZWxvcG1lbnRcbiAgICBtaWRkbGV3YXJlTW9kZTogZmFsc2VcbiAgfSxcbiAgLy8gQXNzZXQgb3B0aW1pemF0aW9uXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi53b2ZmMicsICcqKi8qLndvZmYnXSxcbiAgLy8gUmVzb2x2ZSBhbGlhc2VzIGZvciBjbGVhbmVyIGltcG9ydHNcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICAnQGNvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGhvb2tzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaG9va3MnKSxcbiAgICAgICdAdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy91dGlscycpLFxuICAgICAgJ0B0eXBlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3R5cGVzJylcbiAgICB9XG4gIH0sXG4gIC8vIE9wdGltaXplIGRlcGVuZGVuY2llc1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAncmVhY3QnLFxuICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAnbHVjaWRlLXJlYWN0JyxcbiAgICAgICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXG4gICAgXSxcbiAgICBleGNsdWRlOiBbJ0B2aXRlL2NsaWVudCcsICdAdml0ZS9lbnYnXVxuICB9LFxuICAvLyBDU1Mgb3B0aW1pemF0aW9uXG4gIGNzczoge1xuICAgIGRldlNvdXJjZW1hcDogZmFsc2UsXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEBpbXBvcnQgXCJAL3N0eWxlcy92YXJpYWJsZXMuc2Nzc1wiO2BcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsZUFBZTtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsc0NBQXNDO0FBQUEsUUFDckQsK0JBQStCO0FBQUE7QUFBQSxRQUMvQixnQkFBZ0I7QUFBQTtBQUFBLFVBRWQ7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLLEtBQUssS0FBSztBQUFBO0FBQUEsY0FDaEM7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBO0FBQUEsVUFFQTtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxjQUNoQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUVBO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZO0FBQUEsZ0JBQ1YsWUFBWTtBQUFBLGdCQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLGNBQ2hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQTtBQUFBLFVBRUE7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLO0FBQUE7QUFBQSxjQUN0QjtBQUFBLGNBQ0EsdUJBQXVCO0FBQUEsWUFDekI7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUVBO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZO0FBQUEsZ0JBQ1YsWUFBWTtBQUFBLGdCQUNaLGVBQWUsS0FBSyxLQUFLO0FBQUE7QUFBQSxjQUMzQjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsUUFDQSxZQUFZLENBQUMsZ0JBQWdCLFdBQVc7QUFBQSxRQUN4QyxNQUFNO0FBQUEsUUFDTixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBO0FBQUEsVUFFN0IsUUFBUSxDQUFDLGtCQUFrQjtBQUFBO0FBQUEsVUFFM0IsSUFBSSxDQUFDLGNBQWM7QUFBQTtBQUFBLFVBRW5CLE9BQU8sQ0FBQyxtQkFBbUIsS0FBSztBQUFBO0FBQUEsVUFFaEMsT0FBTyxDQUFDLFVBQVU7QUFBQTtBQUFBLFVBRWxCLFVBQVUsQ0FBQyx5QkFBeUIsOEJBQThCO0FBQUEsUUFDcEU7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUE7QUFBQSxJQUV2QixtQkFBbUI7QUFBQTtBQUFBLElBQ25CLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQTtBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixnQkFBZ0I7QUFBQSxFQUNsQjtBQUFBO0FBQUEsRUFFQSxlQUFlLENBQUMsY0FBYyxXQUFXO0FBQUE7QUFBQSxFQUV6QyxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQzdCLGVBQWUsUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxNQUNsRCxVQUFVLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3hDLFVBQVUsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDeEMsVUFBVSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLGdCQUFnQixXQUFXO0FBQUEsRUFDdkM7QUFBQTtBQUFBLEVBRUEsS0FBSztBQUFBLElBQ0gsY0FBYztBQUFBLElBQ2QscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
