import {
  buildActiveHistoryRecord,
  buildRestHistoryRecord,
  type DailyHistoryRecord,
} from '@/domain/history/history'
import { createTask, type Task } from '@/domain/task/task'

function tasksWithCompletion(total: number, completed: number, dateKey: string): Task[] {
  return Array.from({ length: total }, (_, index) => ({
    ...createTask(`${dateKey}のタスク${String(index + 1)}`, `${dateKey}-${String(index)}`),
    completed: index < completed,
  }))
}

export function buildSampleMonthRecords(): Record<string, DailyHistoryRecord> {
  return {
    '2026-10-02': buildActiveHistoryRecord(
      '2026-10-02',
      tasksWithCompletion(1, 1, '2026-10-02'),
      {},
    ),
    '2026-10-04': buildActiveHistoryRecord(
      '2026-10-04',
      tasksWithCompletion(3, 1, '2026-10-04'),
      {},
    ),
    '2026-10-06': buildActiveHistoryRecord(
      '2026-10-06',
      tasksWithCompletion(3, 2, '2026-10-06'),
      {},
    ),
    '2026-10-08': buildActiveHistoryRecord(
      '2026-10-08',
      tasksWithCompletion(3, 3, '2026-10-08'),
      {},
    ),
    '2026-10-10': buildActiveHistoryRecord(
      '2026-10-10',
      tasksWithCompletion(5, 3, '2026-10-10'),
      {},
    ),
    '2026-10-12': buildActiveHistoryRecord(
      '2026-10-12',
      tasksWithCompletion(5, 5, '2026-10-12'),
      {},
    ),
    '2026-10-14': buildRestHistoryRecord('2026-10-14'),
  }
}

export function buildMixedDayRecord(dateKey: string): DailyHistoryRecord {
  const completed = { ...createTask('完了したタスク', 'mixed-1'), completed: true }
  const carryOver = createTask('持ち越したタスク', 'mixed-2')
  const toInbox = createTask('Inboxへ戻したタスク', 'mixed-3')
  return buildActiveHistoryRecord(dateKey, [completed, carryOver, toInbox], {
    'mixed-2': 'carryOver',
    'mixed-3': 'inbox',
  })
}
