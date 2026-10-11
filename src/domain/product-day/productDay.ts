const PRODUCT_DAY_START_HOUR = 4

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${String(year)}-${pad2(month)}-${pad2(day)}`
}

export function getProductDateKey(date: Date = new Date()): string {
  const shifted = new Date(date.getTime() - PRODUCT_DAY_START_HOUR * 60 * 60 * 1000)
  return formatDateKey(shifted.getFullYear(), shifted.getMonth() + 1, shifted.getDate())
}

export interface ProductMonth {
  year: number
  month: number // 1-12
}

export function getCurrentProductMonth(date: Date = new Date()): ProductMonth {
  const [yearPart, monthPart] = getProductDateKey(date).split('-')
  return { year: Number(yearPart), month: Number(monthPart) }
}

export function getAdjacentMonth(year: number, month: number, delta: -1 | 1): ProductMonth {
  if (delta === 1) {
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  }
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

export function isFutureProductMonth(target: ProductMonth, current: ProductMonth): boolean {
  if (target.year !== current.year) return target.year > current.year
  return target.month > current.month
}

export function formatMonthDayLabel(dateKey: string): string {
  const [, monthPart, dayPart] = dateKey.split('-')
  return `${String(Number(monthPart))}月${String(Number(dayPart))}日`
}

export function formatYearMonthLabel(year: number, month: number): string {
  return `${String(year)}年${String(month)}月`
}

export function formatTodayLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}
