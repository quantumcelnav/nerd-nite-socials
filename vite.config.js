import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Nerdometer',
        short_name: 'Nerdometer',
        description: 'How nerdy are you, really? Trivia and ontology games from Nerd Nite Fort Collins.',
        theme_color: '#1a2f3a',
        background_color: '#1a2f3a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,gif,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/media\.giphy\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'giphy-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
