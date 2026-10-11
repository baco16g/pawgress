import { formatDateKey } from '@/domain/product-day/productDay'

const WEEK_STARTS_ON = 0

export interface CalendarCell {
  dateKey: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

function getDaysInMonth(year: number, month: number): number {
  // `new Date(year, month, 0)`は前月末日を返す仕様のため、1始まりの月番号を
  // そのまま渡すと結果的に当月の末日になる。
  return new Date(year, month, 0).getDate()
}

export function buildCalendarMonth(
  year: number,
  month: number,
  todayDateKey: string,
): CalendarCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const leadingCount = (firstWeekday - WEEK_STARTS_ON + 7) % 7
  const daysInMonth = getDaysInMonth(year, month)

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const daysInPrevMonth = getDaysInMonth(prev.year, prev.month)

  const cells: CalendarCell[] = []

  for (let i = leadingCount; i > 0; i--) {
    const day = daysInPrevMonth - i + 1
    cells.push({
      dateKey: formatDateKey(prev.year, prev.month, day),
      day,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day)
    cells.push({ dateKey, day, isCurrentMonth: true, isToday: dateKey === todayDateKey })
  }

  let trailingDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      dateKey: formatDateKey(next.year, next.month, trailingDay),
      day: trailingDay,
      isCurrentMonth: false,
      isToday: false,
    })
    trailingDay++
  }

  return cells
}
