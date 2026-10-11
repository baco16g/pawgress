import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'

const meta = {
  title: 'shared/ui/Toast',
  component: Toast,
  args: {
    message: '今日の記録を保存しました。',
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongMessage: Story = {
  args: {
    message: '長めのmessageでも折り返して表示できることを確認する想定のテキストです。',
  },
}

export const Viewport320: Story = {
  globals: { viewport: { value: '320-568' } },
}
