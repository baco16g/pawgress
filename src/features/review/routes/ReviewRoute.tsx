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
  // 完了後の「戻る」やURLの直接入力で、実行中以外から開かれたReviewはTodayへ戻す。
  // 判定を開いた時点に限るのは、「1日を終える」からTodayが描画されるまでの間に
  // Reviewが空白になるのを避けるため。
  const [openedWhileActive] = useState(
    () => deriveTodayLifecycleState(tasks, state.historyRecords[todayDateKey]) === 'active',
  )

  if (!openedWhileActive) {
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
