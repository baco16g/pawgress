import type { DailyLifecycleState } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import type { DailyHistoryItem, DailyHistoryRecord } from '@/domain/history/history'
import type { Task } from '@/domain/task/task'

const STORAGE_KEY = 'pawgress.dailyLifecycle.v1'

export interface StoredDailyLifecycle {
  dateKey: string
  state: DailyLifecycleState
}

function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.title === 'string' && typeof v.completed === 'boolean'
}

function isValidTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isValidTask)
}

function isValidHistoryItem(value: unknown): value is DailyHistoryItem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.taskId === 'string' &&
    typeof v.title === 'string' &&
    (v.outcome === 'completed' || v.outcome === 'carryOver' || v.outcome === 'inbox')
  )
}

function isValidHistoryRecord(value: unknown): value is DailyHistoryRecord {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.dateKey !== 'string') return false
  if (v.kind === 'rest') return true
  if (v.kind === 'active') return Array.isArray(v.items) && v.items.every(isValidHistoryItem)
  return false
}

function isValidHistoryRecords(value: unknown): value is Record<string, DailyHistoryRecord> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every(isValidHistoryRecord)
}

function isValidState(value: unknown): value is DailyLifecycleState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    isValidTaskArray(v.todayTasks) &&
    isValidTaskArray(v.inboxCandidates) &&
    isValidTaskArray(v.carryOverCandidates) &&
    isValidHistoryRecords(v.historyRecords)
  )
}

function isValidStored(value: unknown): value is StoredDailyLifecycle {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.dateKey === 'string' && isValidState(v.state)
}

export function loadDailyLifecycleState(): StoredDailyLifecycle | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidStored(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveDailyLifecycleState(dateKey: string, state: DailyLifecycleState): void {
  try {
    const stored: StoredDailyLifecycle = { dateKey, state }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // 書き込みに失敗しても何もしない。
  }
}
