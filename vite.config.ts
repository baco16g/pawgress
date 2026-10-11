import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // registerTypeは既定値のpromptを明示。自動リロードは行わず、
      // Settings実装後にAGENTS.md §25/product-spec.md §28の安全な更新導線を
      // 別途つなぐ（今はshellの最小構成のみ）。
      registerType: 'prompt',
      includeAssets: ['icon-source.svg'],
      manifest: {
        name: 'Pawgress',
        short_name: 'Pawgress',
        description: '犬・猫の相棒と一緒に今日のタスクに取り組むTODOアプリ',
        lang: 'ja',
        theme_color: '#f6f3ee',
        background_color: '#f6f3ee',
        display: 'standalone',
        // 安全域（maskable iconのsafe zone）を確保した意匠ではないため、
        // maskable purposeは付けない。
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setupTests.ts'],
    css: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
})
