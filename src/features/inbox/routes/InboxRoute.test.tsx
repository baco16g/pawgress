import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from '@/app/router/AppLayout/AppLayout'
import { INITIAL_LIFECYCLE_STATE } from '@/testing/dailyLifecycleFixtures'
import { InboxRoute } from './InboxRoute'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout initialLifecycleState={INITIAL_LIFECYCLE_STATE} />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/review', element: <ReviewRoute /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  return render(<RouterProvider router={router} />)
}

// 初期demo fixtureのInbox candidate数は3件（牛乳を買う/部屋を片付ける/本を返却する）。
async function captureTasks(user: ReturnType<typeof userEvent.setup>, count: number) {
  const input = screen.getByRole('textbox', { name: 'タスクを追加' })
  for (let i = 0; i < count; i += 1) {
    await user.type(input, `capacity-${String(i)}{Enter}`)
  }
}

// Bottom Navigationも`<ul>/<li>`のためlistitem roleを持つ。Inbox task listだけを
// 数えるため、main領域に絞り込む。
function inboxListItems() {
  return within(screen.getByRole('main')).getAllByRole('listitem')
}

describe('InboxRoute', () => {
  it('Bottom NavigationでInboxがactive、今日がinactiveになる', () => {
    renderApp('/inbox')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: '今日' })).not.toHaveAttribute('aria-current')
  })

  it('新規taskを作成するとInboxに残り続ける（checkboxは表示されない）', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '新しいタスク{Enter}')

    expect(screen.getByText('新しいタスク')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('Setupで選択しなかったInbox candidateはInboxに残る（選択したものは消える）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('link', { name: 'Inbox' }))

    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('本を返却する')).toBeInTheDocument()
    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
  })

  it('Setupで選択しなかったcarry-overはInboxへ戻る', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    // carry-over「資料を確認する」は選択せず、Inbox「牛乳を買う」だけ選んで開始。
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('link', { name: 'Inbox' }))

    expect(screen.getByText('資料を確認する')).toBeInTheDocument()
  })

  it('Reviewで「Inboxへ戻す」を選んだtaskは重複なくInboxに現れる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

    await user.click(screen.getByRole('radio', { name: 'Inboxへ戻す' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    // Review完了後はTodayDoneScreen（terminal state）になるため、「今日をやめる」で
    // 明示的にSetupへ戻ってから次のcycleへ進む（D-086）。
    await user.click(screen.getByRole('button', { name: '今日の完了を取り消す' }))
    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('link', { name: 'Inbox' }))

    expect(screen.getAllByText('牛乳を買う')).toHaveLength(1)
  })

  it('route transition（Inbox→今日Setup→Active→Inbox）をまたいでも同じInbox stateが維持される', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, 'Inboxで追加したタスク{Enter}')

    // Setup→Activeの遷移も経由してからInboxへ戻り、複数route遷移をまたいでも
    // 同じInbox stateが維持されることを確認する。
    await user.click(screen.getByRole('link', { name: '今日' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('link', { name: 'Inbox' }))

    expect(screen.getByText('Inboxで追加したタスク')).toBeInTheDocument()
  })

  it('新しくcaptureしたtaskはlistの先頭へ追加される（既存の相対順は変わらない）', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '新しいタスク{Enter}')

    const main = screen.getByRole('main')
    const titles = within(main)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(titles).toEqual(['新しいタスク', '牛乳を買う', '部屋を片付ける', '本を返却する'])
  })

  it('capacity境界（9→成功/10→disabled/11→disabledのまま）をInbox画面から確認する', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    // 初期3件 + 6件captureして9件にする（まだcapture可能）。
    await captureTasks(user, 6)
    expect(inboxListItems()).toHaveLength(9)
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeEnabled()

    // 10件目（capacity）: captureは成功し、先頭へ追加される。
    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '10件目{Enter}')
    expect(inboxListItems()).toHaveLength(10)
    expect(inboxListItems()[0]).toHaveTextContent('10件目')

    // capacity到達: inputがdisabledになり、capacity messageが表示される。
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeDisabled()
    expect(
      screen.getByText('Inboxがいっぱいです。不要なタスクを削除すると空きができます。'),
    ).toBeInTheDocument()

    // 11件目のcapture試行: inputがdisabledのため入力自体が反映されず、件数は変わらない。
    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), '11件目のつもり{Enter}')
    expect(inboxListItems()).toHaveLength(10)
    expect(screen.queryByText('11件目のつもり')).not.toBeInTheDocument()
  })

  it('capacity到達後もReviewの「Inboxへ戻す」は常に受け入れられる（11件になる）', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    await captureTasks(user, 7)
    expect(inboxListItems()).toHaveLength(10)

    await user.click(screen.getByRole('link', { name: '今日' }))
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    await user.click(screen.getByRole('radio', { name: 'Inboxへ戻す' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    // Review完了後はTodayDoneScreenになるため、「今日をやめる」で明示的にSetupへ
    // 戻ってから再度1件選んでActive経由でInboxへ（D-086）。
    await user.click(screen.getByRole('button', { name: '今日の完了を取り消す' }))
    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    await user.click(screen.getByRole('checkbox', { name: 'メールの下書きを送る' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('link', { name: 'Inbox' }))

    expect(inboxListItems()).toHaveLength(11)
    expect(screen.getByText('資料を確認する')).toBeInTheDocument()
    // capacity超過でもinputはdisabledのまま（新規captureのみ禁止）。
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeDisabled()
  })

  it('Today SetupのInline Addはdestination-based policyによりInbox capacityを共有する', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    // 初期3件 + 6件captureして9件（まだcapture可能）。
    await captureTasks(user, 6)
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeEnabled()

    // 10件目: Setup経由でもcaptureは成功する（9→10はまだcapacity未到達）。
    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), '10件目Setup経由{Enter}')
    expect(screen.getByText('10件目Setup経由')).toBeInTheDocument()

    // capacity到達: Setup画面のInputもdisabledになり、Setup専用のcapacity messageが
    // 表示される。
    expect(screen.getByRole('textbox', { name: 'タスクを追加' })).toBeDisabled()
    expect(
      screen.getByText(
        'Inboxがいっぱいです。今日やるタスクを選んで「今日をはじめる」を押すと空きができます。',
      ),
    ).toBeInTheDocument()

    // 11件目のSetup経由captureは拒否される（inputがdisabledのため反映されない）。
    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), '11件目のつもり{Enter}')
    expect(screen.queryByText('11件目のつもり')).not.toBeInTheDocument()
  })

  it('Today ActiveのInline Addはtodayへ直接追加するためInbox capacityの対象外（destination-based policy）', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    // Inboxを9件にする（3初期 + 6capture）。
    await captureTasks(user, 6)
    expect(inboxListItems()).toHaveLength(9)

    // Setupでcapacity-0を選んでToday開始。today/startはcarry-over（2件）も同時に
    // 解決するため、残るInboxは (9-1) + 2 = 10件になる。
    await user.click(screen.getByRole('link', { name: '今日' }))
    await user.click(screen.getByRole('checkbox', { name: 'capacity-0' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    // Today ActiveのInline AddでTodayへ直接追加する（Inbox poolは経由しない）。
    const activeInput = screen.getByRole('textbox', { name: 'タスクを追加' })
    expect(activeInput).toBeEnabled()
    await user.type(activeInput, 'Todayへ直接追加{Enter}')

    expect(screen.getByRole('checkbox', { name: 'Todayへ直接追加' })).toBeInTheDocument()

    // Inbox側の件数はToday Activeでの追加前後で変わらない（destinationがInboxでは
    // ないため、Inbox capacity判定を経由しない）。
    await user.click(screen.getByRole('link', { name: 'Inbox' }))
    expect(inboxListItems()).toHaveLength(10)
  })

  it('Inbox captureとSetup captureを両方行っても、taskが重複も欠落もせずそれぞれ1件ずつ現れる', async () => {
    const user = userEvent.setup()
    renderApp('/inbox')

    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), 'Inbox経由{Enter}')
    await user.click(screen.getByRole('link', { name: '今日' }))
    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), 'Setup経由{Enter}')

    // today/startはcarry-overも同時に解決するため、ここではSetup画面
    // 自身の表示（today/startを経由しない）で重複・欠落の有無だけを確認する。
    expect(screen.getAllByRole('checkbox', { name: 'Inbox経由' })).toHaveLength(1)
    expect(screen.getAllByRole('checkbox', { name: 'Setup経由' })).toHaveLength(1)
    // 初期3件（Inbox） + Inbox経由1件 + Setup経由1件 = Inbox候補5件（carry-over 2件は別途）。
    const inboxSection = screen.getByRole('heading', { name: 'Inbox' }).closest('section')
    expect(inboxSection).not.toBeNull()
    expect(within(inboxSection as HTMLElement).getAllByRole('checkbox')).toHaveLength(5)
  })

  it('Today Active中にInboxへ寄り道して戻ってもActiveのまま維持される（regression guard）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Inbox' }))
    await user.click(screen.getByRole('link', { name: '今日' }))

    // Setup（「今日をはじめる」見出し）へ巻き戻らず、進行中のtodayTasksを
    // 保ったままActiveへ戻ること。
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '今日をはじめる' })).not.toBeInTheDocument()
  })
})
