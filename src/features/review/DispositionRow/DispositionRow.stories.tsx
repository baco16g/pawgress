import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DispositionRow } from './DispositionRow'

const meta = {
  title: 'features/review/DispositionRow',
  component: DispositionRow,
  args: {
    title: '牛乳を買う',
    disposition: undefined,
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, width: '20rem' }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof DispositionRow>

export default meta
type Story = StoryObj<typeof meta>

export const Undecided: Story = {
  name: '1. Undecided（初期状態、どちらも未選択）',
}

export const CarryOverSelected: Story = {
  name: '2. CarryOverSelected',
  args: { disposition: 'carryOver' },
}

export const InboxSelected: Story = {
  name: '3. InboxSelected',
  args: { disposition: 'inbox' },
}

export const LongTitle: Story = {
  name: '4. 長いタイトル',
  args: {
    title: '今日中に終わらせたい資料整理と、明日の朝いちばんに送るメールの下書きをまとめて確認する',
  },
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '5. KeyboardFocus（持ち越すradio）',
  play: ({ canvas }) => {
    canvas.getByRole('radio', { name: '明日に持ち越す' }).focus()
  },
}
