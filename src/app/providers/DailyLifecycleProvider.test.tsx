import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
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
