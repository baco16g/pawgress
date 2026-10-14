import { describe, expect, it } from 'vitest'
import {
  canAddInboxTask,
  dailyLifecycleReducer,
  MAX_INBOX_TASKS,
  type DailyLifecycleState,
} from './dailyLifecycleStore'
import { createTask, type Task } from '@/domain/task/task'

function tasksOf(count: number): Task[] {
  return Array.from({ length: count }, (_, index) =>
    createTask(`task-${String(index)}`, `t${String(index)}`),
  )
}

function emptyState(): DailyLifecycleState {
  return { todayTasks: [], inboxCandidates: [], carryOverCandidates: [], historyRecords: {} }
}

describe('dailyLifecycleReducer', () => {
  it('inbox/addTask: Inboxの末尾にtaskを追加する', () => {
    const state = emptyState()
    const next = dailyLifecycleReducer(state, { type: 'inbox/appendTask', title: '牛乳を買う' })

    expect(next.inboxCandidates).toHaveLength(1)
    expect(next.inboxCandidates[0]?.title).toBe('牛乳を買う')
    expect(next.inboxCandidates[0]?.completed).toBe(false)
  })

  it('inbox/deleteTask: 指定idのtaskだけをInboxから取り除く', () => {
    const milk = createTask('牛乳を買う', 'inbox-1')
    const room = createTask('部屋を片付ける', 'inbox-2')
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: [milk, room],
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'inbox/deleteTask', id: 'inbox-1' })

    expect(next.inboxCandidates).toEqual([room])
  })

  it('inbox/deleteTask: 存在しないidを指定してもno-op（stateの構造は変わらない）', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: [createTask('牛乳を買う', 'inbox-1')],
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'inbox/deleteTask', id: 'does-not-exist' })

    expect(next.inboxCandidates).toEqual(state.inboxCandidates)
  })

  it('Inbox → Setup selected → Today: 選択したtaskがtodayTasksへ移りInboxから消える', () => {
    const milk = createTask('牛乳を買う', 'inbox-1')
    const room = createTask('部屋を片付ける', 'inbox-2')
    let state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: [milk, room],
      carryOverCandidates: [],
      historyRecords: {},
    }

    state = dailyLifecycleReducer(state, {
      type: 'today/start',
      selectedIds: new Set(['inbox-1']),
    })

    expect(state.todayTasks.map((t) => t.id)).toEqual(['inbox-1'])
    expect(state.inboxCandidates.map((t) => t.id)).toEqual(['inbox-2'])
  })

  it('today/toggleTask: 指定したtaskのcompletedだけを反転する', () => {
    const task = createTask('資料を確認する', 't1')
    const state: DailyLifecycleState = {
      todayTasks: [task],
      inboxCandidates: [],
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'today/toggleTask', id: 't1' })
    expect(next.todayTasks[0]?.completed).toBe(true)

    const toggledBack = dailyLifecycleReducer(next, { type: 'today/toggleTask', id: 't1' })
    expect(toggledBack.todayTasks[0]?.completed).toBe(false)
  })

  it('today/addTask: todayTasksの末尾に未完了taskを追加する', () => {
    const state = emptyState()
    const next = dailyLifecycleReducer(state, { type: 'today/addTask', title: 'メモを取る' })

    expect(next.todayTasks).toHaveLength(1)
    expect(next.todayTasks[0]?.completed).toBe(false)
  })

  it('Review → Inbox: 「Inboxへ戻す」を選んだunfinished taskがinboxCandidatesへ入る', () => {
    const milk = createTask('牛乳を買う', 't1')
    const state: DailyLifecycleState = {
      todayTasks: [milk],
      inboxCandidates: [],
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, {
      type: 'review/complete',
      tasks: [milk],
      dispositions: { t1: 'inbox' },
      dateKey: '2026-10-04',
    })

    expect(next.todayTasks).toEqual([])
    expect(next.inboxCandidates.map((t) => t.id)).toEqual(['t1'])
    expect(next.carryOverCandidates).toEqual([])
  })

  it('Review → Carry-over → Setup → unselected → Inbox: 1 loop全体で重複が発生しない', () => {
    const doc = createTask('資料を確認する', 't1')
    let state: DailyLifecycleState = {
      todayTasks: [doc],
      inboxCandidates: [],
      carryOverCandidates: [],
      historyRecords: {},
    }

    // Review: 「明日に持ち越す」を選択。
    state = dailyLifecycleReducer(state, {
      type: 'review/complete',
      tasks: [doc],
      dispositions: { t1: 'carryOver' },
      dateKey: '2026-10-04',
    })
    expect(state.carryOverCandidates.map((t) => t.id)).toEqual(['t1'])
    expect(state.inboxCandidates).toEqual([])

    // 次回Setup: carry-over candidateを選択しない（unselected）まま今日をはじめる。
    state = dailyLifecycleReducer(state, { type: 'today/start', selectedIds: new Set() })

    // 重複なく、Inboxへ1件だけ戻る。carry-overは空になる。
    expect(state.inboxCandidates.map((t) => t.id)).toEqual(['t1'])
    expect(state.carryOverCandidates).toEqual([])
    expect(state.todayTasks).toEqual([])
  })

  it('canAddInboxTask: limit未満ならtrue、limit以上ならfalse', () => {
    expect(canAddInboxTask(tasksOf(9))).toBe(true)
    expect(canAddInboxTask(tasksOf(MAX_INBOX_TASKS))).toBe(false)
    expect(canAddInboxTask(tasksOf(11))).toBe(false)
  })

  it('inbox/captureTask: 9件で成功し、新規taskは先頭へprependされる', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(9),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'inbox/prependTask', title: '新しいタスク' })

    expect(next.inboxCandidates).toHaveLength(10)
    expect(next.inboxCandidates[0]?.title).toBe('新しいタスク')
    expect(next.inboxCandidates[1]?.id).toBe('t0')
  })

  it('inbox/captureTask: 10件（capacity）ではrejectされ、stateが変わらない', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(10),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, {
      type: 'inbox/prependTask',
      title: '追加されないはず',
    })

    expect(next).toBe(state)
    expect(next.inboxCandidates).toHaveLength(10)
  })

  it('inbox/captureTask: 11件（over capacity）でもrejectされる', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(11),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, {
      type: 'inbox/prependTask',
      title: '追加されないはず',
    })

    expect(next.inboxCandidates).toHaveLength(11)
  })

  // destination-based policy: destinationがInboxの新規captureは
  // どの画面経由でも同じcapacity ruleを通る。inbox/addTask（Today Setup）も
  // inbox/captureTask（Standalone Inbox）と同じcanAddInboxTask判定を経由する。
  it('inbox/addTask: 9件なら成功し末尾へ追加される（Setup経由も同じcapacity ruleを通る）', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(9),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'inbox/appendTask', title: '新しいタスク' })

    expect(next.inboxCandidates).toHaveLength(10)
    expect(next.inboxCandidates.at(-1)?.title).toBe('新しいタスク')
  })

  it('inbox/addTask: 10件（capacity）ではrejectされ、stateが変わらない', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(10),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, {
      type: 'inbox/appendTask',
      title: '追加されないはず',
    })

    expect(next).toBe(state)
    expect(next.inboxCandidates).toHaveLength(10)
  })

  it('today/addTask: destinationはtodayTasksでありInboxへは一切追加されない（Inbox capacity対象外）', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(10),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'today/addTask', title: 'Todayへ直接追加' })

    expect(next.todayTasks).toHaveLength(1)
    expect(next.todayTasks[0]?.title).toBe('Todayへ直接追加')
    // Inboxが10件（capacity）でもtoday/addTaskは拒否されず、inboxCandidatesも不変。
    expect(next.inboxCandidates).toHaveLength(10)
  })

  it('review/complete（Inboxへ戻す）はcapacityを超えていても常に受け入れる', () => {
    const milk = createTask('牛乳を買う', 'today-1')
    const state: DailyLifecycleState = {
      todayTasks: [milk],
      inboxCandidates: tasksOf(10),
      carryOverCandidates: [],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, {
      type: 'review/complete',
      tasks: [milk],
      dispositions: { 'today-1': 'inbox' },
      dateKey: '2026-10-04',
    })

    expect(next.inboxCandidates).toHaveLength(11)
    expect(next.inboxCandidates.some((t) => t.id === 'today-1')).toBe(true)
  })

  it('today/start（unselected carry-over → Inbox）はcapacityを超えていても常に受け入れる', () => {
    const state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: tasksOf(10),
      carryOverCandidates: [createTask('資料を確認する', 'carry-1')],
      historyRecords: {},
    }

    const next = dailyLifecycleReducer(state, { type: 'today/start', selectedIds: new Set() })

    expect(next.inboxCandidates).toHaveLength(11)
    expect(next.inboxCandidates.some((t) => t.id === 'carry-1')).toBe(true)
  })

  it('同じidのtaskがInboxとtodayTasksへ同時に重複して存在しない', () => {
    const milk = createTask('牛乳を買う', 't1')
    let state: DailyLifecycleState = {
      todayTasks: [],
      inboxCandidates: [milk],
      carryOverCandidates: [],
      historyRecords: {},
    }

    state = dailyLifecycleReducer(state, { type: 'today/start', selectedIds: new Set(['t1']) })
    expect(state.todayTasks.map((t) => t.id)).toEqual(['t1'])
    expect(state.inboxCandidates).toEqual([])

    state = dailyLifecycleReducer(state, {
      type: 'review/complete',
      tasks: state.todayTasks,
      dispositions: { t1: 'inbox' },
      dateKey: '2026-10-04',
    })

    const allIds = [
      ...state.todayTasks,
      ...state.inboxCandidates,
      ...state.carryOverCandidates,
    ].map((t) => t.id)
    expect(allIds).toEqual(['t1'])
  })

  // History snapshot creationはreview/complete時のみ確定する（§2/§18）。
  describe('review/complete → historyRecords', () => {
    it('「1日を終える」成功時にdateKeyでActive recordが作られる', () => {
      const milk = createTask('牛乳を買う', 't1')
      const doc = createTask('資料を確認する', 't2')
      const state: DailyLifecycleState = {
        todayTasks: [milk, doc],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...milk, completed: true }, doc],
        dispositions: { t2: 'carryOver' },
        dateKey: '2026-10-04',
      })

      const record = next.historyRecords['2026-10-04']
      expect(record?.kind).toBe('active')
      if (record?.kind === 'active') {
        expect(record.items).toEqual([
          { taskId: 't1', title: '牛乳を買う', outcome: 'completed' },
          { taskId: 't2', title: '資料を確認する', outcome: 'carryOver' },
        ])
      }
    })

    it('Review completion以外のactionではhistoryRecordsが変化しない', () => {
      const state: DailyLifecycleState = {
        todayTasks: [],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, { type: 'today/addTask', title: 'メモを取る' })
      expect(next.historyRecords).toEqual({})
    })

    it('同じdateKeyで2回completeしても件数は増えず、最新の内容で上書きされる', () => {
      const first = createTask('最初のタスク', 't1')
      let state: DailyLifecycleState = {
        todayTasks: [first],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...first, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })
      expect(Object.keys(state.historyRecords)).toEqual(['2026-10-04'])

      const second = createTask('2回目のタスク', 't2')
      state = { ...state, todayTasks: [second] }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [second],
        dispositions: { t2: 'inbox' },
        dateKey: '2026-10-04',
      })

      expect(Object.keys(state.historyRecords)).toEqual(['2026-10-04'])
      const record = state.historyRecords['2026-10-04']
      if (record?.kind === 'active') {
        expect(record.items).toEqual([{ taskId: 't2', title: '2回目のタスク', outcome: 'inbox' }])
      }
    })

    it('todayTasksが空のときはno-opで、その日のrecordを空の内容で上書きしない', () => {
      const milk = createTask('牛乳を買う', 't1')
      let state: DailyLifecycleState = { ...emptyState(), todayTasks: [milk] }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...milk, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })
      expect(state.todayTasks).toEqual([])

      const afterFirstComplete = state
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      expect(state).toBe(afterFirstComplete)
      const record = state.historyRecords['2026-10-04']
      expect(record?.kind === 'active' ? record.items : []).toEqual([
        { taskId: 't1', title: '牛乳を買う', outcome: 'completed' },
      ])
    })

    it('異なるdateKeyのcompletionは別recordとして両方残る', () => {
      const day1Task = createTask('day1のタスク', 't1')
      let state: DailyLifecycleState = {
        todayTasks: [day1Task],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...day1Task, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      const day2Task = createTask('day2のタスク', 't2')
      state = { ...state, todayTasks: [day2Task] }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...day2Task, completed: true }],
        dispositions: {},
        dateKey: '2026-10-05',
      })

      expect(Object.keys(state.historyRecords).sort()).toEqual(['2026-10-04', '2026-10-05'])
    })

    it('snapshot independence: record作成後にtodayTasksが変化してもrecordは不変', () => {
      const milk = createTask('牛乳を買う', 't1')
      let state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...milk, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })
      const recordBefore = state.historyRecords['2026-10-04']

      // 翌日以降の操作で新しいtodayTasksが積まれても、既存recordのobject自体は再利用される
      // （新しいmutationによる書き換えを受けない）。
      state = dailyLifecycleReducer(state, { type: 'today/addTask', title: '別の日のタスク' })

      expect(state.historyRecords['2026-10-04']).toBe(recordBefore)
    })
  })

  // REST entry pointはToday Setupのみ。
  describe('today/rest', () => {
    it('指定したdateKeyへkind="rest"のrecordを作る', () => {
      const state = emptyState()
      const next = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      expect(next.historyRecords['2026-10-04']).toEqual({ dateKey: '2026-10-04', kind: 'rest' })
    })

    it('todayTasks / inboxCandidates / carryOverCandidatesには一切触れない（§5 side effects）', () => {
      const milk = createTask('牛乳を買う', 'inbox-1')
      const doc = createTask('資料を確認する', 'carry-1')
      const state: DailyLifecycleState = {
        todayTasks: [],
        inboxCandidates: [milk],
        carryOverCandidates: [doc],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      expect(next.todayTasks).toEqual([])
      expect(next.inboxCandidates).toBe(state.inboxCandidates)
      expect(next.carryOverCandidates).toBe(state.carryOverCandidates)
    })

    it('同じdateKeyで2回実行してもrecordは1件のまま（upsert、§8）', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      expect(Object.keys(state.historyRecords)).toEqual(['2026-10-04'])
    })

    // REST / Active排他: review/completeはREST recordを暗黙に上書きしない。
    // 明示的なtoday/cancelRestが先に必要。
    it('REST記録後に同じdateKeyでreview/completeしても、REST recordのまま変化しない', () => {
      const milk = createTask('牛乳を買う', 't1')
      let state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })
      expect(state.historyRecords['2026-10-04']?.kind).toBe('rest')

      const beforeReviewComplete = state
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...milk, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      // no-op: stateのobject referenceごと変化しない。
      expect(state).toBe(beforeReviewComplete)
      expect(state.historyRecords['2026-10-04']?.kind).toBe('rest')
    })

    it('today/cancelRestで明示的にcancelした後なら、review/completeがActive recordを作れる', () => {
      const milk = createTask('牛乳を買う', 't1')
      let state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })
      state = dailyLifecycleReducer(state, { type: 'today/cancelRest', dateKey: '2026-10-04' })
      expect(state.historyRecords['2026-10-04']).toBeUndefined()

      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [{ ...milk, completed: true }],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      expect(state.historyRecords['2026-10-04']?.kind).toBe('active')
    })
  })

  // REST Screenの「お休みを取り消す」。
  describe('today/cancelRest', () => {
    it('RESTのrecordを削除する', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })
      state = dailyLifecycleReducer(state, { type: 'today/cancelRest', dateKey: '2026-10-04' })

      expect(state.historyRecords['2026-10-04']).toBeUndefined()
      expect(Object.keys(state.historyRecords)).toEqual([])
    })

    it('todayTasks / inboxCandidates / carryOverCandidatesには一切触れない', () => {
      const milkCandidate = createTask('牛乳を買う', 'inbox-1')
      const docCandidate = createTask('資料を確認する', 'carry-1')
      let state: DailyLifecycleState = {
        todayTasks: [],
        inboxCandidates: [milkCandidate],
        carryOverCandidates: [docCandidate],
        historyRecords: {},
      }
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelRest',
        dateKey: '2026-10-04',
      })

      expect(next.todayTasks).toEqual([])
      expect(next.inboxCandidates).toBe(state.inboxCandidates)
      expect(next.carryOverCandidates).toBe(state.carryOverCandidates)
    })

    it('対象dateKeyのrecordがREST以外（例: active）のときはno-op', () => {
      const milk = { ...createTask('牛乳を買う', 't1'), completed: true }
      let state: DailyLifecycleState = { ...emptyState(), todayTasks: [milk] }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [milk],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      const beforeCancel = state
      state = dailyLifecycleReducer(state, { type: 'today/cancelRest', dateKey: '2026-10-04' })

      expect(state).toBe(beforeCancel)
      expect(state.historyRecords['2026-10-04']?.kind).toBe('active')
    })

    it('recordが存在しないdateKeyに対してもno-op', () => {
      const state = emptyState()
      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelRest',
        dateKey: '2026-10-04',
      })

      expect(next).toBe(state)
    })

    it('cancel後に再度today/restを実行すると、同じdateKeyへ新しいREST recordを作れる', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })
      state = dailyLifecycleReducer(state, { type: 'today/cancelRest', dateKey: '2026-10-04' })
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      expect(state.historyRecords['2026-10-04']?.kind).toBe('rest')
      expect(Object.keys(state.historyRecords)).toEqual(['2026-10-04'])
    })

    // Product Day境界（§7）: cancelは常に呼び出し側が渡したdateKeyのrecord
    // だけを対象にする。TodayのUIは常に「今日」のdateKeyしか渡さないため、過去の
    // Product DayのREST recordを誤ってcancelする経路はreducerの外（UI構造）で
    // 保証される。reducer自身は「指定dateKey以外へ波及しない」ことだけをpureに保証する。
    it('異なるdateKeyのREST recordには影響しない（Product Day境界）', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelRest',
        dateKey: '2026-10-05',
      })

      // 2026-10-05にはrecordが無いためno-op。2026-10-04のREST recordはそのまま残る。
      expect(next).toBe(state)
      expect(next.historyRecords['2026-10-04']?.kind).toBe('rest')
    })
  })

  describe('today/cancelReview', () => {
    it('review/complete直前のtodayTasksを完了状態込みで復元する', () => {
      const milk = { ...createTask('牛乳を買う', 'inbox-1'), completed: true }
      const doc = createTask('資料を確認する', 'carry-1')
      let state: DailyLifecycleState = {
        todayTasks: [milk, doc],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [milk, doc],
        dispositions: { 'carry-1': 'carryOver' },
        dateKey: '2026-10-04',
      })
      expect(state.todayTasks).toEqual([])

      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelReview',
        dateKey: '2026-10-04',
      })

      expect(next.todayTasks).toEqual([
        { id: 'inbox-1', title: '牛乳を買う', completed: true },
        { id: 'carry-1', title: '資料を確認する', completed: false },
      ])
    })

    it('このreviewがcarryOver/inboxへ振り分けたtaskだけを取り除く（他の候補には触れない）', () => {
      const milk = { ...createTask('牛乳を買う', 'inbox-1'), completed: false }
      const otherInbox = createTask('部屋を片付ける', 'inbox-2')
      const otherCarryOver = createTask('メールの下書きを送る', 'carry-2')
      let state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: [otherInbox],
        carryOverCandidates: [otherCarryOver],
        historyRecords: {},
      }
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [milk],
        dispositions: { 'inbox-1': 'inbox' },
        dateKey: '2026-10-04',
      })
      expect(state.inboxCandidates.map((task) => task.id)).toEqual(['inbox-2', 'inbox-1'])

      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelReview',
        dateKey: '2026-10-04',
      })

      expect(next.inboxCandidates).toEqual([otherInbox])
      expect(next.carryOverCandidates).toEqual([otherCarryOver])
    })

    it('historyRecordを削除する', () => {
      const milk = { ...createTask('牛乳を買う', 'inbox-1'), completed: true }
      let state = emptyState()
      state = dailyLifecycleReducer(state, {
        type: 'review/complete',
        tasks: [milk],
        dispositions: {},
        dateKey: '2026-10-04',
      })

      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelReview',
        dateKey: '2026-10-04',
      })

      expect(next.historyRecords['2026-10-04']).toBeUndefined()
    })

    it('対象dateKeyのrecordがactive以外（例: rest）のときはno-op', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-04' })

      const beforeCancel = state
      state = dailyLifecycleReducer(state, {
        type: 'today/cancelReview',
        dateKey: '2026-10-04',
      })

      expect(state).toBe(beforeCancel)
      expect(state.historyRecords['2026-10-04']?.kind).toBe('rest')
    })

    it('recordが存在しないdateKeyに対してもno-op', () => {
      const state = emptyState()
      const next = dailyLifecycleReducer(state, {
        type: 'today/cancelReview',
        dateKey: '2026-10-04',
      })

      expect(next).toBe(state)
    })
  })

  describe('today/rollover', () => {
    it('todayTasksを未完了に戻してcarryOverCandidatesの末尾へ移し、Inboxとrecordには触れない', () => {
      const milk = { ...createTask('牛乳を買う', 'today-1'), completed: true }
      const doc = createTask('資料を確認する', 'today-2')
      const state: DailyLifecycleState = {
        todayTasks: [milk, doc],
        inboxCandidates: [createTask('本を返す', 'inbox-1')],
        carryOverCandidates: [createTask('メールを送る', 'carry-1')],
        historyRecords: { '2026-10-03': { dateKey: '2026-10-03', kind: 'rest' } },
      }

      const next = dailyLifecycleReducer(state, { type: 'today/rollover' })

      expect(next.todayTasks).toEqual([])
      expect(next.carryOverCandidates).toEqual([
        { id: 'carry-1', title: 'メールを送る', completed: false },
        { id: 'today-1', title: '牛乳を買う', completed: false },
        { id: 'today-2', title: '資料を確認する', completed: false },
      ])
      expect(next.inboxCandidates).toBe(state.inboxCandidates)
      expect(next.historyRecords).toBe(state.historyRecords)
    })

    it('todayTasksが空ならtodayTasksとcarryOverCandidatesはそのまま', () => {
      const state: DailyLifecycleState = {
        ...emptyState(),
        carryOverCandidates: [createTask('メールを送る', 'carry-1')],
      }

      const next = dailyLifecycleReducer(state, { type: 'today/rollover' })

      expect(next.todayTasks).toBe(state.todayTasks)
      expect(next.carryOverCandidates).toBe(state.carryOverCandidates)
    })
  })

  describe('today/abandon', () => {
    it('完了/未完了を問わずtodayTasksをすべてInboxへ戻し、completedをfalseへリセットする', () => {
      const milk = { ...createTask('牛乳を買う', 'inbox-1'), completed: true }
      const doc = { ...createTask('資料を確認する', 'carry-1'), completed: false }
      const state: DailyLifecycleState = {
        todayTasks: [milk, doc],
        inboxCandidates: [],
        carryOverCandidates: [],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, { type: 'today/abandon' })

      expect(next.todayTasks).toEqual([])
      expect(next.inboxCandidates).toEqual([
        { id: 'inbox-1', title: '牛乳を買う', completed: false },
        { id: 'carry-1', title: '資料を確認する', completed: false },
      ])
    })

    it('既存のinboxCandidatesの末尾へ追加する（既存候補を失わない）', () => {
      const existing = createTask('部屋を片付ける', 'inbox-2')
      const milk = createTask('牛乳を買う', 'inbox-1')
      const state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: [existing],
        carryOverCandidates: [],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, { type: 'today/abandon' })

      expect(next.inboxCandidates).toEqual([existing, { ...milk, completed: false }])
    })

    it('capacity（MAX_INBOX_TASKS）を超えていても常に受け入れる（lifecycle由来の復帰のため、§5 side effects）', () => {
      const existing = tasksOf(MAX_INBOX_TASKS)
      const milk = createTask('牛乳を買う', 'today-1')
      const state: DailyLifecycleState = {
        todayTasks: [milk],
        inboxCandidates: existing,
        carryOverCandidates: [],
        historyRecords: {},
      }

      const next = dailyLifecycleReducer(state, { type: 'today/abandon' })

      expect(next.inboxCandidates).toHaveLength(MAX_INBOX_TASKS + 1)
    })

    it('historyRecordsには一切触れない（abandon自体はrecordを作らない）', () => {
      let state = emptyState()
      state = dailyLifecycleReducer(state, { type: 'today/rest', dateKey: '2026-10-03' })
      state = { ...state, todayTasks: [createTask('牛乳を買う', 'today-1')] }

      const next = dailyLifecycleReducer(state, { type: 'today/abandon' })

      expect(next.historyRecords).toBe(state.historyRecords)
    })
  })
})
