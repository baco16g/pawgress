import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskItem } from './TaskItem'

describe('TaskItem', () => {
  it('タイトルをチェックボックスのaccessible nameとして公開する', () => {
    render(
      <ul>
        <TaskItem title="牛乳を買う" completed={false} />
      </ul>,
    )

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })

  it('完了状態を色だけでなくネイティブチェックボックスにも反映する', () => {
    render(
      <ul>
        <TaskItem title="牛乳を買う" completed />
      </ul>,
    )

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
  })

  it('行を操作するとonToggleが呼ばれる', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <ul>
        <TaskItem title="牛乳を買う" completed={false} onToggle={onToggle} />
      </ul>,
    )

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
