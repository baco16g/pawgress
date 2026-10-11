import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createTask, type Task } from '@/domain/task/task'
import { InboxScreen } from './InboxScreen'

describe('InboxScreen — Empty State', () => {
  it('0件のときicon付きcentered compositionを表示する（旧1行copyは表示しない）', () => {
    render(<InboxScreen tasks={[]} onAddTask={vi.fn()} onDeleteTask={vi.fn()} canCapture />)

    expect(screen.getByText('Inboxは空です')).toBeInTheDocument()
    expect(screen.getByText('やることを思いついたら、上から追加できます。')).toBeInTheDocument()
    expect(screen.queryByText('Inboxにタスクはありません。')).not.toBeInTheDocument()
  })

  it('Empty State iconはdecorativeでaria-hiddenになっている', () => {
    const { container } = render(
      <InboxScreen tasks={[]} onAddTask={vi.fn()} onDeleteTask={vi.fn()} canCapture />,
    )

    const icon = container.querySelector('svg.lucide-inbox')
    expect(icon).toBeTruthy()
    // iconを包むwellがaria-hiddenであることを確認（iconはdecorative、headingが主情報）。
    expect(icon?.closest('[aria-hidden="true"]')).toBeTruthy()
  })

  it('Empty Stateに二重CTA（追加ボタン等）を持たない（Persistent Inputのみが唯一のcapture手段）', () => {
    render(<InboxScreen tasks={[]} onAddTask={vi.fn()} onDeleteTask={vi.fn()} canCapture />)

    // Persistent Input自体のsubmit actionは空文字時には表示されないため、
    // Empty State内に新たなbuttonが無いことだけを確認する。
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('taskが1件以上あるときはEmpty Stateを表示せずFlat Listを表示する', () => {
    render(
      <InboxScreen
        tasks={[createTask('牛乳を買う', 't1')]}
        onAddTask={vi.fn()}
        onDeleteTask={vi.fn()}
        canCapture
      />,
    )

    expect(screen.queryByText('Inboxは空です')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
  })

  it('Empty状態でtaskをcaptureするとEmpty Stateが消えFlat Listへ切り替わる（実際のstate遷移）', async () => {
    const user = userEvent.setup()

    function Wrapper() {
      const [tasks, setTasks] = useState<Task[]>([])
      return (
        <InboxScreen
          tasks={tasks}
          canCapture
          onAddTask={(title) => {
            setTasks((current) => [createTask(title), ...current])
          }}
          onDeleteTask={(id) => {
            setTasks((current) => current.filter((task) => task.id !== id))
          }}
        />
      )
    }

    render(<Wrapper />)

    expect(screen.getByText('Inboxは空です')).toBeInTheDocument()

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '牛乳を買う{Enter}')

    expect(screen.queryByText('Inboxは空です')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
  })

  it('削除buttonをtapするとそのtaskだけがlistから消える（実際のstate遷移）', async () => {
    const user = userEvent.setup()

    function Wrapper() {
      const [tasks, setTasks] = useState<Task[]>([
        createTask('牛乳を買う', 't1'),
        createTask('部屋を片付ける', 't2'),
      ])
      return (
        <InboxScreen
          tasks={tasks}
          canCapture
          onAddTask={(title) => {
            setTasks((current) => [createTask(title), ...current])
          }}
          onDeleteTask={(id) => {
            setTasks((current) => current.filter((task) => task.id !== id))
          }}
        />
      )
    }

    render(<Wrapper />)

    await user.click(screen.getByRole('button', { name: '牛乳を買うを削除' }))

    const milkRow = screen.getByText('牛乳を買う').closest('li')
    if (milkRow === null) throw new Error('row not found')

    // collapse開始はdouble rAFで次frame以降に遅延するため、実際にleaving状態
    // （delete buttonがdisabledになる）へ切り替わるまで待つ。
    await waitFor(() => {
      expect(within(milkRow).getByRole('button', { name: '牛乳を買うを削除' })).toBeDisabled()
    })

    // 実際のcollapse transition完了を模擬する（jsdomはCSS transitionを実行せず
    // transitionendを自動発火しないため、InboxTaskListが待っているイベントを手動で送る）。
    fireEvent.transitionEnd(milkRow, { propertyName: 'height' })

    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
  })
})
