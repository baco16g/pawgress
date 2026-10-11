import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildCalendarMonth } from '@/domain/history/calendarMonth'
import { buildActiveHistoryRecord, buildRestHistoryRecord } from '@/domain/history/history'
import { buildCalendarDayViewModels } from '@/domain/history/historyCalendar'
import { createTask } from '@/domain/task/task'
import { HistoryScreen } from './HistoryScreen'

const cells = buildCalendarMonth(2026, 10, '2026-10-15')

function renderScreen({
  records = {},
  selectedDateKey = '2026-10-15',
}: {
  records?: Record<string, ReturnType<typeof buildActiveHistoryRecord>>
  selectedDateKey?: string
} = {}) {
  const days = buildCalendarDayViewModels(cells, records, selectedDateKey)

  render(
    <HistoryScreen
      monthLabel="2026年10月"
      days={days}
      canGoNext
      selectedDateKey={selectedDateKey}
      selectedRecord={records[selectedDateKey] ?? null}
      hasAnyRecords={Object.keys(records).length > 0}
      onSelectDate={vi.fn()}
      onPrevMonth={vi.fn()}
      onNextMonth={vi.fn()}
    />,
  )
}

describe('HistoryScreen', () => {
  it('記録が1件も無いときはlightweight Empty Stateを表示する', () => {
    renderScreen()

    expect(screen.getByText('まだ記録はありません')).toBeInTheDocument()
    expect(screen.getByText('1日を終えると、ここに残ります。')).toBeInTheDocument()
    expect(screen.queryByText('この日の記録はありません。')).not.toBeInTheDocument()
  })

  it('選択日がActiveのとき、各taskのoutcomeを含むUnified listを表示する', () => {
    const completed = { ...createTask('完了したタスク', 't1'), completed: true }
    const carryOver = createTask('持ち越したタスク', 't2')
    const toInbox = createTask('Inboxへ戻したタスク', 't3')
    const record = buildActiveHistoryRecord('2026-10-15', [completed, carryOver, toInbox], {
      t2: 'carryOver',
      t3: 'inbox',
    })

    renderScreen({ records: { '2026-10-15': record } })

    expect(screen.getByText('完了したタスク')).toBeInTheDocument()
    expect(screen.getByText('持ち越したタスク')).toBeInTheDocument()
    expect(screen.getByText('Inboxへ戻したタスク')).toBeInTheDocument()
    expect(screen.getAllByText('完了')).toHaveLength(1)
    expect(screen.getByText('明日に持ち越した')).toBeInTheDocument()
    expect(screen.getByText('Inboxへ戻した')).toBeInTheDocument()
  })

  it('選択日がRestのとき、task listを捏造せず静かなcopyだけを表示する', () => {
    renderScreen({
      records: {
        '2026-10-04': buildRestHistoryRecord('2026-10-04'),
        '2026-10-15': buildRestHistoryRecord('2026-10-15'),
      },
    })

    expect(screen.getByText('この日はお休みにしました。')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('他の日に記録がある中で選択日がNo Recordのときは静かなinline copyを表示する（Empty Stateではない）', () => {
    const task = { ...createTask('タスク', 't1'), completed: true }
    renderScreen({
      records: { '2026-10-20': buildActiveHistoryRecord('2026-10-20', [task], {}) },
      selectedDateKey: '2026-10-04',
    })

    expect(screen.getByText('この日の記録はありません。')).toBeInTheDocument()
    expect(screen.queryByText('まだ記録はありません')).not.toBeInTheDocument()
  })

  it('Historyは読み取り専用: complete/edit/delete等のaction buttonを持たない', () => {
    const completed = { ...createTask('完了したタスク', 't1'), completed: true }
    const record = buildActiveHistoryRecord('2026-10-15', [completed], {})
    renderScreen({ records: { '2026-10-15': record } })

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /編集|削除|完了にする|Todayへ移動/ }),
    ).not.toBeInTheDocument()
  })

  it('日付見出しはformatMonthDayLabelと同じ表記で表示される', () => {
    const task = { ...createTask('タスク', 't1'), completed: true }
    renderScreen({ records: { '2026-10-15': buildActiveHistoryRecord('2026-10-15', [task], {}) } })

    expect(screen.getByRole('heading', { name: '10月15日' })).toBeInTheDocument()
  })
})
