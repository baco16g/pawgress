import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineAddRow } from './InlineAddRow'

const meta = {
  title: 'shared/ui/InlineAddRow',
  component: InlineAddRow,
  args: {
    onSave: () => undefined,
  },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: '22rem' }}>{Story()}</div>],
} satisfies Meta<typeof InlineAddRow>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'タスクを追加' }), '資料を確認する')
  },
}
