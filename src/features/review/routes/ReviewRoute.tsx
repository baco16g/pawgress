import { useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { useSettings } from '@/app/state/settingsContext'
import { getDailyCompanionVariant } from '@/features/companion/model/companionAssets'
import { ReviewScreen } from '@/features/review/ReviewScreen/ReviewScreen'
import type { Disposition } from '@/domain/review/dailyReview'
import { formatTodayLabel, getProductDateKey } from '@/domain/product-day/productDay'
import { useNavVisibility } from '@/app/router/navVisibilityContext'

export function ReviewRoute() {
  const navigate = useNavigate()
  const { setHideNav } = useNavVisibility()
  const { state, dispatch } = useDailyLifecycle()
  const { settings } = useSettings()
  const tasks = state.todayTasks
  const todayDateKey = getProductDateKey()
  const companionVariant = getDailyCompanionVariant(settings.companionSpecies, todayDateKey)

  const [dispositions, setDispositions] = useState<Record<string, Disposition>>({})

  useLayoutEffect(() => {
    setHideNav(true)
    return () => {
      setHideNav(false)
    }
  }, [setHideNav])

  const handleSetDisposition = (id: string, disposition: Disposition) => {
    setDispositions((current) => ({ ...current, [id]: disposition }))
  }

  const handleCompleteReview = () => {
    dispatch({ type: 'review/complete', tasks, dispositions, dateKey: todayDateKey })
    void navigate('/today')
  }

  return (
    <ReviewScreen
      todayLabel={formatTodayLabel()}
      tasks={tasks}
      dispositions={dispositions}
      companionSpecies={settings.companionSpecies}
      companionVariant={companionVariant}
      onSetDisposition={handleSetDisposition}
      onCompleteReview={handleCompleteReview}
    />
  )
}
