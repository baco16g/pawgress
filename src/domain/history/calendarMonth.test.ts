import { describe, expect, it } from 'vitest'
import { buildCalendarMonth } from './calendarMonth'

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [yearPart, monthPart, dayPart] = dateKey.split('-')
  return { year: Number(yearPart), month: Number(monthPart), day: Number(dayPart) }
}

describe('buildCalendarMonth', () => {
  it('セル件数は常に7の倍数（週グリッドを欠けなく埋める）', () => {
    const cells = buildCalendarMonth(2026, 10, '2026-10-01')
    expect(cells.length % 7).toBe(0)
  })

  it('当月のセルは1日から月末日まで連続して並ぶ', () => {
    const cells = buildCalendarMonth(2026, 10, '2026-10-01')
    const currentMonthCells = cells.filter((cell) => cell.isCurrentMonth)

    expect(currentMonthCells).toHaveLength(daysInMonth(2026, 10))
    currentMonthCells.forEach((cell, index) => {
      expect(cell.day).toBe(index + 1)
      expect(parseDateKey(cell.dateKey)).toEqual({ year: 2026, month: 10, day: index + 1 })
    })
  })

  it('todayDateKeyに一致するセルだけがisToday=trueになる', () => {
    const cells = buildCalendarMonth(2026, 10, '2026-10-15')
    const todayCells = cells.filter((cell) => cell.isToday)

    expect(todayCells).toHaveLength(1)
    expect(todayCells[0]).toMatchObject({ dateKey: '2026-10-15', day: 15, isCurrentMonth: true })
  })

  it('月に含まれないtodayDateKeyならisToday=trueのセルは存在しない', () => {
    const cells = buildCalendarMonth(2026, 10, '2026-11-01')
    expect(cells.some((cell) => cell.isToday)).toBe(false)
  })

  it('前月の末尾days（leading）は前月のdateKeyを持ち、月末日で終わる', () => {
    const cells = buildCalendarMonth(2026, 10, '2026-10-01')
    const firstCurrentIndex = cells.findIndex((cell) => cell.isCurrentMonth)
    const leading = cells.slice(0, firstCurrentIndex)

    expect(leading.length).toBeGreaterThan(0)
    const last = leading.at(-1)
    if (last) {
      expect(last.day).toBe(daysInMonth(2026, 9))
      expect(parseDateKey(last.dateKey).month).toBe(9)
      leading.forEach((cell) => {
        expect(cell.isCurrentMonth).toBe(false)
        expect(cell.isToday).toBe(false)
      })
    }
  })

  it('翌月の先頭days（trailing）は翌月のdateKeyを持ち、1日から始まる', () => {
    // 2026年11月は30日・1日が日曜始まりでleading=0のため、trailingの非0を確実に検証できる。
    const cells = buildCalendarMonth(2026, 11, '2026-11-01')
    const lastCurrentIndex = cells.map((cell) => cell.isCurrentMonth).lastIndexOf(true)
    const trailing = cells.slice(lastCurrentIndex + 1)

    expect(trailing.length).toBeGreaterThan(0)
    const first = trailing[0]
    if (first) {
      expect(first.day).toBe(1)
      expect(parseDateKey(first.dateKey).month).toBe(12)
      trailing.forEach((cell) => {
        expect(cell.isCurrentMonth).toBe(false)
      })
    }
  })

  it('年境界: 1月のleadingは前年12月を参照する', () => {
    const cells = buildCalendarMonth(2026, 1, '2026-01-01')
    const firstCurrentIndex = cells.findIndex((cell) => cell.isCurrentMonth)
    const leading = cells.slice(0, firstCurrentIndex)

    expect(leading.length).toBeGreaterThan(0)
    const last = leading.at(-1)
    if (last) {
      expect(parseDateKey(last.dateKey)).toEqual({
        year: 2025,
        month: 12,
        day: daysInMonth(2025, 12),
      })
    }
  })

  it('年境界: 12月のtrailingは翌年1月を参照する', () => {
    const cells = buildCalendarMonth(2026, 12, '2026-12-01')
    const lastCurrentIndex = cells.map((cell) => cell.isCurrentMonth).lastIndexOf(true)
    const trailing = cells.slice(lastCurrentIndex + 1)

    expect(trailing.length).toBeGreaterThan(0)
    const first = trailing[0]
    if (first) {
      expect(parseDateKey(first.dateKey)).toEqual({ year: 2027, month: 1, day: 1 })
    }
  })

  it.each([
    [2024, 29],
    [2023, 28],
    [2000, 29],
    [2100, 28],
  ])('%i年2月は%i日（4/100/400年の閏年規則）', (year, expectedDays) => {
    const cells = buildCalendarMonth(year, 2, `${String(year)}-02-01`)
    const current = cells.filter((cell) => cell.isCurrentMonth)
    expect(current).toHaveLength(expectedDays)
    expect(current.at(-1)?.dateKey).toBe(`${String(year)}-02-${String(expectedDays)}`)
  })

  it.each([
    [2026, 10, 4, 35], // Thursday start
    [2026, 11, 0, 35], // Sunday start
    [2026, 5, 5, 42], // Friday start, six rows
  ])('%i/%iの月初offsetと週数は既知の暦と一致する', (year, month, offset, count) => {
    const cells = buildCalendarMonth(year, month, '2026-10-04')
    expect(cells.findIndex((cell) => cell.isCurrentMonth)).toBe(offset)
    expect(cells).toHaveLength(count)
    expect(new Set(cells.map((cell) => cell.dateKey)).size).toBe(count)
  })
})
