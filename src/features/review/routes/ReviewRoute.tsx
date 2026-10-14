import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { useSettings } from '@/app/state/settingsContext'
import { getDailyCompanionVariant } from '@/features/companion/model/companionAssets'
import { ReviewScreen } from '@/features/review/ReviewScreen/ReviewScreen'
import { deriveTodayLifecycleState } from '@/domain/daily-lifecycle/todayLifecycle'
import type { Disposition } from '@/domain/review/dailyReview'
import { formatTodayLabel, getProductDateKey } from '@/domain/product-day/productDay'
import { useHideNavWhileMounted } from '@/app/state/navVisibilityContext'

export function ReviewRoute() {
  useHideNavWhileMounted()
  const navigate = useNavigate()
  const { state, dispatch } = useDailyLifecycle()
  const { settings } = useSettings()
  const tasks = state.todayTasks
  const todayDateKey = getProductDateKey()
  const companionVariant = getDailyCompanionVariant(settings.companionSpecies, todayDateKey)

  const [dispositions, setDispositions] = useState<Record<string, Disposition>>({})
  // Reviewは実行中のTodayから開いた日のうちだけ表示する。開いた時点の状態で判定するのは、
  // 「1日を終える」からTodayが描画されるまでの間にReviewが空白になるのを避けるため。
  const [activeDateKeyWhenOpened] = useState(() =>
    deriveTodayLifecycleState(tasks, state.historyRecords[todayDateKey]) === 'active'
      ? todayDateKey
      : null,
  )

  if (activeDateKeyWhenOpened !== todayDateKey) {
    return <Navigate to="/today" replace />
  }

  const handleSetDisposition = (id: string, disposition: Disposition) => {
    setDispositions((current) => ({ ...current, [id]: disposition }))
  }

  const handleCompleteReview = () => {
    dispatch({ type: 'review/complete', tasks, dispositions, dateKey: todayDateKey })
    void navigate('/today', { replace: true })
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
