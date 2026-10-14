import { describe, expect, it } from 'vitest'
import {
  deriveTodayLifecycleState,
  removeHistoryRecord,
  resolveCancelReview,
  resolveStaleTodayTasks,
  resolveTodayStart,
  toggleTodaySelection,
} from './todayLifecycle'
import type { Task } from '@/domain/task/task'
import type { DailyHistoryRecord } from '@/domain/history/history'

const carryOver: Task[] = [
  { id: 'carry-1', title: '資料を確認する', completed: false },
  { id: 'carry-2', title: 'メールの下書きを送る', completed: false },
]
const inbox: Task[] = [
  { id: 'inbox-1', title: '牛乳を買う', completed: false },
  { id: 'inbox-2', title: '部屋を片付ける', completed: false },
]

describe('deriveTodayLifecycleState', () => {
  const activeRecord: DailyHistoryRecord = { dateKey: '2026-10-14', kind: 'active', items: [] }
  const restRecord: DailyHistoryRecord = { dateKey: '2026-10-14', kind: 'rest' }

  it('todayTasksも当日の記録も無ければsetup', () => {
    expect(deriveTodayLifecycleState([], undefined)).toBe('setup')
  })

  it('todayTasksがあればactive', () => {
    expect(deriveTodayLifecycleState(inbox, undefined)).toBe('active')
  })

  it('当日がrestの記録ならrest', () => {
    expect(deriveTodayLifecycleState([], restRecord)).toBe('rest')
  })

  it('当日がReview済み（kind: active）の記録ならdone', () => {
    expect(deriveTodayLifecycleState([], activeRecord)).toBe('done')
  })

  it('todayTasksがあれば、当日の記録の種類に関わらずactiveを優先する', () => {
    expect(deriveTodayLifecycleState(inbox, restRecord)).toBe('active')
    expect(deriveTodayLifecycleState(inbox, activeRecord)).toBe('active')
  })
})

describe('toggleTodaySelection', () => {
  it('未選択のidは上限未満なら追加される', () => {
    expect([...toggleTodaySelection(new Set(['a']), 'b', 3)]).toEqual(['a', 'b'])
  })

  it('選択済みのidは解除される', () => {
    expect([...toggleTodaySelection(new Set(['a', 'b']), 'a', 3)]).toEqual(['b'])
  })

  it('上限に達している場合、未選択のidは追加されない', () => {
    expect([...toggleTodaySelection(new Set(['a', 'b']), 'c', 2)]).toEqual(['a', 'b'])
  })

  it('上限に達していても、選択済みのidは解除できる', () => {
    expect([...toggleTodaySelection(new Set(['a', 'b']), 'b', 2)]).toEqual(['a'])
  })

  it('元のSetは変更しない', () => {
    const selected = new Set(['a'])
    toggleTodaySelection(selected, 'b', 3)

    expect([...selected]).toEqual(['a'])
  })
})

describe('resolveTodayStart', () => {
  it('選択されたcarry-overはTodayへ入る', () => {
    const { todayTasks } = resolveTodayStart(carryOver, inbox, new Set(['carry-1']))

    expect(todayTasks.map((t) => t.id)).toContain('carry-1')
  })

  it('選択されなかったcarry-overはInboxへ戻る', () => {
    const { remainingInbox } = resolveTodayStart(carryOver, inbox, new Set(['carry-1']))

    expect(remainingInbox.map((t) => t.id)).toContain('carry-2')
  })

  it('選択されたInbox candidateはTodayへ入る', () => {
    const { todayTasks } = resolveTodayStart(carryOver, inbox, new Set(['inbox-1']))

    expect(todayTasks.map((t) => t.id)).toContain('inbox-1')
  })

  it('選択されなかったInbox candidateはInboxに残る', () => {
    const { remainingInbox } = resolveTodayStart(carryOver, inbox, new Set(['inbox-1']))

    expect(remainingInbox.map((t) => t.id)).toContain('inbox-2')
  })

  it('選択されたtaskはremainingInboxに含まれない', () => {
    const { remainingInbox } = resolveTodayStart(carryOver, inbox, new Set(['carry-1', 'inbox-1']))

    expect(remainingInbox.map((t) => t.id)).not.toContain('carry-1')
    expect(remainingInbox.map((t) => t.id)).not.toContain('inbox-1')
  })

  it('0件選択時はtodayTasksが空、remainingInboxが全候補になる', () => {
    const { todayTasks, remainingInbox } = resolveTodayStart(carryOver, inbox, new Set())

    expect(todayTasks).toHaveLength(0)
    expect(remainingInbox).toHaveLength(4)
  })
})

