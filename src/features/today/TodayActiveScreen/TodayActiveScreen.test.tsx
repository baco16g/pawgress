import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodayActiveScreen } from './TodayActiveScreen'

const baseProps = {
  todayLabel: '10/3',
  companionSpecies: 'dog' as const,
  companionVariant: 'golden-retriever' as const,
  onToggleTask: vi.fn(),
  onAddTask: vi.fn(),
  onOpenSettings: vi.fn(),
  onOpenReview: vi.fn(),
  onAbandonToday: vi.fn(),
}

describe('TodayActiveScreen', () => {
  it('設定エントリの操作でonOpenSettingsが呼ばれる', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<TodayActiveScreen {...baseProps} tasks={[]} onOpenSettings={onOpenSettings} />)

    await user.click(screen.getByRole('button', { name: '設定' }))

    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })

  it('Review CTAの操作でonOpenReviewが呼ばれる', async () => {
    const user = userEvent.setup()
    const onOpenReview = vi.fn()
    render(<TodayActiveScreen {...baseProps} tasks={[]} onOpenReview={onOpenReview} />)

    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

    expect(onOpenReview).toHaveBeenCalledTimes(1)
  })

  it('タスクが0件のとき、現在のempty state copyを表示する', () => {
    render(<TodayActiveScreen {...baseProps} tasks={[]} />)

    expect(screen.getByText('今日のタスクはまだありません。')).toBeInTheDocument()
    expect(screen.getByText('追加すると、ここに表示されます。')).toBeInTheDocument()
  })

  it('タスクがある場合はTaskListの行として表示する', () => {
    render(
      <TodayActiveScreen
        {...baseProps}
        tasks={[{ id: '1', title: '牛乳を買う', completed: false }]}
      />,
    )

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })

  describe('今日をやめる', () => {
    it('trigger clickで確認UIが展開し、確認文へfocusが移る（誤ってEnter/Spaceで確定しない）', async () => {
      const user = userEvent.setup()
      render(<TodayActiveScreen {...baseProps} tasks={[]} />)

      await user.click(screen.getByRole('button', { name: '今日をやめる' }))

      expect(screen.getByText('今日のタスクをやめてInboxへ戻しますか？')).toHaveFocus()
    })

    it('確認UIで「やめる」を押すとonAbandonTodayが呼ばれる', async () => {
      const user = userEvent.setup()
      const onAbandonToday = vi.fn()
      render(<TodayActiveScreen {...baseProps} tasks={[]} onAbandonToday={onAbandonToday} />)

      await user.click(screen.getByRole('button', { name: '今日をやめる' }))
      await user.click(screen.getByRole('button', { name: 'やめる' }))

      expect(onAbandonToday).toHaveBeenCalledTimes(1)
    })

    it('確認UIで「続ける」を押すとonAbandonTodayは呼ばれず、triggerへ戻る', async () => {
      const user = userEvent.setup()
      const onAbandonToday = vi.fn()
      render(<TodayActiveScreen {...baseProps} tasks={[]} onAbandonToday={onAbandonToday} />)

      await user.click(screen.getByRole('button', { name: '今日をやめる' }))
      await user.click(screen.getByRole('button', { name: '続ける' }))

      expect(onAbandonToday).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: '今日をやめる' })).toHaveFocus()
    })
  })
})
