import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { useSettings } from '@/app/state/settingsContext'
import { getCompanionAtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import { getDailyCompanionVariant } from '@/features/companion/model/companionAssets'
import { InboxScreen } from '@/features/inbox/InboxScreen/InboxScreen'
import { canAddInboxTask } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import { getProductDateKey } from '@/domain/product-day/productDay'

export function InboxRoute() {
  const { state, dispatch } = useDailyLifecycle()
  const { settings } = useSettings()
  const todayDateKey = getProductDateKey()
  const companionVariant = getDailyCompanionVariant(settings.companionSpecies, todayDateKey)
  const atmospherePreset = getCompanionAtmospherePreset(companionVariant)

  const handleAddTask = (title: string) => {
    dispatch({ type: 'inbox/prependTask', title })
  }

  const handleDeleteTask = (id: string) => {
    dispatch({ type: 'inbox/deleteTask', id })
  }

  return (
    <InboxScreen
      tasks={state.inboxCandidates}
      onAddTask={handleAddTask}
      onDeleteTask={handleDeleteTask}
      canCapture={canAddInboxTask(state.inboxCandidates)}
      atmospherePreset={atmospherePreset}
    />
  )
}
