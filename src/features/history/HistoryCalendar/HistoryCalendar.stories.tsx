import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { buildCalendarMonth } from '@/domain/history/calendarMonth'
import { buildCalendarDayViewModels } from '@/domain/history/historyCalendar'
import {
  formatYearMonthLabel,
  getAdjacentMonth,
  getCurrentProductMonth,
  getProductDateKey,
  isFutureProductMonth,
  type ProductMonth,
} from '@/domain/product-day/productDay'
import { buildSampleMonthRecords } from '@/features/history/__fixtures__/historyFixtures'
import { HistoryCalendar } from './HistoryCalendar'

// HistoryScreenDemoと同じ導出ロジックをCalendar単体表示用に再現する。
function HistoryCalendarDemo({
  initialMonth,
  initialSelectedDateKey,
  now,
}: {
  initialMonth: ProductMonth
  initialSelectedDateKey?: string
  now?: Date
}) {
  const records = buildSampleMonthRecords()
  const todayDateKey = getProductDateKey(now)
  const currentProductMonth = getCurrentProductMonth(now)
  const [visibleMonth, setVisibleMonth] = useState<ProductMonth>(initialMonth)
  const [selectedDateKey, setSelectedDateKey] = useState(initialSelectedDateKey ?? todayDateKey)

  const cells = buildCalendarMonth(visibleMonth.year, visibleMonth.month, todayDateKey)
  const days = buildCalendarDayViewModels(cells, records, selectedDateKey)
  const nextMonth = getAdjacentMonth(visibleMonth.year, visibleMonth.month, 1)
  const canGoNext = !isFutureProductMonth(nextMonth, currentProductMonth)

  return (
    <HistoryCalendar
      monthLabel={formatYearMonthLabel(visibleMonth.year, visibleMonth.month)}
      days={days}
      canGoNext={canGoNext}
      onSelectDate={setSelectedDateKey}
      onPrevMonth={() => {
        setVisibleMonth((current) => getAdjacentMonth(current.year, current.month, -1))
      }}
      onNextMonth={() => {
        if (!canGoNext) return
        setVisibleMonth((current) => getAdjacentMonth(current.year, current.month, 1))
      }}
    />
  )
}

const SAMPLE_MONTH: ProductMonth = { year: 2026, month: 10 }
// Reproducible state fixture; no production clock or lifecycle changes.
const CALIBRATION_NOW = new Date(2026, 9, 4, 12)

const meta = {
  title: 'features/history/HistoryCalendar',
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: '100%', maxWidth: '24rem' }}>{Story()}</div>],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HeatLevelsAndRest: Story = {
  name: '1. HeatLevelsAndRest（heat 1〜4段階・REST・No Record混在）',
  render: () => (
    <HistoryCalendarDemo initialMonth={SAMPLE_MONTH} initialSelectedDateKey="2026-10-08" />
  ),
}

export const TodayMarker: Story = {
  name: '2. TodayMarker（今日の日付）',
  render: () => (
    <HistoryCalendarDemo
      initialMonth={SAMPLE_MONTH}
      initialSelectedDateKey="2026-10-08"
      now={CALIBRATION_NOW}
    />
  ),
}

export const Viewport320: Story = {
  name: '3. Viewport320',
  render: () => (
    <HistoryCalendarDemo initialMonth={SAMPLE_MONTH} initialSelectedDateKey="2026-10-08" />
  ),
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '4. KeyboardFocus',
  render: () => (
    <HistoryCalendarDemo initialMonth={SAMPLE_MONTH} initialSelectedDateKey="2026-10-08" />
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: '10月6日、記録あり' }).focus()
  },
}
