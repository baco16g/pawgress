import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { Disposition } from '@/domain/review/dailyReview'
import type { Task } from '@/domain/task/task'
import { ReviewScreen } from './ReviewScreen'

const MIXED_TASKS: Task[] = [
  { id: 't1', title: '牛乳を買う', completed: true },
  { id: 't2', title: '資料を確認する', completed: false },
  { id: 't3', title: 'メールの下書きを送る', completed: false },
]
const ALL_COMPLETED_TASKS: Task[] = [
  { id: 't1', title: '牛乳を買う', completed: true },
  { id: 't2', title: '資料を確認する', completed: true },
]
const ALL_UNFINISHED_TASKS: Task[] = [
  { id: 't1', title: '牛乳を買う', completed: false },
  { id: 't2', title: '資料を確認する', completed: false },
]

// 実際にclickでdisposition状態が変わることを確認できるよう、storyごとにlocal
// stateを持たせる。
function ReviewScreenDemo({
  tasks = MIXED_TASKS,
  initialDispositions = {},
}: {
  tasks?: Task[]
  initialDispositions?: Readonly<Record<string, Disposition>>
}) {
  const [dispositions, setDispositions] =
    useState<Readonly<Record<string, Disposition>>>(initialDispositions)

  return (
    <ReviewScreen
      todayLabel="10/3"
      tasks={tasks}
      dispositions={dispositions}
      companionSpecies="dog"
      companionVariant="golden-retriever"
      onSetDisposition={(id, disposition) => {
        setDispositions((current) => ({ ...current, [id]: disposition }))
      }}
      onCompleteReview={() => undefined}
    />
  )
}

const meta = {
  title: 'features/review/ReviewScreen',
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ReviewScreenDemo>

export default meta
type Story = StoryObj<typeof meta>

export const AllCompleted: Story = {
  name: '1. AllCompleted',
  render: () => <ReviewScreenDemo tasks={ALL_COMPLETED_TASKS} />,
}

export const MixedUndecided: Story = {
  name: '2. MixedUndecided',
  render: () => <ReviewScreenDemo />,
}

export const MixedPartiallyResolved: Story = {
  name: '3. MixedPartiallyResolved',
  render: () => <ReviewScreenDemo initialDispositions={{ t2: 'carryOver' }} />,
}

export const MixedFullyResolved: Story = {
  name: '4. MixedFullyResolved',
  render: () => <ReviewScreenDemo initialDispositions={{ t2: 'carryOver', t3: 'inbox' }} />,
}

export const AllUnfinished: Story = {
  name: '5. AllUnfinished',
  render: () => <ReviewScreenDemo tasks={ALL_UNFINISHED_TASKS} />,
}

export const Viewport390: Story = {
  name: '6. Viewport390',
  render: () => <ReviewScreenDemo initialDispositions={{ t2: 'carryOver' }} />,
  globals: { viewport: { value: '390-844' } },
}

export const Viewport320: Story = {
  name: '7. Viewport320',
  render: () => <ReviewScreenDemo initialDispositions={{ t2: 'carryOver' }} />,
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '8. KeyboardFocus',
  render: () => <ReviewScreenDemo />,
  play: ({ canvas }) => {
    const radio = canvas.getAllByRole('radio', { name: '明日に持ち越す' })[0]
    radio?.focus()
  },
}
