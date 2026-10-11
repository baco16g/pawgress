import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Disposition } from '@/domain/review/dailyReview'
import type { Task } from '@/domain/task/task'
import { ReviewScreen, type ReviewScreenProps } from './ReviewScreen'

const TASKS: Task[] = [
  { id: 't1', title: '牛乳を買う', completed: true },
  { id: 't2', title: '資料を確認する', completed: false },
  { id: 't3', title: 'メールの下書きを送る', completed: false },
]

const baseProps: ReviewScreenProps = {
  todayLabel: '10/3',
  tasks: TASKS,
  dispositions: {},
  companionSpecies: 'dog',
  companionVariant: 'golden-retriever',
  onSetDisposition: vi.fn(),
  onCompleteReview: vi.fn(),
}

function getTaskRow(name: string) {
  return screen.getByText(name).closest('li')
}

describe('ReviewScreen', () => {
  it('見出しを表示する', () => {
    render(<ReviewScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日を振り返る' })).toBeInTheDocument()
  })

  it('mount時にページ見出しへfocusが移る', () => {
    render(<ReviewScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日を振り返る' })).toHaveFocus()
  })

  it('completed taskをread-only summaryとして表示する（checkboxではない）', () => {
    render(<ReviewScreen {...baseProps} />)

    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: '牛乳を買う' })).not.toBeInTheDocument()
  })

  it('未完了taskごとにdisposition選択肢が2つ表示される', () => {
    render(<ReviewScreen {...baseProps} />)

    const row = getTaskRow('資料を確認する')
    expect(row).not.toBeNull()
    const radios = within(row as HTMLElement).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(
      within(row as HTMLElement).getByRole('radio', { name: '明日に持ち越す' }),
    ).toBeInTheDocument()
    expect(
      within(row as HTMLElement).getByRole('radio', { name: 'Inboxへ戻す' }),
    ).toBeInTheDocument()
  })

  it('carry-overを選ぶとonSetDispositionが呼ばれる', async () => {
    const user = userEvent.setup()
    const onSetDisposition = vi.fn()
    render(<ReviewScreen {...baseProps} onSetDisposition={onSetDisposition} />)

    const row = getTaskRow('資料を確認する') as HTMLElement
    await user.click(within(row).getByRole('radio', { name: '明日に持ち越す' }))

    expect(onSetDisposition).toHaveBeenCalledWith('t2', 'carryOver')
  })

  it('未決定のtaskがある間はReview completion CTAがdisabled', () => {
    render(<ReviewScreen {...baseProps} />)

    expect(screen.getByRole('button', { name: '1日を終える' })).toBeDisabled()
  })

  it('全未完了taskのdispositionが決まるとCTAがenabledになる', () => {
    const dispositions: Readonly<Record<string, Disposition>> = {
      t2: 'carryOver',
      t3: 'inbox',
    }
    render(<ReviewScreen {...baseProps} dispositions={dispositions} />)

    expect(screen.getByRole('button', { name: '1日を終える' })).not.toBeDisabled()
  })

  it('All Completedの場合、disposition UIを表示せずCTAはenabled', () => {
    const allCompleted: Task[] = [{ id: 't1', title: '牛乳を買う', completed: true }]
    render(<ReviewScreen {...baseProps} tasks={allCompleted} />)

    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1日を終える' })).not.toBeDisabled()
  })

  it('CTAのclickでonCompleteReviewが呼ばれる', async () => {
    const user = userEvent.setup()
    const onCompleteReview = vi.fn()
    const dispositions: Readonly<Record<string, Disposition>> = {
      t2: 'carryOver',
      t3: 'inbox',
    }
    render(
      <ReviewScreen
        {...baseProps}
        dispositions={dispositions}
        onCompleteReview={onCompleteReview}
      />,
    )

    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    expect(onCompleteReview).toHaveBeenCalledTimes(1)
  })

  it('各taskのdisposition選択は独立している', async () => {
    const user = userEvent.setup()
    const onSetDisposition = vi.fn()
    render(<ReviewScreen {...baseProps} onSetDisposition={onSetDisposition} />)

    const row = getTaskRow('メールの下書きを送る') as HTMLElement
    await user.click(within(row).getByRole('radio', { name: 'Inboxへ戻す' }))

    expect(onSetDisposition).toHaveBeenCalledWith('t3', 'inbox')
  })

  it('キーボード操作でdispositionを変更できる', async () => {
    const user = userEvent.setup()
    const onSetDisposition = vi.fn()
    render(<ReviewScreen {...baseProps} onSetDisposition={onSetDisposition} />)

    const row = getTaskRow('資料を確認する') as HTMLElement
    const radio = within(row).getByRole('radio', { name: '明日に持ち越す' })
    radio.focus()
    await user.keyboard(' ')

    expect(onSetDisposition).toHaveBeenCalledWith('t2', 'carryOver')
  })
})
