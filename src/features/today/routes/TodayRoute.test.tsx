import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from '@/app/router/AppLayout/AppLayout'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { TodayRoute } from './TodayRoute'

function renderTodayRoute() {
  const router = createMemoryRouter(
    [{ element: <AppLayout />, children: [{ path: '/', element: <TodayRoute /> }] }],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderTodayAndReview() {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/review', element: <ReviewRoute /> },
        ],
      },
    ],
    { initialEntries: ['/today'] },
  )
  const view = render(<RouterProvider router={router} />)
  return { ...view, router }
}

describe('TodayRoute — Setup → Active lifecycle', () => {
  it('初期表示はToday Setup（candidate選択UI）になる', () => {
    renderTodayRoute()

    expect(screen.getByRole('heading', { name: '今日をはじめる' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })

  it('Setup中もBottom NavigationとSettings entryを表示する', () => {
    renderTodayRoute()

    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '設定' })).toBeInTheDocument()
  })

  it('Setupでは0件選択時に今日をはじめるがdisabled', () => {
    renderTodayRoute()

    expect(screen.getByRole('button', { name: '今日をはじめる' })).toBeDisabled()
  })

  it('Active遷移後はBottom NavigationとSettingsを表示する', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '設定' })).toBeInTheDocument()
  })

  it('選択したtaskだけがToday Activeへ渡り、completion stateは未完了で始まる', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).not.toBeChecked()
    // 選択しなかったcandidateはToday Activeへ現れない。
    expect(screen.queryByRole('checkbox', { name: '部屋を片付ける' })).not.toBeInTheDocument()
  })
})

describe('TodayRoute — REST state', () => {
  async function confirmRest(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: '今日は休む' }))
    await user.click(screen.getByRole('button', { name: '休む' }))
  }

  it('REST確定後もBottom NavigationとSettingsを表示する（Inboxへのnavigationを維持する、§8）', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    await confirmRest(user)

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
  })

  it('REST画面ではnavが見える（Today/Inbox/記録のどのtabもactiveにならない）', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    await confirmRest(user)

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(nav).toBeInTheDocument()
  })

  it('Cancel REST後もBottom Navigationは表示されたまま（Setup同様）', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    await confirmRest(user)
    await user.click(screen.getByRole('button', { name: 'お休みを取り消す' }))

    expect(screen.getByRole('heading', { name: '今日をはじめる' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
  })
})

describe('TodayRoute — carry-over disposition', () => {
  it('選択されなかったcarry-overはInboxへ戻り、選択されたものだけがTodayに入る', async () => {
    const user = userEvent.setup()
    renderTodayRoute()

    // carry-over「資料を確認する」は選択、「メールの下書きを送る」は未選択のまま。
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    // Today Activeには選択した2件のみ。
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'メールの下書きを送る' })).not.toBeInTheDocument()
  })
})

describe('TodayRoute ↔ ReviewRoute — full daily loop', () => {
  it('Active→Review→disposition→completion→Done→取り消し/やめるを経て次回Setupの候補へ正しく反映される', async () => {
    const user = userEvent.setup()
    renderTodayAndReview()

    // Setup: carry-over「資料を確認する」とInbox「牛乳を買う」を選択してToday開始。
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    // Active: 1件完了、1件は未完了のまま残してReviewへ。
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

    // Review: 完了taskはread-only、未完了taskにdispositionを選ぶ。
    expect(screen.getByRole('heading', { name: '今日を振り返る' })).toBeInTheDocument()
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '明日に持ち越す' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    // 「1日を終える」後はTodayDoneScreen（terminal state）になり、Setupへは
    // 自動的に戻らない（D-086）。
    expect(screen.getByRole('heading', { name: '今日はここまで' })).toBeInTheDocument()

    // 「今日の完了を取り消す」でActiveへ完全復元（完了/持ち越し状態込み）。
    await user.click(screen.getByRole('button', { name: '今日の完了を取り消す' }))
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()

    // 「今日をやめる」でSetupへ戻ると、持ち越したtaskがcarry-over候補として現れる。
    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    expect(screen.getByRole('heading', { name: '今日をはじめる' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()
  })

  it('Review中はBottom NavigationとSettingsを表示しない', async () => {
    const user = userEvent.setup()
    renderTodayAndReview()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

    expect(screen.getByRole('heading', { name: '今日を振り返る' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '主要な画面' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '設定' })).not.toBeInTheDocument()
  })

  it('Reviewで「1日を終える」とTodayへ戻り、Bottom Navigationが再び表示される', async () => {
    const user = userEvent.setup()
    renderTodayAndReview()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    await user.click(screen.getByRole('radio', { name: '明日に持ち越す' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    expect(screen.getByRole('heading', { name: '今日はここまで' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
  })

  it('Reviewから戻る操作でTodayへ戻っても、Bottom Navigationが再び表示される', async () => {
    const user = userEvent.setup()
    const { router } = renderTodayAndReview()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    expect(screen.queryByRole('navigation', { name: '主要な画面' })).not.toBeInTheDocument()

    await act(async () => {
      await router.navigate(-1)
    })

    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要な画面' })).toBeInTheDocument()
  })

  it('unfinished taskをInboxへ戻すdispositionを選べる', async () => {
    const user = userEvent.setup()
    renderTodayAndReview()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))

    await user.click(screen.getByRole('radio', { name: 'Inboxへ戻す' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    // Doneから取り消してActiveへ戻ると、dispositionも含めて元のtodayTasksが復元される。
    await user.click(screen.getByRole('button', { name: '今日の完了を取り消す' }))
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
  })
})
