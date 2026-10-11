import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthDayLabel } from '@/domain/product-day/productDay'
import type { CalendarDayViewModel } from '@/domain/history/historyCalendar'
import styles from './HistoryCalendar.module.css'

export interface HistoryCalendarProps {
  monthLabel: string
  days: CalendarDayViewModel[]
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  canGoNext: boolean
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const

function describeCellState(day: CalendarDayViewModel): string {
  if (day.kind === 'active') return '、記録あり'
  if (day.kind === 'rest') return '、お休み'
  return '、記録なし'
}

export function HistoryCalendar({
  monthLabel,
  days,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  canGoNext,
}: HistoryCalendarProps) {
  return (
    <div className={styles.calendar}>
      <div className={styles.monthNav}>
        <button
          type="button"
          className={styles.monthNavButton}
          onClick={onPrevMonth}
          aria-label="前の月"
        >
          <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.75} />
        </button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button
          type="button"
          className={styles.monthNavButton}
          onClick={onNextMonth}
          disabled={!canGoNext}
          aria-label="次の月"
        >
          <ChevronRight aria-hidden="true" size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className={styles.weekdayRow} aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className={styles.weekdayLabel}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day) => {
          if (!day.isCurrentMonth) {
            return (
              <div
                key={day.dateKey}
                className={styles.outsideCell}
                data-outside-cell
                aria-hidden="true"
              >
                {day.day}
              </div>
            )
          }

          return (
            <button
              key={day.dateKey}
              type="button"
              className={styles.dayCell}
              data-kind={day.kind}
              data-heat-level={day.heatLevel ?? undefined}
              data-today={day.isToday ? '' : undefined}
              data-selected={day.isSelected ? '' : undefined}
              aria-pressed={day.isSelected}
              aria-current={day.isToday ? 'date' : undefined}
              aria-label={`${formatMonthDayLabel(day.dateKey)}${describeCellState(day)}`}
              onClick={() => {
                onSelectDate(day.dateKey)
              }}
            >
              {/* 積み重ねの「記録マス」をdate numberと別layerにする。
                  selected ringはボタン自体のinset box-shadowのまま、tokenとの間に
                  常に一定のbreathing spaceができ、cell同士が詰まって見えない。 */}
              <span className={styles.heatToken} data-heat-token aria-hidden="true" />
              <span className={styles.dayNumber} data-day-number>
                {day.day}
              </span>
            </button>
          )
        })}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendGroup}>
          <span className={styles.legendSwatches} aria-hidden="true">
            <span className={styles.legendSwatch} data-heat-level={1} />
            <span className={styles.legendSwatch} data-heat-level={2} />
            <span className={styles.legendSwatch} data-heat-level={3} />
            <span className={styles.legendSwatch} data-heat-level={4} />
          </span>
          記録
        </span>
        <span className={styles.legendGroup}>
          <span className={styles.legendSwatch} data-kind="rest" aria-hidden="true" />
          お休み
        </span>
      </div>
    </div>
  )
}
