import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodayRestScreen } from './TodayRestScreen'

const baseProps = {
  todayLabel: '10/4',
  companionSpecies: 'dog' as const,
  companionVariant: 'golden-retriever' as const,
  onCancelRest: vi.fn(),
  onOpenSettings: vi.fn(),
}

describe('TodayRestScreen', () => {
  it('「今日はお休み」の見出しとREST status labelを表示する', () => {
    render(<TodayRestScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()
    expect(screen.getByText('今日は、やることを決めなくて大丈夫です。')).toBeInTheDocument()
    expect(screen.getByText('お休みとして記録中')).toBeInTheDocument()
  })

  it('status iconはdecorativeでscreen readerへ重複情報を出さない（labelのみが読み取り対象）', () => {
    const { container } = render(<TodayRestScreen {...baseProps} />)

    const iconWell = container.querySelector('[aria-hidden="true"]')
    expect(iconWell).toBeInTheDocument()
    expect(iconWell).not.toHaveAttribute('role')
  })

  it('候補選択UI・Primary CTAを一切含まない（Setup UIの再表示ではない）', () => {
    render(<TodayRestScreen {...baseProps} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '今日をはじめる' })).not.toBeInTheDocument()
    expect(screen.queryByText(/選択中/)).not.toBeInTheDocument()
  })

  it('「お休みを取り消す」actionを持ち、clickでonCancelRestが呼ばれる', async () => {
    const user = userEvent.setup()
    const onCancelRest = vi.fn()
    render(<TodayRestScreen {...baseProps} onCancelRest={onCancelRest} />)

    const cancelButton = screen.getByRole('button', { name: 'お休みを取り消す' })
    expect(cancelButton).toBeInTheDocument()

    await user.click(cancelButton)
    expect(onCancelRest).toHaveBeenCalledTimes(1)
  })

  it('danger/warning styleのclassやaria属性を持たない（RESTはnegative actionではない）', () => {
    render(<TodayRestScreen {...baseProps} />)

    const cancelButton = screen.getByRole('button', { name: 'お休みを取り消す' })
    expect(cancelButton.className).not.toMatch(/danger/i)
    expect(cancelButton).not.toHaveAttribute('aria-describedby')
  })

  it('mount時にページ見出しへfocusが移る（screen全体の切り替え後のorientation、§11）', () => {
    render(<TodayRestScreen {...baseProps} />)

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toHaveFocus()
  })

  it('今日の日付labelを表示する', () => {
    render(<TodayRestScreen {...baseProps} todayLabel="12/25" />)

    expect(screen.getByText('12/25')).toBeInTheDocument()
  })

  it('Settings entryを表示し、clickでonOpenSettingsが呼ばれる', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<TodayRestScreen {...baseProps} onOpenSettings={onOpenSettings} />)

    const settingsButton = screen.getByRole('button', { name: '設定' })
    expect(settingsButton).toBeInTheDocument()

    await user.click(settingsButton)
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })
})
