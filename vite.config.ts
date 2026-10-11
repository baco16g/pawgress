import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// GitHub Pages はこのアプリを https://baco16g.github.io/pawgress/ から配信する。
// 本番ビルドと vite preview のみサブパス base が必要（vite dev は root のまま）。
const basePath = '/pawgress/'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? basePath : '/',
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
        // maskable purposeは付けない。start_url/scopeは指定せず、
        // vite-plugin-pwaが解決済みbaseから自動的に補う。
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Storybook/VitePressを同じオリジンの別パスに同居させるため、
        // Service WorkerのnavigationフォールバックをPawgressアプリの
        // パス配下だけに限定する（出さないと他の2サイトへの直接アクセス・
        // リロードがPawgressのshellに乗っ取られる）。
        navigateFallbackDenylist: [
          new RegExp(`^${basePath}storybook/`),
          new RegExp(`^${basePath}docs/`),
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
}))
