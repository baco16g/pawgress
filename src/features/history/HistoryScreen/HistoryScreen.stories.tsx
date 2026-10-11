import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { createTask } from '@/domain/task/task'
import { buildCalendarMonth } from '@/domain/history/calendarMonth'
import { buildActiveHistoryRecord, type DailyHistoryRecord } from '@/domain/history/history'
import { buildCalendarDayViewModels } from '@/domain/history/historyCalendar'
import {
  formatYearMonthLabel,
  getAdjacentMonth,
  getCurrentProductMonth,
  getProductDateKey,
  isFutureProductMonth,
  type ProductMonth,
} from '@/domain/product-day/productDay'
import {
  buildMixedDayRecord,
  buildSampleMonthRecords,
} from '@/features/history/__fixtures__/historyFixtures'
import { HistoryScreen } from './HistoryScreen'

// HistoryRouteと同じ導出ロジックをDemo用に再現する（DailyLifecycleContext/Routerに
// 依存せず、fixture dataだけでStorybook表示を成立させるため。InboxScreenDemoと
// 同じ方針）。
function HistoryScreenDemo({
  records,
  initialMonth,
  initialSelectedDateKey,
  now,
  atmospherePreset,
}: {
  records: Record<string, DailyHistoryRecord>
  initialMonth?: ProductMonth
  initialSelectedDateKey?: string
  now?: Date
  atmospherePreset?: 'powder-blue' | 'butter'
}) {
  const todayDateKey = getProductDateKey(now)
  const currentProductMonth = getCurrentProductMonth(now)
  const [visibleMonth, setVisibleMonth] = useState<ProductMonth>(
    initialMonth ?? currentProductMonth,
  )
  const [selectedDateKey, setSelectedDateKey] = useState(initialSelectedDateKey ?? todayDateKey)

  const cells = buildCalendarMonth(visibleMonth.year, visibleMonth.month, todayDateKey)
  const days = buildCalendarDayViewModels(cells, records, selectedDateKey)
  const nextMonth = getAdjacentMonth(visibleMonth.year, visibleMonth.month, 1)
  const canGoNext = !isFutureProductMonth(nextMonth, currentProductMonth)

  return (
    <HistoryScreen
      monthLabel={formatYearMonthLabel(visibleMonth.year, visibleMonth.month)}
      days={days}
      canGoNext={canGoNext}
      selectedDateKey={selectedDateKey}
      selectedRecord={records[selectedDateKey] ?? null}
      hasAnyRecords={Object.keys(records).length > 0}
      onSelectDate={setSelectedDateKey}
      onPrevMonth={() => {
        setVisibleMonth((current) => getAdjacentMonth(current.year, current.month, -1))
      }}
      onNextMonth={() => {
        if (!canGoNext) return
        setVisibleMonth((current) => getAdjacentMonth(current.year, current.month, 1))
      }}
      atmospherePreset={atmospherePreset}
    />
  )
}

const SAMPLE_MONTH: ProductMonth = { year: 2026, month: 10 }
const SAMPLE_RECORDS = buildSampleMonthRecords()

const meta = {
  title: 'features/history/HistoryScreen',
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HistoryScreenDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: '1. Empty',
  render: () => <HistoryScreenDemo records={{}} />,
}

export const ActiveMonth: Story = {
  name: '2. ActiveMonth',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
    />
  ),
}

export const ActiveAndRest: Story = {
  name: '3. ActiveAndRest',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-14"
    />
  ),
}

export const MixedDay: Story = {
  name: '4. MixedDay（completed/carryOver/inbox混在）',
  render: () => (
    <HistoryScreenDemo
      records={{ '2026-10-08': buildMixedDayRecord('2026-10-08') }}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
    />
  ),
}

export const MultipleDaysSameMonth: Story = {
  name: '5. MultipleDaysSameMonth',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-10"
    />
  ),
}

export const RestDaySelected: Story = {
  name: '6. RestDaySelected',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-14"
    />
  ),
}

export const NoRecordSelected: Story = {
  name: '7. NoRecordSelected（他の日には記録がある）',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-16"
    />
  ),
}

export const PreviousMonth: Story = {
  name: '8. PreviousMonth',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={getAdjacentMonth(SAMPLE_MONTH.year, SAMPLE_MONTH.month, -1)}
    />
  ),
}

export const ButterAtmosphere: Story = {
  name: '11. Butter atmosphere（Today/Inboxが同じ日に表示するpresetと揃える、D-084）',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
      atmospherePreset="butter"
    />
  ),
}

export const Viewport390: Story = {
  name: '9. Viewport390',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
    />
  ),
  globals: { viewport: { value: '390-844' } },
}

export const Viewport320: Story = {
  name: '10. Viewport320',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
    />
  ),
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '11. KeyboardFocus',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
    />
  ),
  // 次の月ボタンはcurrent Product Monthでは無効（未来へ進めない）なため、
  // 常にfocus可能な日付セル（Active day）をkeyboard focusの代表例として使う。
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: '10月6日、記録あり' }).focus()
  },
}

// Reproducible state fixtures; no production clock or lifecycle changes.
const CALIBRATION_NOW = new Date(2026, 9, 4, 12)
export const TodayUnselected: Story = {
  name: '12. Today unselected',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
      now={CALIBRATION_NOW}
    />
  ),
}
export const TodaySelected: Story = {
  name: '13. Today selected',
  render: () => (
    <HistoryScreenDemo
      records={SAMPLE_RECORDS}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-04"
      now={CALIBRATION_NOW}
    />
  ),
}
export const ZeroCompletedActive: Story = {
  name: '14. Active score 0 ≠ No Record',
  parameters: {
    docs: {
      description: {
        story:
          '10/4はReviewを終えたActive（完了0件）。score=0でもlevel1のsageを持つ。RESTは10/14、No Recordは10/16。',
      },
    },
  },
  render: () => (
    <HistoryScreenDemo
      records={{
        ...SAMPLE_RECORDS,
        '2026-10-04': buildActiveHistoryRecord(
          '2026-10-04',
          [createTask('明日へつなぐタスク', 'zero')],
          { zero: 'carryOver' },
        ),
      }}
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-04"
      now={CALIBRATION_NOW}
    />
  ),
}
