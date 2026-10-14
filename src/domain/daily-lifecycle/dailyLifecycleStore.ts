import { createTask, toggleTaskCompletion, type Task } from '@/domain/task/task'
import type { Disposition } from '@/domain/review/dailyReview'
import { resolveDailyReview } from '@/domain/review/dailyReview'
import {
  buildActiveHistoryRecord,
  buildRestHistoryRecord,
  type DailyHistoryRecord,
} from '@/domain/history/history'
import {
  carryOverTodayTasks,
  removeHistoryRecord,
  resolveCancelReview,
  resolveTodayStart,
} from './todayLifecycle'

export interface DailyLifecycleState {
  todayTasks: Task[]
  inboxCandidates: Task[]
  carryOverCandidates: Task[]
  historyRecords: Record<string, DailyHistoryRecord>
}

export const MAX_INBOX_TASKS = 10

export function canAddInboxTask(inboxTasks: Task[], limit: number = MAX_INBOX_TASKS): boolean {
  return inboxTasks.length < limit
}

export type DailyLifecycleAction =
  | { type: 'inbox/appendTask'; title: string }
  | { type: 'inbox/prependTask'; title: string }
  | { type: 'inbox/deleteTask'; id: string }
  | { type: 'today/start'; selectedIds: ReadonlySet<string> }
  | { type: 'today/toggleTask'; id: string }
  | { type: 'today/addTask'; title: string }
  | {
      type: 'review/complete'
      tasks: Task[]
      dispositions: Readonly<Record<string, Disposition>>
      dateKey: string
    }
  | {
      type: 'today/rest'
      dateKey: string
    }
  | {
      type: 'today/cancelRest'
      dateKey: string
    }
  | {
      type: 'today/cancelReview'
      dateKey: string
    }
  | {
      type: 'today/abandon'
    }
  | {
      type: 'today/rollover'
    }

export function dailyLifecycleReducer(
  state: DailyLifecycleState,
  action: DailyLifecycleAction,
): DailyLifecycleState {
  switch (action.type) {
    case 'inbox/appendTask': {
      if (!canAddInboxTask(state.inboxCandidates)) return state
      return { ...state, inboxCandidates: [...state.inboxCandidates, createTask(action.title)] }
    }

    case 'inbox/prependTask': {
      if (!canAddInboxTask(state.inboxCandidates)) return state
      return { ...state, inboxCandidates: [createTask(action.title), ...state.inboxCandidates] }
    }

    case 'inbox/deleteTask':
      return {
        ...state,
        inboxCandidates: state.inboxCandidates.filter((task) => task.id !== action.id),
      }

    case 'today/start': {
      const { todayTasks, remainingInbox } = resolveTodayStart(
        state.carryOverCandidates,
        state.inboxCandidates,
        action.selectedIds,
      )
      return { ...state, todayTasks, inboxCandidates: remainingInbox, carryOverCandidates: [] }
    }

    case 'today/toggleTask':
      return {
        ...state,
        todayTasks: state.todayTasks.map((task) =>
          task.id === action.id ? toggleTaskCompletion(task) : task,
        ),
      }

    case 'today/addTask':
      return { ...state, todayTasks: [...state.todayTasks, createTask(action.title)] }

    case 'review/complete': {
      // todayTasksが空のまま完了すると、その日のrecordを空の内容で上書きしてしまう
      // （完了直後の連打や、完了後に戻る操作で開いたReviewから届く）。
      if (state.todayTasks.length === 0) return state
      if (state.historyRecords[action.dateKey]?.kind === 'rest') return state

      const { carryOverCandidates, inboxCandidates } = resolveDailyReview(
        action.tasks,
        action.dispositions,
      )
      const historyRecord = buildActiveHistoryRecord(
        action.dateKey,
        action.tasks,
        action.dispositions,
      )
      return {
        todayTasks: [],
        inboxCandidates: [...state.inboxCandidates, ...inboxCandidates],
        carryOverCandidates: [...state.carryOverCandidates, ...carryOverCandidates],
        historyRecords: { ...state.historyRecords, [action.dateKey]: historyRecord },
      }
    }

    case 'today/rest': {
      const historyRecord = buildRestHistoryRecord(action.dateKey)
      return {
        ...state,
        historyRecords: { ...state.historyRecords, [action.dateKey]: historyRecord },
      }
    }

    case 'today/cancelRest': {
      if (state.historyRecords[action.dateKey]?.kind !== 'rest') return state
      return {
        ...state,
        historyRecords: removeHistoryRecord(state.historyRecords, action.dateKey),
      }
    }

    case 'today/cancelReview': {
      const record = state.historyRecords[action.dateKey]
      if (record?.kind !== 'active') return state

      const { todayTasks, carryOverCandidates, inboxCandidates } = resolveCancelReview(
        record,
        state.carryOverCandidates,
        state.inboxCandidates,
      )

      return {
        ...state,
        todayTasks,
        carryOverCandidates,
        inboxCandidates,
        historyRecords: removeHistoryRecord(state.historyRecords, action.dateKey),
      }
    }

    case 'today/abandon': {
      const abandonedTasks = state.todayTasks.map((task) => ({ ...task, completed: false }))
      return {
        ...state,
        todayTasks: [],
        inboxCandidates: [...state.inboxCandidates, ...abandonedTasks],
      }
    }

    case 'today/rollover': {
      const { todayTasks, carryOverCandidates } = carryOverTodayTasks(
        state.todayTasks,
        state.carryOverCandidates,
      )
      return { ...state, todayTasks, carryOverCandidates }
    }

    default:
      return state
  }
}
