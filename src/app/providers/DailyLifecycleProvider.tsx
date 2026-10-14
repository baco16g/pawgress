import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react'
import { DailyLifecycleContext } from '@/app/state/dailyLifecycleContext'
import {
  dailyLifecycleReducer,
  type DailyLifecycleAction,
  type DailyLifecycleState,
} from '@/domain/daily-lifecycle/dailyLifecycleStore'
import {
  loadDailyLifecycleState,
  saveDailyLifecycleState,
} from '@/app/persistence/dailyLifecycleStorage'
import { resolveStaleTodayTasks } from '@/domain/daily-lifecycle/todayLifecycle'
import { getProductDateKey } from '@/domain/product-day/productDay'
import { createTask } from '@/domain/task/task'

// 保存データが無い初回起動用。「例：」付きで明らかにサンプルと分かるtaskを
// Inboxにだけ置く（削除で消せるように）。
const FIRST_LAUNCH_STATE: DailyLifecycleState = {
  todayTasks: [],
  inboxCandidates: [
    createTask('例：牛乳を買う', 'sample-1'),
    createTask('例：資料を確認する', 'sample-2'),
  ],
  carryOverCandidates: [],
  historyRecords: {},
}

function loadInitialState(currentDateKey: string): DailyLifecycleState {
  const stored = loadDailyLifecycleState()
  if (!stored) return FIRST_LAUNCH_STATE

  const { todayTasks, carryOverCandidates } = resolveStaleTodayTasks(
    stored.state.todayTasks,
    stored.state.carryOverCandidates,
    stored.dateKey,
    currentDateKey,
  )
  return { ...stored.state, todayTasks, carryOverCandidates }
}

export interface DailyLifecycleProviderProps {
  children: ReactNode
  // 渡すと保存データを読み書きせず、このstateから始める（Storybook・テスト用）。
  initialState?: DailyLifecycleState
}

export function DailyLifecycleProvider({ children, initialState }: DailyLifecycleProviderProps) {
  const [initial] = useState(() => {
    const dateKey = getProductDateKey()
    return {
      dateKey,
      persist: initialState === undefined,
      state: initialState ?? loadInitialState(dateKey),
    }
  })
  const [state, dispatch] = useReducer(dailyLifecycleReducer, initial.state)
  // stateがどのProduct Dayのものか。保存時刻ではなくこの日付で保存しないと、
  // 開いたまま日付をまたいだ操作で前日のtodayTasksが今日のものとして保存される。
  const [stateDateKey, setStateDateKey] = useState(initial.dateKey)

  const rollOverIfDayChanged = useCallback((): string => {
    const currentDateKey = getProductDateKey()
    if (currentDateKey !== stateDateKey) {
      setStateDateKey(currentDateKey)
      dispatch({ type: 'today/rollover' })
    }
    return currentDateKey
  }, [stateDateKey])

  const dispatchForCurrentDay = useCallback(
    (action: DailyLifecycleAction) => {
      const currentDateKey = rollOverIfDayChanged()
      // 日付が変わる前に描画された画面からの操作は、前日のrecordを書き換えてしまう。
      if ('dateKey' in action && action.dateKey !== currentDateKey) return
      dispatch(action)
    },
    [rollOverIfDayChanged],
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') rollOverIfDayChanged()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [rollOverIfDayChanged])

  useEffect(() => {
    if (!initial.persist) return
    saveDailyLifecycleState(stateDateKey, state)
  }, [initial.persist, state, stateDateKey])

  return (
    <DailyLifecycleContext.Provider value={{ state, dispatch: dispatchForCurrentDay }}>
      {children}
    </DailyLifecycleContext.Provider>
  )
}
