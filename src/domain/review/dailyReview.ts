import type { Task } from '@/domain/task/task'

export type Disposition = 'carryOver' | 'inbox'

export interface DailyReviewResult {
  completedSummary: Task[]
  carryOverCandidates: Task[]
  inboxCandidates: Task[]
}

export function resolveDailyReview(
  tasks: Task[],
  dispositions: Readonly<Record<string, Disposition>>,
): DailyReviewResult {
  const completedSummary = tasks.filter((task) => task.completed)
  const unfinished = tasks.filter((task) => !task.completed)

  return {
    completedSummary,
    carryOverCandidates: unfinished.filter((task) => dispositions[task.id] === 'carryOver'),
    inboxCandidates: unfinished.filter((task) => dispositions[task.id] === 'inbox'),
  }
}

export function isDailyReviewResolved(
  tasks: Task[],
  dispositions: Readonly<Record<string, Disposition>>,
): boolean {
  return tasks
    .filter((task) => !task.completed)
    .every((task) => dispositions[task.id] !== undefined)
}
