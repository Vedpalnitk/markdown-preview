import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const enablePwa = env.VITE_ENABLE_PWA === 'true';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        ...(enablePwa ? [
          VitePWA({
            registerType: 'autoUpdate',
            // Terser renderChunk has been flaky in this project; skip minification for SW to avoid build exits.
            minify: false,
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
              name: 'GlassNote AI',
              short_name: 'GlassNote',
              description: 'Beautiful markdown notes with AI assistance',
              theme_color: '#0052CC',
              background_color: '#001226',
              display: 'standalone',
              start_url: '/',
              icons: [
                {
                  src: '/icons/icon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
                },
                {
                  src: '/icons/icon-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable'
                }
              ]
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'google-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                    },
                    cacheableResponse: {
                      statuses: [0, 200]
                    }
                  }
                },
                {
                  urlPattern: /^https:\/\/cdn\.(tailwindcss|jsdelivr|cloudflare)\.com\/.*/i,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'cdn-cache',
                    expiration: {
                      maxEntries: 20,
                      maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                    }
                  }
                }
              ]
            },
            devOptions: {
              enabled: true,
              type: 'module'
            }
          })
        ] : [])
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
