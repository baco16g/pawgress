import type { DailyHistoryRecord } from '@/domain/history/history'
import type { Task } from '@/domain/task/task'

export const MIN_TODAY_TASKS = 1

export type TodayLifecycleState = 'setup' | 'active' | 'rest' | 'done'

// Review済みの日はkind:'active'（取り組んだ日）の記録として残るため、それを「完了」と読む。
export function deriveTodayLifecycleState(
  todayTasks: readonly Task[],
  todayRecord: DailyHistoryRecord | undefined,
): TodayLifecycleState {
  if (todayTasks.length > 0) return 'active'
  if (todayRecord?.kind === 'rest') return 'rest'
  if (todayRecord?.kind === 'active') return 'done'
  return 'setup'
}

export function toggleTodaySelection(
  selectedIds: ReadonlySet<string>,
  id: string,
  maxSelection: number,
): ReadonlySet<string> {
  const next = new Set(selectedIds)
  if (next.has(id)) {
    next.delete(id)
  } else if (next.size < maxSelection) {
    next.add(id)
  }
  return next
}

export interface TodayStartResult {
  todayTasks: Task[]
  remainingInbox: Task[]
}

export function resolveTodayStart(
  carryOverCandidates: Task[],
  inboxCandidates: Task[],
  selectedIds: ReadonlySet<string>,
): TodayStartResult {
  const isSelected = (task: Task) => selectedIds.has(task.id)

  const todayTasks = [...carryOverCandidates, ...inboxCandidates].filter(isSelected)
  const remainingInbox = [
    ...inboxCandidates.filter((task) => !isSelected(task)),
    ...carryOverCandidates.filter((task) => !isSelected(task)),
  ]

  return { todayTasks, remainingInbox }
}

export interface StaleTodayResolution {
  todayTasks: Task[]
  carryOverCandidates: Task[]
}

export function resolveStaleTodayTasks(
  todayTasks: Task[],
  carryOverCandidates: Task[],
  savedDateKey: string,
  currentDateKey: string,
): StaleTodayResolution {
  if (savedDateKey === currentDateKey || todayTasks.length === 0) {
    return { todayTasks, carryOverCandidates }
  }

  const revertedTasks = todayTasks.map((task) => ({ ...task, completed: false }))
  return { todayTasks: [], carryOverCandidates: [...carryOverCandidates, ...revertedTasks] }
}

export function removeHistoryRecord(
  historyRecords: Record<string, DailyHistoryRecord>,
  dateKey: string,
): Record<string, DailyHistoryRecord> {
  return Object.fromEntries(Object.entries(historyRecords).filter(([key]) => key !== dateKey))
}

export interface CancelReviewResult {
  todayTasks: Task[]
  carryOverCandidates: Task[]
  inboxCandidates: Task[]
}

export function resolveCancelReview(
  record: Extract<DailyHistoryRecord, { kind: 'active' }>,
  carryOverCandidates: Task[],
  inboxCandidates: Task[],
): CancelReviewResult {
  const todayTasks: Task[] = record.items.map((item) => ({
    id: item.taskId,
    title: item.title,
    completed: item.outcome === 'completed',
  }))
  const restoredIds = new Set(record.items.map((item) => item.taskId))
  return {
    todayTasks,
    carryOverCandidates: carryOverCandidates.filter((task) => !restoredIds.has(task.id)),
    inboxCandidates: inboxCandidates.filter((task) => !restoredIds.has(task.id)),
  }
}
