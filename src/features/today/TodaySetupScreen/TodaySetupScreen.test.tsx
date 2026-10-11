import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '@/domain/task/task'
import { TodaySetupScreen, type TodaySetupScreenProps } from './TodaySetupScreen'

const CARRY_OVER: Task[] = [
  { id: 'carry-1', title: '資料を確認する', completed: false },
  { id: 'carry-2', title: 'メールの下書きを送る', completed: false },
]
const INBOX: Task[] = [
  { id: 'inbox-1', title: '牛乳を買う', completed: false },
  { id: 'inbox-2', title: '部屋を片付ける', completed: false },
  { id: 'inbox-3', title: '本を返却する', completed: false },
]

const baseProps: TodaySetupScreenProps = {
  todayLabel: '10/3',
  carryOverCandidates: CARRY_OVER,
  inboxCandidates: INBOX,
  selectedIds: new Set(),
  minSelection: 1,
  maxSelection: 3,
  companionSpecies: 'dog',
  companionVariant: 'golden-retriever',
  canCaptureInboxCandidate: true,
  justCancelledRest: false,
  onToggleSelect: vi.fn(),
  onAddCandidate: vi.fn(),
  onStartToday: vi.fn(),
  onConfirmRest: vi.fn(),
  onOpenSettings: vi.fn(),
}

