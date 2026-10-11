import { beforeEach, describe, expect, it } from 'vitest'
import { loadDailyLifecycleState, saveDailyLifecycleState } from './dailyLifecycleStorage'
import type { DailyLifecycleState } from '@/domain/daily-lifecycle/dailyLifecycleStore'

const STORAGE_KEY = 'pawgress.dailyLifecycle.v1'

const sampleState: DailyLifecycleState = {
  todayTasks: [{ id: 'today-1', title: '牛乳を買う', completed: false }],
  inboxCandidates: [{ id: 'inbox-1', title: '部屋を片付ける', completed: false }],
  carryOverCandidates: [],
  historyRecords: {
    '2026-10-04': {
      dateKey: '2026-10-04',
      kind: 'active',
      items: [{ taskId: 'task-1', title: '資料を確認する', outcome: 'completed' }],
    },
    '2026-10-03': { dateKey: '2026-10-03', kind: 'rest' },
  },
}

describe('dailyLifecycleStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('保存されたstateが無い場合はnullを返す', () => {
    expect(loadDailyLifecycleState()).toBeNull()
  })

  it('saveDailyLifecycleState→loadDailyLifecycleStateでdateKeyとstateが復元される', () => {
    saveDailyLifecycleState('2026-10-05', sampleState)

    expect(loadDailyLifecycleState()).toEqual({ dateKey: '2026-10-05', state: sampleState })
  })

  it('壊れたJSONはnullへ安全にfallbackする', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json')

    expect(loadDailyLifecycleState()).toBeNull()
  })

  it('dateKeyが欠けているデータはnullへfallbackする', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: sampleState }))

    expect(loadDailyLifecycleState()).toBeNull()
  })

  it('taskのshapeが不正（completedが文字列等）な場合はnullへfallbackする', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dateKey: '2026-10-05',
        state: { ...sampleState, todayTasks: [{ id: 'x', title: 'y', completed: 'yes' }] },
      }),
    )

    expect(loadDailyLifecycleState()).toBeNull()
  })

  it('historyRecordsのkindが不正な場合はnullへfallbackする', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dateKey: '2026-10-05',
        state: {
          ...sampleState,
          historyRecords: { '2026-10-04': { dateKey: '2026-10-04', kind: 'missed' } },
        },
      }),
    )

    expect(loadDailyLifecycleState()).toBeNull()
  })

  it('activeレコードのitemsが配列でない場合はnullへfallbackする', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dateKey: '2026-10-05',
        state: {
          ...sampleState,
          historyRecords: { '2026-10-04': { dateKey: '2026-10-04', kind: 'active' } },
        },
      }),
    )

    expect(loadDailyLifecycleState()).toBeNull()
  })
})
