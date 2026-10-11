import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { InlineConfirmAction } from './InlineConfirmAction'

const meta = {
  title: 'shared/ui/InlineConfirmAction',
  component: InlineConfirmAction,
  args: {
    triggerLabel: '今日をやめる',
    confirmPrompt: '今日のタスクをやめてInboxへ戻しますか？',
    confirmLabel: 'やめる',
    cancelLabel: '続ける',
    confirmGroupAriaLabel: '今日をやめる確認',
    onConfirm: fn(),
  },
} satisfies Meta<typeof InlineConfirmAction>

export default meta
type Story = StoryObj<typeof meta>

export const Trigger: Story = {}

export const Confirming: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '今日をやめる' }))
  },
}