describe('TodaySetupScreen', () => {
  it('「今日の相棒」の品種名captionを表示し、accessible labelにも品種名が含まれる（D-080）', () => {
    render(<TodaySetupScreen {...baseProps} companionVariant="akita" />)

    expect(screen.getByText('秋田犬')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /相棒\(犬・秋田犬\)/ })).toBeInTheDocument()
  })

  it('Settings entryを表示し、clickでonOpenSettingsが呼ばれる', async () => {
    const user = userEvent.setup()
    const onOpenSettings = vi.fn()
    render(<TodaySetupScreen {...baseProps} onOpenSettings={onOpenSettings} />)

    const settingsButton = screen.getByRole('button', { name: '設定' })
    expect(settingsButton).toBeInTheDocument()

    await user.click(settingsButton)
    expect(onOpenSettings).toHaveBeenCalledTimes(1)
  })

  it('carry-overとInboxのcandidateがSelection Rowとして表示される', () => {
    render(<TodaySetupScreen {...baseProps} />)

    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })

  it('候補をclickするとonToggleSelectが呼ばれる（選択）', async () => {
    const user = userEvent.setup()
    const onToggleSelect = vi.fn()
    render(<TodaySetupScreen {...baseProps} onToggleSelect={onToggleSelect} />)

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))

    expect(onToggleSelect).toHaveBeenCalledWith('inbox-1')
  })

  it('選択済みcandidateをclickするとonToggleSelectが呼ばれる（選択解除）', async () => {
    const user = userEvent.setup()
    const onToggleSelect = vi.fn()
    render(
      <TodaySetupScreen
        {...baseProps}
        selectedIds={new Set(['inbox-1'])}
        onToggleSelect={onToggleSelect}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: '牛乳を買う' })
    expect(checkbox).toBeChecked()
    await user.click(checkbox)

    expect(onToggleSelect).toHaveBeenCalledWith('inbox-1')
  })

  it('上限（3件）に達すると、未選択のcandidateはdisabledになる', () => {
    render(
      <TodaySetupScreen {...baseProps} selectedIds={new Set(['carry-1', 'carry-2', 'inbox-1'])} />,
    )

    expect(screen.getByRole('checkbox', { name: '部屋を片付ける' })).toBeDisabled()
    // 選択済みのcandidateはdisabledにならない（解除は常に可能）。
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).not.toBeDisabled()
  })

  it('上限到達時はdisabledの理由がaria-describedbyで参照でき、titleは読める色のまま', () => {
    render(
      <TodaySetupScreen {...baseProps} selectedIds={new Set(['carry-1', 'carry-2', 'inbox-1'])} />,
    )

    const checkbox = screen.getByRole('checkbox', { name: '部屋を片付ける' })
    const describedById = checkbox.getAttribute('aria-describedby')
    expect(describedById).toBeTruthy()
    expect(document.getElementById(describedById ?? '')).toHaveTextContent(
      '上限（3件）に達しました',
    )
  })

  it('selection countが表示される', () => {
    render(<TodaySetupScreen {...baseProps} selectedIds={new Set(['inbox-1'])} />)

    expect(screen.getByText('1 / 3 選択中')).toBeInTheDocument()
  })

  it('0件選択ではLifecycle Primaryがdisabledになる', () => {
    render(<TodaySetupScreen {...baseProps} />)

    expect(screen.getByRole('button', { name: '今日をはじめる' })).toBeDisabled()
  })

  it('1件選択するとLifecycle Primaryがenabledになる', () => {
    render(<TodaySetupScreen {...baseProps} selectedIds={new Set(['inbox-1'])} />)

    expect(screen.getByRole('button', { name: '今日をはじめる' })).not.toBeDisabled()
  })

  it('3件選択してもLifecycle Primaryはenabledのまま', () => {
    render(
      <TodaySetupScreen {...baseProps} selectedIds={new Set(['carry-1', 'carry-2', 'inbox-1'])} />,
    )

    expect(screen.getByRole('button', { name: '今日をはじめる' })).not.toBeDisabled()
  })

  it('1件以上選択時にonStartTodayを実行できる', async () => {
    const user = userEvent.setup()
    const onStartToday = vi.fn()
    render(
      <TodaySetupScreen
        {...baseProps}
        selectedIds={new Set(['inbox-1'])}
        onStartToday={onStartToday}
      />,
    )

    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    expect(onStartToday).toHaveBeenCalledTimes(1)
  })

  it('候補が1件も無い場合もdead-endにならず、新規追加できる', () => {
    render(<TodaySetupScreen {...baseProps} carryOverCandidates={[]} inboxCandidates={[]} />)

    expect(
      screen.getByText('候補はまだありません。下から今日のタスクを追加できます。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeInTheDocument()
    // Inbox sectionの個別empty message（「Inboxに候補はありません。」）と重複表示しない。
    expect(screen.queryByText('Inboxに候補はありません。')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Inbox' })).not.toBeInTheDocument()
  })

  it('canCaptureInboxCandidate=falseのとき、Inputがdisabledになりcapacity messageが表示される', () => {
    render(<TodaySetupScreen {...baseProps} canCaptureInboxCandidate={false} />)

    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeDisabled()
    expect(
      screen.getByText(
        'Inboxがいっぱいです。今日やるタスクを選んで「今日をはじめる」を押すと空きができます。',
      ),
    ).toBeInTheDocument()
  })

  it('canCaptureInboxCandidate=trueのとき、capacity messageは表示されない', () => {
    render(<TodaySetupScreen {...baseProps} canCaptureInboxCandidate />)

    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeEnabled()
    expect(
      screen.queryByText(
        'Inboxがいっぱいです。今日やるタスクを選んで「今日をはじめる」を押すと空きができます。',
      ),
    ).not.toBeInTheDocument()
  })

  it('キーボード操作でcandidateを選択できる', async () => {
    const user = userEvent.setup()
    const onToggleSelect = vi.fn()
    render(<TodaySetupScreen {...baseProps} onToggleSelect={onToggleSelect} />)

    const checkbox = screen.getByRole('checkbox', { name: '牛乳を買う' })
    checkbox.focus()
    await user.keyboard(' ')

    expect(onToggleSelect).toHaveBeenCalledWith('inbox-1')
  })

  describe('REST action', () => {
    it('「今日は休む」actionが常に表示される（REST確定後はSetup自体をrenderしないため）', () => {
      render(<TodaySetupScreen {...baseProps} />)

      expect(screen.getByRole('button', { name: '今日は休む' })).toBeInTheDocument()
    })

    it('justCancelledRest=falseのときcancellation acknowledgmentは表示されない', () => {
      render(<TodaySetupScreen {...baseProps} />)

      expect(screen.queryByText('お休みの設定を取り消しました。')).not.toBeInTheDocument()
    })

    it('justCancelledRest=trueのときcancellation acknowledgmentが表示される', () => {
      render(<TodaySetupScreen {...baseProps} justCancelledRest />)

      expect(screen.getByText('お休みの設定を取り消しました。')).toBeInTheDocument()
      // RestActionは引き続き表示される（cancel後もSetupから再度RESTを選べる）。
      expect(screen.getByRole('button', { name: '今日は休む' })).toBeInTheDocument()
    })

    it('justCancelledRest=trueのときページ見出しへfocusが移る（screen全体の切り替え後のorientation、§11）', () => {
      render(<TodaySetupScreen {...baseProps} justCancelledRest />)

      expect(screen.getByRole('heading', { name: '今日をはじめる' })).toHaveFocus()
    })

    it('「今日は休む」clickで軽量な確認UIが展開し、即座にonConfirmRestは呼ばれない', async () => {
      const user = userEvent.setup()
      const onConfirmRest = vi.fn()
      render(<TodaySetupScreen {...baseProps} onConfirmRest={onConfirmRest} />)

      await user.click(screen.getByRole('button', { name: '今日は休む' }))

      expect(screen.getByText('今日をお休みにしますか？')).toBeInTheDocument()
      expect(onConfirmRest).not.toHaveBeenCalled()
    })

    it('確認UIで「休む」を選ぶとonConfirmRestが呼ばれる', async () => {
      const user = userEvent.setup()
      const onConfirmRest = vi.fn()
      render(<TodaySetupScreen {...baseProps} onConfirmRest={onConfirmRest} />)

      await user.click(screen.getByRole('button', { name: '今日は休む' }))
      await user.click(screen.getByRole('button', { name: '休む' }))

      expect(onConfirmRest).toHaveBeenCalledTimes(1)
    })

    it('確認UIで「やめる」を選ぶとonConfirmRestを呼ばずtrigger actionへ戻る', async () => {
      const user = userEvent.setup()
      const onConfirmRest = vi.fn()
      render(<TodaySetupScreen {...baseProps} onConfirmRest={onConfirmRest} />)

      await user.click(screen.getByRole('button', { name: '今日は休む' }))
      await user.click(screen.getByRole('button', { name: 'やめる' }))

      expect(onConfirmRest).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: '今日は休む' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '今日は休む' })).toHaveFocus()
    })

    it('確認UI表示時、確認文へfocusが移る（誤ってEnter/Spaceで確定しない）', async () => {
      const user = userEvent.setup()
      render(<TodaySetupScreen {...baseProps} />)

      await user.click(screen.getByRole('button', { name: '今日は休む' }))

      expect(screen.getByText('今日をお休みにしますか？')).toHaveFocus()
    })
  })
})
