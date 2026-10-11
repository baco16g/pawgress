import type { Meta, StoryObj } from '@storybook/react-vite'
import { RootOverride } from '@/testing/RootOverride'
import { TaskItem } from './TaskItem'

const meta = {
  title: 'shared/ui/TaskItem',
  component: TaskItem,
  args: {
    title: '牛乳を買う',
    completed: false,
  },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, width: '20rem' }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof TaskItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Completed: Story = {
  args: { completed: true },
}

export const LongText: Story = {
  name: '長いタイトル',
  args: {
    title: '今日中に終わらせたい資料整理と、明日の朝いちばんに送るメールの下書きをまとめて確認する',
  },
  globals: { viewport: { value: '320-568' } },
}

export const ExtraLargeText: Story = {
  decorators: [
    (Story) => (
      <RootOverride cssVars={{ '--font-scale': '1.25' }}>
        <Story />
      </RootOverride>
    ),
  ],
}
