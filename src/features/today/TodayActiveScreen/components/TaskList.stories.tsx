import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskList } from './TaskList'

const meta = {
  title: 'features/today/TodayActiveScreen/TaskList',
  component: TaskList,
  args: {
    onToggleTask: () => undefined,
  },
} satisfies Meta<typeof TaskList>

export default meta
type Story = StoryObj<typeof meta>

export const Mixed: Story = {
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '資料を確認する', completed: true },
      { id: '3', title: 'メールの下書きをまとめて送る', completed: false },
    ],
  },
}

export const AllCompleted: Story = {
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: true },
      { id: '2', title: '資料を確認する', completed: true },
    ],
  },
}

export const LongJapaneseTitle: Story = {
  name: '長い日本語タイトル',
  args: {
    tasks: [
      {
        id: '1',
        title:
          '今日中に終わらせたい資料整理と、明日の朝いちばんに送るメールの下書きをまとめて確認する',
        completed: false,
      },
    ],
  },
  globals: { viewport: { value: '320-568' } },
}
