import type { Preview } from '@storybook/react-vite'
import '@/app/styles/global.css'

// dark modeはcanonical documentsの要件に無いため、tokens.cssはライトテーマのみ
// 実装している（docs/design-decisions.md参照）。theme切り替えdecoratorは
// 切り替え先が存在しないため設けていない。
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
}

export default preview
