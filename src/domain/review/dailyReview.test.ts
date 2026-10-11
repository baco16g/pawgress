import { describe, expect, it } from 'vitest'
import { isDailyReviewResolved, resolveDailyReview } from './dailyReview'
import type { Task } from '@/domain/task/task'

const tasks: Task[] = [
  { id: 't1', title: '牛乳を買う', completed: true },
  { id: 't2', title: '資料を確認する', completed: false },
  { id: 't3', title: 'メールの下書きを送る', completed: false },
]

describe('resolveDailyReview', () => {
  it('completedなtaskはcompletedSummaryに入る', () => {
    const result = resolveDailyReview(tasks, {})
    expect(result.completedSummary.map((t) => t.id)).toEqual(['t1'])
  })

  it('carry-overを選んだtaskはcarryOverCandidatesに入る', () => {
    const result = resolveDailyReview(tasks, { t2: 'carryOver' })
    expect(result.carryOverCandidates.map((t) => t.id)).toEqual(['t2'])
  })

  it('inboxを選んだtaskはinboxCandidatesに入る', () => {
    const result = resolveDailyReview(tasks, { t2: 'inbox' })
    expect(result.inboxCandidates.map((t) => t.id)).toEqual(['t2'])
  })

  it('未決定のtaskはどちらにも入らない', () => {
    const result = resolveDailyReview(tasks, {})
    expect(result.carryOverCandidates).toHaveLength(0)
    expect(result.inboxCandidates).toHaveLength(0)
  })

  it('各taskのdispositionは独立して解決される', () => {
    const result = resolveDailyReview(tasks, { t2: 'carryOver', t3: 'inbox' })
    expect(result.carryOverCandidates.map((t) => t.id)).toEqual(['t2'])
    expect(result.inboxCandidates.map((t) => t.id)).toEqual(['t3'])
  })
})

describe('isDailyReviewResolved', () => {
  it('未決定の未完了taskがあればfalse', () => {
    expect(isDailyReviewResolved(tasks, {})).toBe(false)
  })

  it('全ての未完了taskが決定済みならtrue', () => {
    expect(isDailyReviewResolved(tasks, { t2: 'carryOver', t3: 'inbox' })).toBe(true)
  })

  it('一部だけ決定済みならfalse', () => {
    expect(isDailyReviewResolved(tasks, { t2: 'carryOver' })).toBe(false)
  })

  it('全taskがcompletedならdisposition無しでtrue（All Completed）', () => {
    const allCompleted: Task[] = [{ id: 't1', title: '牛乳を買う', completed: true }]
    expect(isDailyReviewResolved(allCompleted, {})).toBe(true)
  })

  it('task 0件でもtrue（defensive handling）', () => {
    expect(isDailyReviewResolved([], {})).toBe(true)
  })
})
