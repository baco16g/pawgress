import { describe, expect, it } from 'vitest'
import {
  getAdjacentMonth,
  getCurrentProductMonth,
  getProductDateKey,
  isFutureProductMonth,
} from './productDay'

describe('getProductDateKey', () => {
  it('03:59は前日のProduct Dayになる', () => {
    expect(getProductDateKey(new Date(2026, 9, 5, 3, 59))).toBe('2026-10-04')
  })

  it('04:00は当日のProduct Dayになる', () => {
    expect(getProductDateKey(new Date(2026, 9, 5, 4, 0))).toBe('2026-10-05')
  })

  it('month境界をまたぐ（11/1 02:00 → 10/31）', () => {
    expect(getProductDateKey(new Date(2026, 10, 1, 2, 0))).toBe('2026-10-31')
  })

  it('year境界をまたぐ（翌年1/1 02:00 → 前年12/31）', () => {
    expect(getProductDateKey(new Date(2027, 0, 1, 2, 0))).toBe('2026-12-31')
  })

  it('月初・日初の04:00は当日のまま（月境界で04:00側がずれない）', () => {
    expect(getProductDateKey(new Date(2026, 10, 1, 4, 0))).toBe('2026-11-01')
  })
})

describe('getCurrentProductMonth', () => {
  it('同じ日のProduct Dateから年月を取り出す', () => {
    expect(getCurrentProductMonth(new Date(2026, 9, 5, 10, 0))).toEqual({ year: 2026, month: 10 })
  })

  it('03:59は前月側のProduct Monthになり得る（月初2日 03:59 → 前月末日）', () => {
    expect(getCurrentProductMonth(new Date(2026, 10, 1, 3, 59))).toEqual({ year: 2026, month: 10 })
  })
})

describe('getAdjacentMonth', () => {
  it('前月（month境界内）', () => {
    expect(getAdjacentMonth(2026, 10, -1)).toEqual({ year: 2026, month: 9 })
  })

  it('翌月（month境界内）', () => {
    expect(getAdjacentMonth(2026, 10, 1)).toEqual({ year: 2026, month: 11 })
  })

  it('前月でyearを跨ぐ（1月 → 前年12月）', () => {
    expect(getAdjacentMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })

  it('翌月でyearを跨ぐ（12月 → 翌年1月）', () => {
    expect(getAdjacentMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
  })
})

describe('isFutureProductMonth', () => {
  const current = { year: 2026, month: 10 }

  it('同じ月はfutureではない', () => {
    expect(isFutureProductMonth({ year: 2026, month: 10 }, current)).toBe(false)
  })

  it('過去の月はfutureではない', () => {
    expect(isFutureProductMonth({ year: 2026, month: 9 }, current)).toBe(false)
  })

  it('同年の未来月はfuture', () => {
    expect(isFutureProductMonth({ year: 2026, month: 11 }, current)).toBe(true)
  })

  it('年を跨いだ未来月もfuture', () => {
    expect(isFutureProductMonth({ year: 2027, month: 1 }, current)).toBe(true)
  })

  it('過去の年はfutureではない', () => {
    expect(isFutureProductMonth({ year: 2025, month: 12 }, current)).toBe(false)
  })
})
