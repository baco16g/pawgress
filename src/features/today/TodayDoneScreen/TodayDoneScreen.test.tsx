import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodayDoneScreen } from './TodayDoneScreen'

const baseProps = {
  todayLabel: '10/4',
  companionSpecies: 'dog' as const,
  companionVariant: 'golden-retriever' as const,
  onCancelReview: vi.fn(),
  onOpenSettings: vi.fn(),
}

describe('TodayDoneScreen', () => {
  it('「今日はここまで」の見出しとDone status labelを表示する', () => {
    render(<TodayDoneScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日はここまで' })).toBeInTheDocument()
    expect(screen.getByText('また明日、新しい今日をはじめましょう。')).toBeInTheDocument()
    expect(screen.getByText('今日の記録として保存済み')).toBeInTheDocument()
  })

  it('status iconはdecorativeでscreen readerへ重複情報を出さない（labelのみが読み取り対象）', () => {
    const { container } = render(<TodayDoneScreen {...baseProps} />)

    const iconWell = container.querySelector('[aria-hidden="true"]')
    expect(iconWell).toBeInTheDocument()
    expect(iconWell).not.toHaveAttribute('role')
  })

  it('候補選択UI・Primary CTAを一切含まない（Setup UIの再表示ではない）', () => {
    render(<TodayDoneScreen {...baseProps} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '今日をはじめる' })).not.toBeInTheDocument()
    expect(screen.queryByText(/選択中/)).not.toBeInTheDocument()
  })

  it('「今日の完了を取り消す」actionを持ち、clickでonCancelReviewが呼ばれる', async () => {
    const user = userEvent.setup()
    const onCancelReview = vi.fn()
    render(<TodayDoneScreen {...baseProps} onCancelReview={onCancelReview} />)

    const cancelButton = screen.getByRole('button', { name: '今日の完了を取り消す' })
    expect(cancelButton).toBeInTheDocument()

    await user.click(cancelButton)
    expect(onCancelReview).toHaveBeenCalledTimes(1)
  })

  it('danger/warning styleのclassやaria属性を持たない（取り消しはnegative actionではない）', () => {
    render(<TodayDoneScreen {...baseProps} />)

    const cancelButton = screen.getByRole('button', { name: '今日の完了を取り消す' })
    expect(cancelButton.className).not.toMatch(/danger/i)
    expect(cancelButton).not.toHaveAttribute('aria-describedby')
  })

  it('mount時にページ見出しへfocusが移る（screen全体の切り替え後のorientation、§11）', () => {
    render(<TodayDoneScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日はここまで' })).toHaveFocus()
  })

  it('今日の日付labelを表示する', () => {
    render(<TodayDoneScreen {...baseProps} todayLabel="12/25" />)

    expect(screen.getByText('12/25')).toBeInTheDocument()
  })

  it('Settings entryを表示し、clickでonOpenSettingsが呼ばれる', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<TodayDoneScreen {...baseProps} onOpenSettings={onOpenSettings} />)

    const settingsButton = screen.getByRole('button', { name: '設定' })
    expect(settingsButton).toBeInTheDocument()

    await user.click(settingsButton)
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
