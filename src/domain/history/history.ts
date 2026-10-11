import type { Disposition } from '@/domain/review/dailyReview'
import type { Task } from '@/domain/task/task'

export type HistoryOutcome = 'completed' | Disposition

export interface DailyHistoryItem {
  taskId: string
  title: string
  outcome: HistoryOutcome
}

export type DailyHistoryRecord =
  { dateKey: string; kind: 'active'; items: DailyHistoryItem[] } | { dateKey: string; kind: 'rest' }

export function buildActiveHistoryRecord(
  dateKey: string,
  tasks: readonly Task[],
  dispositions: Readonly<Record<string, Disposition>>,
): DailyHistoryRecord {
  const items: DailyHistoryItem[] = tasks.map((task) => ({
    taskId: task.id,
    title: task.title,
    outcome: task.completed ? 'completed' : (dispositions[task.id] ?? 'inbox'),
  }))
  return { dateKey, kind: 'active', items }
}

export function buildRestHistoryRecord(dateKey: string): DailyHistoryRecord {
  return { dateKey, kind: 'rest' }
}

export interface HeatInput {
  totalTasks: number
  completedTasks: number
}

export function getHistoryHeatInput(record: DailyHistoryRecord): HeatInput | null {
  if (record.kind !== 'active') return null
  return {
    totalTasks: record.items.length,
    completedTasks: record.items.filter((item) => item.outcome === 'completed').length,
  }
}

const HEAT_VOLUME_CAP = 5

const COMPLETION_RATIO_WEIGHT = 0.7
const VOLUME_BONUS_WEIGHT = 0.3

function volumeScore(totalTasks: number, cap: number = HEAT_VOLUME_CAP): number {
  if (cap <= 0) return 0
  return Math.min(totalTasks, cap) / cap
}

function completionRatio({ totalTasks, completedTasks }: HeatInput): number {
  if (totalTasks <= 0) return 0
  return completedTasks / totalTasks
}

export function calculateHeatScore(input: HeatInput): number {
  return (
    completionRatio(input) *
    (COMPLETION_RATIO_WEIGHT + VOLUME_BONUS_WEIGHT * volumeScore(input.totalTasks))
  )
}

export function activeHeatScoreToLevel(heat: number, levels = 4): number {
  const clamped = Math.min(Math.max(heat, 0), 1)
  const index = Math.min(levels - 1, Math.floor(clamped * levels))
  return index + 1
}
