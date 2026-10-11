import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { buildCalendarMonth } from '@/domain/history/calendarMonth'
import { buildActiveHistoryRecord, buildRestHistoryRecord } from '@/domain/history/history'
import { buildCalendarDayViewModels } from '@/domain/history/historyCalendar'
import { createTask } from '@/domain/task/task'
import { HistoryCalendar } from './HistoryCalendar'

function renderCalendar({
  records = {},
  selectedDateKey = null as string | null,
  canGoNext = true,
  onSelectDate = vi.fn(),
  onPrevMonth = vi.fn(),
  onNextMonth = vi.fn(),
} = {}) {
  const cells = buildCalendarMonth(2026, 10, '2026-10-15')
  const days = buildCalendarDayViewModels(cells, records, selectedDateKey)

  render(
    <HistoryCalendar
      monthLabel="2026年10月"
      days={days}
      onSelectDate={onSelectDate}
      onPrevMonth={onPrevMonth}
      onNextMonth={onNextMonth}
      canGoNext={canGoNext}
    />,
  )
}

describe('HistoryCalendar', () => {
  it('月labelと曜日見出しを表示する', () => {
    renderCalendar()
    expect(screen.getByText('2026年10月')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })

  it('記録ありの日はaria-labelに「記録あり」を含む', () => {
    const task = { ...createTask('タスク', 't1'), completed: true }
    renderCalendar({
      records: { '2026-10-04': buildActiveHistoryRecord('2026-10-04', [task], {}) },
    })

    expect(screen.getByRole('button', { name: '10月4日、記録あり' })).toBeInTheDocument()
  })

  it('RESTの日はaria-labelに「お休み」を含む', () => {
    renderCalendar({ records: { '2026-10-04': buildRestHistoryRecord('2026-10-04') } })
    expect(screen.getByRole('button', { name: '10月4日、お休み' })).toBeInTheDocument()
  })

  it('記録なしの日はaria-labelに「記録なし」を含む', () => {
    renderCalendar()
    expect(screen.getByRole('button', { name: '10月4日、記録なし' })).toBeInTheDocument()
  })

  it('selectedDateKeyに一致する日はaria-pressed=trueになる', () => {
    renderCalendar({ selectedDateKey: '2026-10-04' })
    expect(screen.getByRole('button', { name: '10月4日、記録なし' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '10月5日、記録なし' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('日付セルをclickするとonSelectDateがそのdateKeyで呼ばれる', async () => {
    const user = userEvent.setup()
    const onSelectDate = vi.fn()
    renderCalendar({ onSelectDate })

    await user.click(screen.getByRole('button', { name: '10月4日、記録なし' }))
    expect(onSelectDate).toHaveBeenCalledWith('2026-10-04')
  })

  it('前の月/次の月ボタンがそれぞれonPrevMonth/onNextMonthを呼ぶ', async () => {
    const user = userEvent.setup()
    const onPrevMonth = vi.fn()
    const onNextMonth = vi.fn()
    renderCalendar({ onPrevMonth, onNextMonth })

    await user.click(screen.getByRole('button', { name: '前の月' }))
    await user.click(screen.getByRole('button', { name: '次の月' }))
    expect(onPrevMonth).toHaveBeenCalledTimes(1)
    expect(onNextMonth).toHaveBeenCalledTimes(1)
  })

  it('canGoNext=falseのとき次の月ボタンがdisabledになる（未来のProduct Monthへ進めない）', () => {
    renderCalendar({ canGoNext: false })
    expect(screen.getByRole('button', { name: '次の月' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '前の月' })).toBeEnabled()
  })

  it('前月/翌月の日付（outside month）はボタンにならず、aria-hiddenになる', () => {
    renderCalendar()
    // 月送りボタン2つ + 当月31日分のみがbuttonとして存在する
    // （leading/trailingのoutside monthはbutton化しない）。
    expect(screen.getAllByRole('button')).toHaveLength(2 + 31)
  })

  it.each([null, '2026-10-15'])(
    'Todayを選択状態%sと独立して支援技術へ伝える',
    (selectedDateKey) => {
      renderCalendar({ selectedDateKey })
      const today = screen.getByRole('button', { name: '10月15日、記録なし' })
      expect(today).toHaveAttribute('aria-current', 'date')
      expect(today).toHaveAttribute('aria-pressed', String(selectedDateKey !== null))
      expect(screen.getByRole('button', { name: '10月14日、記録なし' })).not.toHaveAttribute(
        'aria-current',
      )
    },
  )
})