describe('resolveStaleTodayTasks', () => {
  const today: Task[] = [
    { id: 'today-1', title: '資料を確認する', completed: true },
    { id: 'today-2', title: '牛乳を買う', completed: false },
  ]

  it('dateKeyが同じ場合は変更しない', () => {
    const result = resolveStaleTodayTasks(today, [], '2026-10-05', '2026-10-05')

    expect(result.todayTasks).toBe(today)
    expect(result.carryOverCandidates).toEqual([])
  })

  it('todayTasksが空の場合はdateKeyが異なっても変更しない', () => {
    const result = resolveStaleTodayTasks([], carryOver, '2026-10-04', '2026-10-05')

    expect(result.todayTasks).toHaveLength(0)
    expect(result.carryOverCandidates).toBe(carryOver)
  })

  it('dateKeyが異なる場合、todayTasksは空になりcarryOverCandidatesへ全て移る', () => {
    const result = resolveStaleTodayTasks(today, carryOver, '2026-10-04', '2026-10-05')

    expect(result.todayTasks).toHaveLength(0)
    expect(result.carryOverCandidates.map((t) => t.id)).toEqual([
      'carry-1',
      'carry-2',
      'today-1',
      'today-2',
    ])
  })

  it('completed済みのtaskもcarryOverへ移す際にcompletedがfalseへリセットされる', () => {
    const result = resolveStaleTodayTasks(today, [], '2026-10-04', '2026-10-05')

    const moved = result.carryOverCandidates.find((t) => t.id === 'today-1')
    expect(moved?.completed).toBe(false)
  })
})

describe('removeHistoryRecord', () => {
  const records: Record<string, DailyHistoryRecord> = {
    '2026-10-04': { dateKey: '2026-10-04', kind: 'rest' },
    '2026-10-05': { dateKey: '2026-10-05', kind: 'rest' },
  }

  it('指定したdateKeyのrecordだけを取り除く', () => {
    const result = removeHistoryRecord(records, '2026-10-04')

    expect(Object.keys(result)).toEqual(['2026-10-05'])
  })

  it('存在しないdateKeyを指定してもno-op', () => {
    const result = removeHistoryRecord(records, '2026-10-06')

    expect(result).toEqual(records)
  })
})

describe('resolveCancelReview', () => {
  const record: Extract<DailyHistoryRecord, { kind: 'active' }> = {
    dateKey: '2026-10-04',
    kind: 'active',
    items: [
      { taskId: 't1', title: '完了したタスク', outcome: 'completed' },
      { taskId: 't2', title: '持ち越したタスク', outcome: 'carryOver' },
      { taskId: 't3', title: 'Inboxへ戻したタスク', outcome: 'inbox' },
    ],
  }

  it('record.itemsからtodayTasksを復元し、completedの状態も反映する', () => {
    const result = resolveCancelReview(record, [], [])

    expect(result.todayTasks).toEqual([
      { id: 't1', title: '完了したタスク', completed: true },
      { id: 't2', title: '持ち越したタスク', completed: false },
      { id: 't3', title: 'Inboxへ戻したタスク', completed: false },
    ])
  })

  it('このreviewで振り分けられたtaskだけをcarryOver/inboxから取り除く', () => {
    const otherCarryOver: Task = { id: 'other-1', title: '別の持ち越し', completed: false }
    const otherInbox: Task = { id: 'other-2', title: '別のInbox候補', completed: false }

    const result = resolveCancelReview(record, [otherCarryOver], [otherInbox])

    expect(result.carryOverCandidates).toEqual([otherCarryOver])
    expect(result.inboxCandidates).toEqual([otherInbox])
  })
})
