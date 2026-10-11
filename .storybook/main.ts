import type { StorybookConfig } from '@storybook/react-vite'
import type { PluginOption } from 'vite'

// VitePWAはPlugin[]（配列）を1要素として返すため、再帰的に判定する。
function isVitePwaPlugin(plugin: PluginOption): boolean {
  if (Array.isArray(plugin)) {
    return plugin.some(isVitePwaPlugin)
  }
  return (
    !!plugin &&
    typeof plugin === 'object' &&
    'name' in plugin &&
    typeof plugin.name === 'string' &&
    plugin.name.startsWith('vite-plugin-pwa')
  )
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // addon-mcpがコンポーネント一覧をMCPサーバー経由でAIエージェントに公開するために必要。
  features: {
    componentsManifest: true,
  },
  // vite.config.tsのVitePWAはStorybook自身のruntimeバンドル（数MB）を
  // precache対象にしようとしてビルドが失敗するため、Storybookでは除外する。
  viteFinal(viteConfig) {
    viteConfig.plugins = viteConfig.plugins?.filter((plugin) => !isVitePwaPlugin(plugin))
    return viteConfig
  },
}

export default config
