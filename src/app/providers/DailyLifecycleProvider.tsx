import { useEffect, useReducer, useState, type ReactNode } from 'react'
import { DailyLifecycleContext } from '@/app/state/dailyLifecycleContext'
import {
  dailyLifecycleReducer,
  type DailyLifecycleState,
} from '@/domain/daily-lifecycle/dailyLifecycleStore'
import {
  loadDailyLifecycleState,
  saveDailyLifecycleState,
} from '@/app/persistence/dailyLifecycleStorage'
import { resolveStaleTodayTasks } from '@/domain/daily-lifecycle/todayLifecycle'
import { getProductDateKey } from '@/domain/product-day/productDay'
import { createTask } from '@/domain/task/task'
import { INITIAL_LIFECYCLE_STATE } from './__fixtures__/dailyLifecycleFixtures'

// 実際の初回起動（persist=true、保存データ無し）専用。INITIAL_LIFECYCLE_STATEは
// Storybook/既存テストが依存しているためここでは使わず、「例：」付きで明らかに
// サンプルと分かるtaskをInboxにだけ置く（削除で消せるように）。
const FIRST_LAUNCH_STATE: DailyLifecycleState = {
  todayTasks: [],
  inboxCandidates: [
    createTask('例：牛乳を買う', 'sample-1'),
    createTask('例：資料を確認する', 'sample-2'),
  ],
  carryOverCandidates: [],
  historyRecords: {},
}

function buildInitialState(persist: boolean): DailyLifecycleState {
  if (!persist) return INITIAL_LIFECYCLE_STATE

  const stored = loadDailyLifecycleState()
  if (!stored) return FIRST_LAUNCH_STATE

  const { todayTasks, carryOverCandidates } = resolveStaleTodayTasks(
    stored.state.todayTasks,
    stored.state.carryOverCandidates,
    stored.dateKey,
    getProductDateKey(),
  )
  return { ...stored.state, todayTasks, carryOverCandidates }
}

export interface DailyLifecycleProviderProps {
  children: ReactNode
  persist?: boolean
}

export function DailyLifecycleProvider({ children, persist = false }: DailyLifecycleProviderProps) {
  const [initialState] = useState(() => buildInitialState(persist))
  const [state, dispatch] = useReducer(dailyLifecycleReducer, initialState)

  useEffect(() => {
    if (!persist) return
    saveDailyLifecycleState(getProductDateKey(), state)
  }, [persist, state])

  return (
    <DailyLifecycleContext.Provider value={{ state, dispatch }}>
      {children}
    </DailyLifecycleContext.Provider>
  )
}
