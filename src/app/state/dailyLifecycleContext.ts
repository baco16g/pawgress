import { createContext, useContext, type Dispatch } from 'react'
import type {
  DailyLifecycleAction,
  DailyLifecycleState,
} from '@/domain/daily-lifecycle/dailyLifecycleStore'

export interface DailyLifecycleContextValue {
  state: DailyLifecycleState
  dispatch: Dispatch<DailyLifecycleAction>
}

export const DailyLifecycleContext = createContext<DailyLifecycleContextValue | null>(null)

export function useDailyLifecycle(): DailyLifecycleContextValue {
  const context = useContext(DailyLifecycleContext)
  if (!context) {
    throw new Error('useDailyLifecycle must be used within DailyLifecycleProvider')
  }
  return context
}
