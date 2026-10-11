import { CalendarDays } from 'lucide-react'
import type { AtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import { AtmosphereWave } from '@/features/companion/ui/AtmosphereWave/AtmosphereWave'
import { HistoryCalendar } from '@/features/history/HistoryCalendar/HistoryCalendar'
import type { DailyHistoryRecord } from '@/domain/history/history'
import type { CalendarDayViewModel } from '@/domain/history/historyCalendar'
import { formatMonthDayLabel } from '@/domain/product-day/productDay'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './HistoryScreen.module.css'

export interface HistoryScreenProps {
  monthLabel: string
  days: CalendarDayViewModel[]
  canGoNext: boolean
  selectedDateKey: string
  selectedRecord: DailyHistoryRecord | null
  hasAnyRecords: boolean
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  atmospherePreset?: AtmospherePreset
}

const OUTCOME_LABEL: Record<string, string> = {
  completed: '完了',
  carryOver: '明日に持ち越した',
  inbox: 'Inboxへ戻した',
}

function HistoryEmptyState() {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIconWell} aria-hidden="true">
        <CalendarDays size={28} strokeWidth={1.75} className={styles.emptyIcon} />
      </span>
      <p className={styles.emptyHeading}>まだ記録はありません</p>
      <p className={styles.emptyText}>1日を終えると、ここに残ります。</p>
    </div>
  )
}

function ActiveDayDetail({ record }: { record: Extract<DailyHistoryRecord, { kind: 'active' }> }) {
  return (
    <ul className={styles.unifiedList}>
      {record.items.map((item) => (
        <li key={item.taskId} className={styles.unifiedRow}>
          <span className={styles.unifiedTitle}>{item.title}</span>
          <span className={styles.unifiedOutcome} data-outcome={item.outcome}>
            {OUTCOME_LABEL[item.outcome]}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function HistoryScreen({
  monthLabel,
  days,
  canGoNext,
  selectedDateKey,
  selectedRecord,
  hasAnyRecords,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  atmospherePreset = 'powder-blue',
}: HistoryScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <main className={styles.page}>
      <header className={styles.header} data-atmosphere={atmospherePreset}>
        <h1 ref={headingRef} className={styles.pageTitle} tabIndex={-1}>
          記録
        </h1>
        <p className={styles.supportingText}>これまでの日々を、やさしく振り返ります。</p>
        <AtmosphereWave compact />
      </header>

      <div className={styles.sheet}>
        <div className={styles.sheetContent}>
          <HistoryCalendar
            monthLabel={monthLabel}
            days={days}
            onSelectDate={onSelectDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            canGoNext={canGoNext}
          />

          {!hasAnyRecords ? (
            <HistoryEmptyState />
          ) : (
            <section className={styles.detail}>
              <h2 className={styles.detailHeading}>{formatMonthDayLabel(selectedDateKey)}</h2>

              {selectedRecord?.kind === 'active' ? (
                <ActiveDayDetail record={selectedRecord} />
              ) : null}

              {selectedRecord?.kind === 'rest' ? (
                <p className={styles.detailNote}>この日はお休みにしました。</p>
              ) : null}

              {!selectedRecord ? (
                <p className={styles.detailNote}>この日の記録はありません。</p>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
