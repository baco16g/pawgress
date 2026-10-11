import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from '@/app/router/AppLayout/AppLayout'
import { HistoryRoute } from './HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/review', element: <ReviewRoute /> },
          { path: '/history', element: <HistoryRoute /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  const view = render(<RouterProvider router={router} />)
  return { ...view, router }
}

// HistoryはBottom Navigationのprimary destination。
// Setup中はBottom Navigation自体が隠れるため、Setupからの遷移を含め多くのテストで
// router.navigateを直接呼び、production UIのnav状態に依存しない（既存の方針を維持）。
async function goTo(router: ReturnType<typeof renderApp>['router'], path: string) {
  await act(async () => {
    await router.navigate(path)
  })
}

function dispositionRow(taskTitle: string): HTMLElement {
  const row = screen.getByText(taskTitle).closest('li')
  if (!row) throw new Error(`disposition row not found for ${taskTitle}`)
  return row
}

async function completeTodayWithMixedOutcomes(user: ReturnType<typeof userEvent.setup>) {
  // 初期demo fixture: Inbox「牛乳を買う」を完了、carry-over「資料を確認する」を持ち越し、
  // Inbox「部屋を片付ける」をInboxへ戻す（3種類のoutcomeを揃える）。
  await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
  await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
  await user.click(screen.getByRole('checkbox', { name: '部屋を片付ける' }))
  await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

  await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
  await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

  await user.click(
    within(dispositionRow('資料を確認する')).getByRole('radio', { name: '明日に持ち越す' }),
  )
  await user.click(
    within(dispositionRow('部屋を片付ける')).getByRole('radio', { name: 'Inboxへ戻す' }),
  )
  await user.click(screen.getByRole('button', { name: '1日を終える' }))
}

describe('HistoryRoute', () => {
  it('Historyでは「記録」tabがselectedになり、Today/Inboxはselectedにならない', async () => {
    const { router } = renderApp('/today')
    await goTo(router, '/history')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: '記録' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: '今日' })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('aria-current')
  })

  it('Review completion前はhistoryRecordsが0件のため、Empty Stateを表示する', async () => {
    const { router } = renderApp('/today')
    await goTo(router, '/history')

    expect(screen.getByText('まだ記録はありません')).toBeInTheDocument()
  })

  it('「1日を終える」成功後、Historyに本日のActive recordが現れ、3種類のoutcomeが見える', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await completeTodayWithMixedOutcomes(user)
    await goTo(router, '/history')

    // 既定でselectedDateKeyは本日のProduct Dayのため、clickなしでdetailが見える。
    expect(screen.queryByText('まだ記録はありません')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(screen.getByText('資料を確認する')).toBeInTheDocument()
    expect(screen.getByText('明日に持ち越した')).toBeInTheDocument()
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('Inboxへ戻した')).toBeInTheDocument()
  })

  it('同じProduct Dayで2回「1日を終える」を実行しても、Historyのrecordは1件のまま最新で上書きされる', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await completeTodayWithMixedOutcomes(user)

    // 「1日を終える」後はTodayDoneScreen（terminal state）になるため、「今日の完了を
    // 取り消す」→「今日をやめる」で明示的にSetupへ戻ってから2回目のcycleへ進む
    // （D-086）。
    await user.click(screen.getByRole('button', { name: '今日の完了を取り消す' }))
    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    // 2回目のToday cycle: 残っているcandidateから1件選び、完了させてからreviewする
    // （全task完了ならdisposition不要でCTAがenabledになる、product-spec.md §7）。
    await user.click(screen.getByRole('checkbox', { name: 'メールの下書きを送る' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('checkbox', { name: 'メールの下書きを送る' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    await goTo(router, '/history')

    // 1回目のoutcomeは2回目のrecordに上書きされ、Historyには2回目の内容だけが残る。
    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
    expect(screen.getByText('メールの下書きを送る')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
  })

  it('Historyは読み取り専用で、taskのcheckbox/編集操作を持たない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await completeTodayWithMixedOutcomes(user)
    await goTo(router, '/history')

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('Historyのrecordはsnapshotであり、Review完了後にInbox/Setup stateが変化してもHistory表示は変わらない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await completeTodayWithMixedOutcomes(user)

    // Reviewで「Inboxへ戻す」を選んだ「部屋を片付ける」を再度Inboxで操作してもHistoryの
    // snapshotには影響しない（Taskの完了状態はInbox taskには無いが、新規captureで
    // Inbox state自体を変化させて確認する）。router.navigateで直接移動する。
    await goTo(router, '/inbox')
    await user.type(
      screen.getByRole('textbox', { name: 'タスクを追加' }),
      '後から追加したタスク{Enter}',
    )

    await goTo(router, '/history')

    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('Inboxへ戻した')).toBeInTheDocument()
    expect(screen.queryByText('後から追加したタスク')).not.toBeInTheDocument()
  })
})

async function confirmRestFromSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '今日は休む' }))
  await user.click(screen.getByRole('button', { name: '休む' }))
}

