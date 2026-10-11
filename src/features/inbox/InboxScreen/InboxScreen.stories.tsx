import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, waitFor } from 'storybook/test'
import { canAddInboxTask, MAX_INBOX_TASKS } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import { createTask, type Task } from '@/domain/task/task'
import { InboxScreen } from './InboxScreen'

function tasksOf(titles: string[]): Task[] {
  return titles.map((title, index) => createTask(title, `inbox-story-${String(index)}`))
}

const FIVE_TASKS = tasksOf([
  '牛乳を買う',
  '部屋を片付ける',
  '本を返却する',
  '資料を確認する',
  'メールの下書きを送る',
])
const TEN_TASKS = tasksOf([
  '牛乳を買う',
  '部屋を片付ける',
  '本を返却する',
  '資料を確認する',
  'メールの下書きを送る',
  '郵便物を出す',
  '植物に水をやる',
  '図書館へ行く',
  '請求書を確認する',
  '靴を磨く',
])
const ELEVEN_TASKS = [...TEN_TASKS, createTask('Reviewから戻ったタスク', 'inbox-story-10')]

// 実際にInboxへtaskを追加できるよう、storyごとにlocal stateを持たせる
// （Today Setup/ReviewScreen storiesと同じ方針）。capacity判定はproductionと
// 同じpure helper（canAddInboxTask）を使う。
function InboxScreenDemo({
  initialTasks = [],
  atmospherePreset,
}: {
  initialTasks?: Task[]
  atmospherePreset?: 'powder-blue' | 'butter'
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  return (
    <InboxScreen
      tasks={tasks}
      canCapture={canAddInboxTask(tasks)}
      atmospherePreset={atmospherePreset}
      onAddTask={(title) => {
        setTasks((current) => [createTask(title), ...current])
      }}
      onDeleteTask={(id) => {
        setTasks((current) => current.filter((task) => task.id !== id))
      }}
    />
  )
}

const meta = {
  title: 'features/inbox/InboxScreen',
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof InboxScreenDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: '1. Empty',
  render: () => <InboxScreenDemo />,
}

export const OneTask: Story = {
  name: '2. OneTask',
  render: () => <InboxScreenDemo initialTasks={tasksOf(['牛乳を買う'])} />,
}

export const FiveTasks: Story = {
  name: '3. FiveTasks',
  render: () => <InboxScreenDemo initialTasks={FIVE_TASKS} />,
}

export const TenTasks: Story = {
  name: '4. TenTasks',
  render: () => <InboxScreenDemo initialTasks={TEN_TASKS} />,
}

export const AtCapacity: Story = {
  name: `5. AtCapacity（${String(MAX_INBOX_TASKS)}件、new captureはdisabled）`,
  render: () => <InboxScreenDemo initialTasks={TEN_TASKS} />,
}

export const OverCapacityFromLifecycle: Story = {
  name: '6. OverCapacityFromLifecycle（11件、Reviewからの復帰はcapacityを超えても表示）',
  render: () => <InboxScreenDemo initialTasks={ELEVEN_TASKS} />,
}

export const InputFocused: Story = {
  name: '7. InputFocused',
  render: () => <InboxScreenDemo initialTasks={tasksOf(['牛乳を買う'])} />,
  play: ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'タスクを追加' })
    input.focus()
  },
}

export const InputTyping: Story = {
  name: '8. InputTyping',
  render: () => <InboxScreenDemo initialTasks={tasksOf(['牛乳を買う'])} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: 'タスクを追加' }), '郵便物を出す')
  },
}

export const Viewport390: Story = {
  name: '9. Viewport390',
  render: () => <InboxScreenDemo initialTasks={FIVE_TASKS} />,
  globals: { viewport: { value: '390-844' } },
}

export const Viewport320: Story = {
  name: '10. Viewport320',
  render: () => <InboxScreenDemo initialTasks={FIVE_TASKS} />,
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '11. KeyboardFocus',
  render: () => <InboxScreenDemo initialTasks={tasksOf(['牛乳を買う'])} />,
  play: ({ canvas }) => {
    canvas.getByRole('textbox', { name: 'タスクを追加' }).focus()
  },
}

export const ButterAtmosphere: Story = {
  name: '13. Butter atmosphere（Todayが同じ日に表示するpresetと揃える、D-083）',
  render: () => <InboxScreenDemo initialTasks={FIVE_TASKS} atmospherePreset="butter" />,
}

export const DeleteTask: Story = {
  name: '12. DeleteTask（削除後、残りが表示される）',
  render: () => <InboxScreenDemo initialTasks={tasksOf(['牛乳を買う', '部屋を片付ける'])} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '牛乳を買うを削除' }))
    // collapse transition（--duration-normal）完了後にlistから取り除かれるため待つ。
    await waitFor(async () => {
      await expect(canvas.queryByText('牛乳を買う')).not.toBeInTheDocument()
    })
    await expect(canvas.getByText('部屋を片付ける')).toBeInTheDocument()
  },
}
