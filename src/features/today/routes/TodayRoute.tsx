import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { useSettings } from '@/app/state/settingsContext'
import { getDailyCompanionVariant } from '@/features/companion/model/companionAssets'
import { TodayActiveScreen } from '@/features/today/TodayActiveScreen/TodayActiveScreen'
import { TodayDoneScreen } from '@/features/today/TodayDoneScreen/TodayDoneScreen'
import { TodayRestScreen } from '@/features/today/TodayRestScreen/TodayRestScreen'
import { TodaySetupScreen } from '@/features/today/TodaySetupScreen/TodaySetupScreen'
import { canAddInboxTask } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import { formatTodayLabel, getProductDateKey } from '@/domain/product-day/productDay'

const MIN_SELECTION = 1

export function TodayRoute() {
  const navigate = useNavigate()
  const { state, dispatch } = useDailyLifecycle()
  const { settings } = useSettings()

  const todayDateKey = getProductDateKey()
  const companionVariant = getDailyCompanionVariant(settings.companionSpecies, todayDateKey)
  const isRestToday = state.historyRecords[todayDateKey]?.kind === 'rest'
  const isReviewedToday = state.historyRecords[todayDateKey]?.kind === 'active'
  const lifecycleState =
    state.todayTasks.length > 0
      ? 'active'
      : isRestToday
        ? 'rest'
        : isReviewedToday
          ? 'done'
          : 'setup'
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [justCancelledRest, setJustCancelledRest] = useState(false)

  const handleToggleSelect = (id: string) => {
    setJustCancelledRest(false)
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < settings.maxTodayTasks) {
        next.add(id)
      }
      return next
    })
  }

  const handleAddCandidate = (title: string) => {
    setJustCancelledRest(false)
    dispatch({ type: 'inbox/appendTask', title })
  }

  const handleStartToday = () => {
    if (selectedIds.size < MIN_SELECTION) return

    setJustCancelledRest(false)
    dispatch({ type: 'today/start', selectedIds })
    setSelectedIds(new Set())
  }

  const handleConfirmRest = () => {
    setJustCancelledRest(false)
    dispatch({ type: 'today/rest', dateKey: todayDateKey })
  }

  const handleCancelRest = () => {
    dispatch({ type: 'today/cancelRest', dateKey: todayDateKey })
    setJustCancelledRest(true)
  }

  const handleCancelReview = () => {
    dispatch({ type: 'today/cancelReview', dateKey: todayDateKey })
  }

  const handleAbandonToday = () => {
    dispatch({ type: 'today/abandon' })
  }

  const handleToggleTask = (id: string) => {
    dispatch({ type: 'today/toggleTask', id })
  }

  const handleAddTask = (title: string) => {
    dispatch({ type: 'today/addTask', title })
  }

  const handleOpenSettings = (): void => {
    void navigate('/settings')
  }

  const handleOpenReview = (): void => {
    void navigate('/review')
  }

  if (lifecycleState === 'rest') {
    return (
      <TodayRestScreen
        todayLabel={formatTodayLabel()}
        companionSpecies={settings.companionSpecies}
        companionVariant={companionVariant}
        onCancelRest={handleCancelRest}
        onOpenSettings={handleOpenSettings}
      />
    )
  }

  if (lifecycleState === 'setup') {
    return (
      <TodaySetupScreen
        todayLabel={formatTodayLabel()}
        carryOverCandidates={state.carryOverCandidates}
        inboxCandidates={state.inboxCandidates}
        selectedIds={selectedIds}
        minSelection={MIN_SELECTION}
        maxSelection={settings.maxTodayTasks}
        companionSpecies={settings.companionSpecies}
        companionVariant={companionVariant}
        canCaptureInboxCandidate={canAddInboxTask(state.inboxCandidates)}
        justCancelledRest={justCancelledRest}
        onToggleSelect={handleToggleSelect}
        onAddCandidate={handleAddCandidate}
        onStartToday={handleStartToday}
        onConfirmRest={handleConfirmRest}
        onOpenSettings={handleOpenSettings}
      />
    )
  }

  if (lifecycleState === 'done') {
    return (
      <TodayDoneScreen
        todayLabel={formatTodayLabel()}
        companionSpecies={settings.companionSpecies}
        companionVariant={companionVariant}
        onCancelReview={handleCancelReview}
        onOpenSettings={handleOpenSettings}
      />
    )
  }

  return (
    <TodayActiveScreen
      todayLabel={formatTodayLabel()}
      tasks={state.todayTasks}
      companionSpecies={settings.companionSpecies}
      companionVariant={companionVariant}
      onToggleTask={handleToggleTask}
      onAddTask={handleAddTask}
      onOpenSettings={handleOpenSettings}
      onOpenReview={handleOpenReview}
      onAbandonToday={handleAbandonToday}
    />
  )
}