// REST = 第一級のToday state。cancelは同じProduct Dayに限り可能。
// Today SetupのみからREST確定できる。
describe('HistoryRoute — REST flow', () => {
  it('1. Confirm REST from Setup → 専用のREST Today screenがrenderされる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()
  })

  it('2. REST Today screenはSetupのcandidate UIを一切renderしない', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByText('0 / 3 選択中')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '今日をはじめる' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '前回からの続き' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Inbox' })).not.toBeInTheDocument()
  })

  it('3. REST確定後、Historyに同じProduct DayのREST recordが1件だけ現れる', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await confirmRestFromSetup(user)
    await goTo(router, '/history')

    expect(screen.getByText('この日はお休みにしました。')).toBeInTheDocument()
    expect(screen.getAllByText('この日はお休みにしました。')).toHaveLength(1)
  })

  it('3b. REST確定はReviewを起動しない（/reviewへ遷移しない）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    expect(screen.queryByRole('heading', { name: '今日を振り返る' })).not.toBeInTheDocument()
  })

  it('4. Cancel REST → REST recordが削除される（Historyから消える）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    await goTo(router, '/history')
    expect(screen.getByText('まだ記録はありません')).toBeInTheDocument()
  })

  it('5. Cancel REST → TodayはSetupへ戻る', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    expect(screen.getByRole('heading', { name: '今日をはじめる' })).toBeInTheDocument()
  })

  it('6. Cancel REST → Inbox / carry-over candidateは変化しない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()

    await goTo(router, '/inbox')
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('本を返却する')).toBeInTheDocument()
  })

  it('7. Cancel REST → todayTasksは自動生成されない（Setupのまま、Activeへ遷移しない）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    expect(screen.queryByRole('heading', { name: '今日のやること' })).not.toBeInTheDocument()
    // 「今日をはじめる」はSetupの0件選択状態なのでdisabledのまま。
    expect(screen.getByRole('button', { name: '今日をはじめる' })).toBeDisabled()
  })

  it('8. Cancel REST後、taskを選択して通常どおりActiveを開始できる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })

  it('9. RESTからActiveへ直接遷移する経路は存在しない（REST中はSetUIが無く、today/startを呼べない）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    // REST画面にはcandidate選択・Primary CTAのどちらも存在しない（test 2と同じ前提の
    // 上で、Active固有のheadingも存在しないことを明示的に確認する）。
    expect(screen.queryByRole('heading', { name: '今日のやること' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '今日をはじめる' })).not.toBeInTheDocument()
  })

  it('11. Cancel REST後に再度RESTを確定しても、Historyのrecordは1件のまま', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await confirmRestFromSetup(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))
    await confirmRestFromSetup(user)

    await goTo(router, '/history')
    expect(screen.getAllByText('この日はお休みにしました。')).toHaveLength(1)
  })

  it('Today Activeを開始しただけ（Review未完了）ではHistory recordが作られない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()

    await goTo(router, '/history')
    expect(screen.getByText('まだ記録はありません')).toBeInTheDocument()
  })

  it('Reviewを開いただけ（disposition未完了）ではHistory recordが作られない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    expect(screen.getByRole('heading', { name: '今日を振り返る' })).toBeInTheDocument()

    await goTo(router, '/history')
    expect(screen.getByText('まだ記録はありません')).toBeInTheDocument()
  })

  it('Review完了で初めてActive recordが作られる', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await completeTodayWithMixedOutcomes(user)
    await goTo(router, '/history')

    expect(screen.queryByText('まだ記録はありません')).not.toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
  })

  it('REST中にReviewへ到達する経路が無いため、REST recordがActive completeで暗黙に置き換わることはない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await confirmRestFromSetup(user)

    // cancelせずに別routeへ寄り道しても（Inbox）、REST recordは維持される。
    await goTo(router, '/inbox')
    await goTo(router, '/today')
    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()

    await goTo(router, '/history')
    expect(screen.getByText('この日はお休みにしました。')).toBeInTheDocument()
  })
})

// HistoryはBottom Navigationのprimary destinationであり、Today lifecycleの各state
// （Setup/REST/Active）・Inboxから1 tapで直接到達できる。遷移はToday lifecycle state /
// REST / Active進捗 / Inbox dataを一切変更しない。
describe('HistoryRoute — Bottom Nav直接アクセス', () => {
  it('11. Setupから「記録」tapでHistoryへ直接到達できる（Setup中もBottom Navigationは表示される）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(screen.getByRole('heading', { name: '記録' })).toBeInTheDocument()
  })

  it('12. REST中に「記録」tapでHistoryへ直接到達できる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(screen.getByRole('heading', { name: '記録' })).toBeInTheDocument()
  })

  it('13. Active中に「記録」tapでHistoryへ直接到達できる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(screen.getByRole('heading', { name: '記録' })).toBeInTheDocument()
  })

  it('Inboxから「記録」tapでHistoryへ直接到達できる', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')
    await goTo(router, '/inbox')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(screen.getByRole('heading', { name: '記録' })).toBeInTheDocument()
  })

  it('14. REST中にHistoryへ遷移してもRESTは維持される（cancelされない）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await confirmRestFromSetup(user)

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))
    await user.click(within(nav).getByRole('link', { name: '今日' }))

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()
  })

  it('15. Active中にHistoryへ遷移してもtask進捗は維持される', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))
    await user.click(within(nav).getByRole('link', { name: '今日' }))

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
  })

  it('Historyへの往復はInbox candidateを変更しない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')
    await goTo(router, '/inbox')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))
    await user.click(within(nav).getByRole('link', { name: 'Inbox' }))

    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('本を返却する')).toBeInTheDocument()
  })
})
