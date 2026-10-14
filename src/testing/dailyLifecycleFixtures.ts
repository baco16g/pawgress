import type { DailyLifecycleState } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import { createTask } from '@/domain/task/task'

export const INITIAL_LIFECYCLE_STATE: DailyLifecycleState = {
  todayTasks: [],
  inboxCandidates: [
    createTask('牛乳を買う', 'inbox-1'),
    createTask('部屋を片付ける', 'inbox-2'),
    createTask('本を返却する', 'inbox-3'),
  ],
  carryOverCandidates: [
    createTask('資料を確認する', 'carry-1'),
    createTask('メールの下書きを送る', 'carry-2'),
  ],
  historyRecords: {},
}
