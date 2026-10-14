import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import prettierConfig from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const layerOrder = ['app', 'features', 'domain', 'shared']

const architectureLayers = [
  // app/stateはapp全体より先に登録し、より広い'app'パターンより優先してマッチさせる。
  // featuresはapp/state配下のcontext hookを消費してよいが、
  // app/router・app/providersの実装には立ち入らない、という
  // 狭い例外をpolicyで表現するための区分。
  { type: 'app-state', pattern: 'src/app/state/**' },
  ...layerOrder.map((type) => ({ type, pattern: `src/${type}/**` })),
]

// testingはapp→features→domain→sharedに属さないレイヤー外の要素として登録する。
// どのpolicyのallowにも'testing'を含めないことで、.stories.tsx/.test.tsx
// （boundaries/ignoreで境界チェック対象外）以外からのimportをdefault: 'disallow'
// で機械的に防ぐ。
architectureLayers.push({ type: 'testing', pattern: 'src/testing/**' })

/** @param {string} layer */
function layerAndBelow(layer) {
  return layerOrder.slice(layerOrder.indexOf(layer)).map((type) => ({ to: { element: { type } } }))
}

export default defineConfig(
  {
    ignores: [
      'dist',
      'storybook-static',
      'site',
      'docs/.vitepress/dist',
      'docs/.vitepress/cache',
      'coverage',
      'node_modules',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, prettierConfig],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      // TypeScriptのimportを解決し、依存境界チェックのスキップを防ぐ。
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': architectureLayers,
      'boundaries/ignore': ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}'],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: [...layerAndBelow('app'), { to: { element: { type: 'app-state' } } }],
            },
            {
              from: { element: { type: 'features' } },
              // app-stateの消費のみ許可する狭い例外（app/router・app/providersは不可）。
              allow: [...layerAndBelow('features'), { to: { element: { type: 'app-state' } } }],
            },
            {
              from: { element: { type: 'domain' } },
              allow: layerAndBelow('domain'),
            },
            {
              from: { element: { type: 'shared' } },
              allow: layerAndBelow('shared'),
            },
            {
              from: { element: { type: 'app-state' } },
              allow: layerAndBelow('domain'),
            },
            {
              // fixtureをdomainの型・factoryで組み立てるため、domain以下だけを許可する。
              from: { element: { type: 'testing' } },
              allow: layerAndBelow('domain'),
            },
          ],
        },
      ],
    },
  },
  {
    files: ['*.{ts,js}', '.storybook/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, prettierConfig],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...storybook.configs['flat/recommended'],
)
