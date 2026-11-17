import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const DAY = 60 * 60 * 24;

export default defineConfig({
  // `npm run dev` forwards API calls to `npm run server` (port 4000).
  server: { proxy: { '/api': 'http://localhost:4000' } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        id: '/',
        name: 'Throttle',
        short_name: 'Throttle',
        description: 'Buy and sell motorcycles.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#101418',
        background_color: '#101418',
        categories: ['shopping', 'lifestyle'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Long-press the home-screen icon on Android for these.
        shortcuts: [
          { name: 'Showroom', url: '/', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Sell a bike', url: '/sell', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Transactions', url: '/transactions', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // The app shell (JS, CSS, fonts, icons) is saved on first visit, so it opens offline.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Uploaded bike photos never change at a given ?v=, so keep them.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bike-photos',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * DAY },
              cacheableResponseStatus: { statuses: [200] },
            },
          },
          {
            // Lists and transactions: fresh when online, last saved copy when offline.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            method: 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * DAY },
              cacheableResponseStatus: { statuses: [200] },
            },
          },
          {
            // Older photos that are plain links. Stale-while-revalidate re-checks
            // every time, so a photo that failed once repairs itself on the next view.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'legacy-photos-v2',
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * DAY },
              cacheableResponseStatus: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
