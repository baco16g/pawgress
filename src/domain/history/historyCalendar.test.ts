import { describe, expect, it } from 'vitest'
import { buildCalendarMonth } from './calendarMonth'
import { buildActiveHistoryRecord, buildRestHistoryRecord } from './history'
import { buildCalendarDayViewModels } from './historyCalendar'
import { createTask } from '@/domain/task/task'

describe('buildCalendarDayViewModels', () => {
  const cells = buildCalendarMonth(2026, 10, '2026-10-15')

  it('recordが存在する日はkind="active"とheatLevelを持つ（record lookup）', () => {
    const activeTask = { ...createTask('タスク', 't1'), completed: true }
    const records = { '2026-10-04': buildActiveHistoryRecord('2026-10-04', [activeTask], {}) }

    const viewModels = buildCalendarDayViewModels(cells, records, null)
    const day4 = viewModels.find((cell) => cell.dateKey === '2026-10-04')

    expect(day4?.kind).toBe('active')
    expect(day4?.heatLevel).toBe(4)
  })

  it('REST recordの日はkind="rest"でheatLevelを持たない（REST lookup）', () => {
    const records = { '2026-10-04': buildRestHistoryRecord('2026-10-04') }

    const viewModels = buildCalendarDayViewModels(cells, records, null)
    const day4 = viewModels.find((cell) => cell.dateKey === '2026-10-04')

    expect(day4?.kind).toBe('rest')
    expect(day4?.heatLevel).toBeNull()
  })

  it('recordが無い日はkind="none"（No Record、record自体を生成しない）', () => {
    const viewModels = buildCalendarDayViewModels(cells, {}, null)
    const day4 = viewModels.find((cell) => cell.dateKey === '2026-10-04')

    expect(day4?.kind).toBe('none')
    expect(day4?.heatLevel).toBeNull()
  })

  it('selectedDateKeyに一致する日だけisSelected=true（selection）', () => {
    const viewModels = buildCalendarDayViewModels(cells, {}, '2026-10-10')

    expect(viewModels.filter((cell) => cell.isSelected)).toHaveLength(1)
    expect(viewModels.find((cell) => cell.dateKey === '2026-10-10')?.isSelected).toBe(true)
  })

  it('selectedDateKey=nullならどのセルもisSelected=falseになる', () => {
    const viewModels = buildCalendarDayViewModels(cells, {}, null)
    expect(viewModels.every((cell) => !cell.isSelected)).toBe(true)
  })

  it('todayCellのisToday/isCurrentMonthはCalendarCellの値をそのまま引き継ぐ', () => {
    const viewModels = buildCalendarDayViewModels(cells, {}, null)
    const today = viewModels.find((cell) => cell.dateKey === '2026-10-15')

    expect(today?.isToday).toBe(true)
    expect(today?.isCurrentMonth).toBe(true)
  })

  it('0件完了のActiveはscore=0でもlevel1、REST/No Recordとは別に分類する', () => {
    const task = createTask('次へつなぐタスク', 'zero-completed')
    const records = {
      '2026-10-04': buildActiveHistoryRecord('2026-10-04', [task], {
        'zero-completed': 'carryOver',
      }),
      '2026-10-05': buildRestHistoryRecord('2026-10-05'),
    }
    const days = buildCalendarDayViewModels(cells, records, '2026-10-04')
    expect(days.find((day) => day.dateKey === '2026-10-04')).toMatchObject({
      kind: 'active',
      heatLevel: 1,
      isSelected: true,
    })
    expect(days.find((day) => day.dateKey === '2026-10-05')).toMatchObject({
      kind: 'rest',
      heatLevel: null,
    })
    expect(days.find((day) => day.dateKey === '2026-10-06')).toMatchObject({
      kind: 'none',
      heatLevel: null,
    })
    expect(Object.keys(records)).toEqual(['2026-10-04', '2026-10-05'])
  })
})
