import { useState } from 'react'
import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { useSettings } from '@/app/state/settingsContext'
import { getCompanionAtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import { getDailyCompanionVariant } from '@/features/companion/model/companionAssets'
import { HistoryScreen } from '@/features/history/HistoryScreen/HistoryScreen'
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
import { useShowNavOnMount } from '@/app/router/navVisibilityContext'

export function HistoryRoute() {
  useShowNavOnMount()
  const { state } = useDailyLifecycle()
  const { settings } = useSettings()

  const todayDateKey = getProductDateKey()
  const companionVariant = getDailyCompanionVariant(settings.companionSpecies, todayDateKey)
  const atmospherePreset = getCompanionAtmospherePreset(companionVariant)
  const currentProductMonth = getCurrentProductMonth()

  const [visibleMonth, setVisibleMonth] = useState<ProductMonth>(currentProductMonth)
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayDateKey)

  const cells = buildCalendarMonth(visibleMonth.year, visibleMonth.month, todayDateKey)
  const days = buildCalendarDayViewModels(cells, state.historyRecords, selectedDateKey)

  const nextMonth = getAdjacentMonth(visibleMonth.year, visibleMonth.month, 1)
  const canGoNext = !isFutureProductMonth(nextMonth, currentProductMonth)
  const hasAnyRecords = Object.keys(state.historyRecords).length > 0
  const selectedRecord = state.historyRecords[selectedDateKey] ?? null

  return (
    <HistoryScreen
      monthLabel={formatYearMonthLabel(visibleMonth.year, visibleMonth.month)}
      days={days}
      canGoNext={canGoNext}
      selectedDateKey={selectedDateKey}
      selectedRecord={selectedRecord}
      hasAnyRecords={hasAnyRecords}
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
