import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { createTask } from '@/domain/task/task'
import { InboxTaskList } from './InboxTaskList'

const meta = {
  title: 'features/inbox/InboxTaskList',
  component: InboxTaskList,
  args: { onDeleteTask: fn() },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: '22rem' }}>{Story()}</div>],
} satisfies Meta<typeof InboxTaskList>

export default meta
type Story = StoryObj<typeof meta>

export const OneTask: Story = {
  args: { tasks: [createTask('牛乳を買う', 'inbox-1')] },
}

export const SeveralTasks: Story = {
  args: {
    tasks: [
      createTask('牛乳を買う', 'inbox-1'),
      createTask('部屋を片付ける', 'inbox-2'),
      createTask('本を返却する', 'inbox-3'),
    ],
  },
}

export const LongTitle: Story = {
  name: '長いタイトル',
  args: {
    tasks: [
      createTask(
        '今日中に終わらせたい資料整理と、明日の朝いちばんに送るメールの下書きをまとめて確認する',
        'inbox-1',
      ),
    ],
  },
  globals: { viewport: { value: '320-568' } },
}

export const DeleteTask: Story = {
  name: '削除buttonのtapでcollapse後にonDeleteTaskが呼ばれる',
  args: { tasks: [createTask('牛乳を買う', 'inbox-1')] },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '牛乳を買うを削除' }))
    // collapse transition（--duration-normal）完了後にonDeleteTaskが呼ばれるため待つ。
    await waitFor(async () => {
      await expect(args.onDeleteTask).toHaveBeenCalledWith('inbox-1')
    })
  },
}
