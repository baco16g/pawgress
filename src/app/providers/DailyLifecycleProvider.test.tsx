import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DailyLifecycleProvider } from './DailyLifecycleProvider'
import { useDailyLifecycle } from '@/app/state/dailyLifecycleContext'
import { saveDailyLifecycleState } from '@/app/persistence/dailyLifecycleStorage'
import { getProductDateKey } from '@/domain/product-day/productDay'

function InboxTitles() {
  const { state } = useDailyLifecycle()
  return (
    <ul>
      {state.inboxCandidates.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}

describe('DailyLifecycleProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persist=trueで保存データが無い（本当の初回起動）場合、「例：」付きのsample taskをInboxに表示する', () => {
    render(
      <DailyLifecycleProvider persist>
        <InboxTitles />
      </DailyLifecycleProvider>,
    )

    expect(screen.getByText('例：牛乳を買う')).toBeInTheDocument()
    expect(screen.getByText('例：資料を確認する')).toBeInTheDocument()
  })

  it('persist=trueで保存データがある場合は、sample taskではなく保存された内容を表示する', () => {
    saveDailyLifecycleState(getProductDateKey(), {
      todayTasks: [],
      inboxCandidates: [{ id: 'saved-1', title: '保存されたタスク', completed: false }],
      carryOverCandidates: [],
      historyRecords: {},
    })

    render(
      <DailyLifecycleProvider persist>
        <InboxTitles />
      </DailyLifecycleProvider>,
    )

    expect(screen.getByText('保存されたタスク')).toBeInTheDocument()
    expect(screen.queryByText('例：牛乳を買う')).not.toBeInTheDocument()
  })
})

// routeと同じく、dateKeyは描画した時点のProduct Dayから求める。
function DayProbe() {
  const { state, dispatch } = useDailyLifecycle()
  const dateKey = getProductDateKey()
  return (
    <div>
      <p>today:{state.todayTasks.map((task) => task.title).join(',')}</p>
      <p>
        carry:
        {state.carryOverCandidates
          .map((task) => `${task.title}${task.completed ? '(完了)' : ''}`)
          .join(',')}
      </p>
      <p>records:{Object.keys(state.historyRecords).join(',')}</p>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'today/start', selectedIds: new Set(['sample-1']) })
        }}
      >
        start
      </button>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'today/toggleTask', id: 'sample-1' })
        }}
      >
        toggle
      </button>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'today/rest', dateKey })
        }}
      >
        rest
      </button>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'today/cancelRest', dateKey })
        }}
      >
        cancelRest
      </button>
    </div>
  )
}

function click(name: string) {
  act(() => {
    screen.getByRole('button', { name }).click()
  })
}

function savedDateKey(): string | undefined {
  const raw = window.localStorage.getItem('pawgress.dailyLifecycle.v1')
  if (raw === null) return undefined
  const parsed = JSON.parse(raw) as { dateKey?: string }
  return parsed.dateKey
}

describe('DailyLifecycleProvider — 開いたまま日付が変わった場合', () => {
  const DAY1_NIGHT = new Date(2026, 9, 14, 22, 0)
  const DAY2_MORNING = new Date(2026, 9, 15, 9, 0)

  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(DAY1_NIGHT)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('日付が変わった後の操作では、先に前日のtodayTasksを前回からの続きへ移す', () => {
    const view = render(
      <DailyLifecycleProvider persist>
        <DayProbe />
      </DailyLifecycleProvider>,
    )
    click('start')
    expect(screen.getByText('today:例：牛乳を買う')).toBeInTheDocument()

    vi.setSystemTime(DAY2_MORNING)
    click('toggle')

    expect(screen.getByText('today:')).toBeInTheDocument()
    expect(screen.getByText('carry:例：牛乳を買う')).toBeInTheDocument()
    expect(savedDateKey()).toBe('2026-10-15')

    // 再読み込みしても、前日のtaskが今日のタスクに戻らない。
    view.unmount()
    render(
      <DailyLifecycleProvider persist>
        <DayProbe />
      </DailyLifecycleProvider>,
    )
    expect(screen.getByText('today:')).toBeInTheDocument()
    expect(screen.getByText('carry:例：牛乳を買う')).toBeInTheDocument()
  })

  it('日付が変わった後にタブが再表示されると、操作を待たずに前日のtodayTasksを移す', () => {
    render(
      <DailyLifecycleProvider persist>
        <DayProbe />
      </DailyLifecycleProvider>,
    )
    click('start')

    vi.setSystemTime(DAY2_MORNING)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(screen.getByText('today:')).toBeInTheDocument()
    expect(screen.getByText('carry:例：牛乳を買う')).toBeInTheDocument()
  })

  it('日付が変わる前に描画された画面からの、前日の日付つきの操作は反映しない', () => {
    render(
      <DailyLifecycleProvider persist>
        <DayProbe />
      </DailyLifecycleProvider>,
    )
    click('rest')
    expect(screen.getByText('records:2026-10-14')).toBeInTheDocument()

    // 再描画されないまま日付が変わり、前日の画面の「お休みを取り消す」が押された状況。
    vi.setSystemTime(DAY2_MORNING)
    click('cancelRest')

    expect(screen.getByText('records:2026-10-14')).toBeInTheDocument()
  })
})
