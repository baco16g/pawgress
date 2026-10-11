import type { CalendarCell } from './calendarMonth'
import {
  getHistoryHeatInput,
  activeHeatScoreToLevel,
  calculateHeatScore,
  type DailyHistoryRecord,
} from './history'

export type CalendarDayKind = 'active' | 'rest' | 'none'

export interface CalendarDayViewModel extends CalendarCell {
  kind: CalendarDayKind
  heatLevel: number | null
  isSelected: boolean
}

export function buildCalendarDayViewModels(
  cells: readonly CalendarCell[],
  historyRecords: Readonly<Record<string, DailyHistoryRecord>>,
  selectedDateKey: string | null,
): CalendarDayViewModel[] {
  return cells.map((cell) => {
    const record = historyRecords[cell.dateKey]
    const kind: CalendarDayKind = record ? record.kind : 'none'
    const heatInput = kind === 'active' && record ? getHistoryHeatInput(record) : null

    return {
      ...cell,
      kind,
      heatLevel: heatInput ? activeHeatScoreToLevel(calculateHeatScore(heatInput)) : null,
      isSelected: cell.dateKey === selectedDateKey,
    }
  })
}
