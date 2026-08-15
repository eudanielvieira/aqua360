import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Aqua360 - Guia de Aquarismo',
        short_name: 'Aqua360',
        description: 'O seu guia completo de aquarismo',
        theme_color: '#0F4C75',
        background_color: '#0F1419',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // O catalogo tem centenas de JPGs. Precachear todos fazia a primeira
        // instalacao baixar quase 25 MB; agora a imagem entra no cache apenas
        // quando o usuario realmente a abre.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        globIgnores: ['images/**'],
        runtimeCaching: [
          {
            urlPattern: /\/images\/.*\.(?:jpg|jpeg|png|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'aqua360-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/api\.gbif\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gbif-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/static\.inaturalist\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'inat-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})
