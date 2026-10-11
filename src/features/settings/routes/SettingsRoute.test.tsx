import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from '@/app/router/AppLayout/AppLayout'
import { HistoryRoute } from '@/features/history/routes/HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { SettingsRoute } from './SettingsRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// Settingsはsecondary utility destinationとしてgear icon経由でのみ到達する最小screen。
function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/history', element: <HistoryRoute /> },
          { path: '/settings', element: <SettingsRoute /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  const view = render(<RouterProvider router={router} />)
  return { ...view, router }
}

async function goTo(router: ReturnType<typeof renderApp>['router'], path: string) {
  await act(async () => {
    await router.navigate(path)
  })
}

describe('SettingsRoute', () => {
  it('1. /settingsでSettings routeが描画される', () => {
    renderApp('/settings')

    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('2. Settings見出しが正しく描画される', () => {
    renderApp('/settings')

    const heading = screen.getByRole('heading', { name: '設定' })
    expect(heading.tagName).toBe('H1')
  })

  it('3. 「記録」行を持たない（HistoryはBottom Navigationから直接アクセスする）', () => {
    renderApp('/settings')

    const main = screen.getByRole('main')
    expect(within(main).queryByRole('link', { name: /記録/ })).not.toBeInTheDocument()
  })

  it('placeholder設定（toggle等）を表示しない', () => {
    renderApp('/settings')

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('17. Today Active headerのgear iconからSettingsへ到達できる（production entry point）', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('button', { name: '設定' }))

    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('18. Today Setup headerのgear iconからもSettingsへ到達できる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('button', { name: '設定' }))

    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('19. Today RESTのgear iconからもSettingsへ到達できる', async () => {
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('button', { name: '今日は休む' }))
    await user.click(screen.getByRole('button', { name: '休む' }))
    await user.click(screen.getByRole('button', { name: '設定' }))

    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('Settingsから「今日」navでTodayへ戻れる（既存Bottom Nav conventionを再利用）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')
    await goTo(router, '/settings')

    await user.click(screen.getByRole('link', { name: '今日' }))

    expect(screen.getByRole('heading', { name: '今日をはじめる' })).toBeInTheDocument()
  })

  it('Settings経由の往復はToday lifecycle state（完了状態）を変えない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()

    await goTo(router, '/settings')
    await goTo(router, '/today')

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
  })

  it('11. REST中にSettingsへ遷移してもRESTはcancelされない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('button', { name: '今日は休む' }))
    await user.click(screen.getByRole('button', { name: '休む' }))

    await goTo(router, '/settings')
    await goTo(router, '/today')

    expect(screen.getByRole('heading', { name: '今日はお休み' })).toBeInTheDocument()
  })

  it('12. Active中にSettingsへ遷移してもActive stateはresetされない（todayTasksが維持される）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '資料を確認する' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    await goTo(router, '/settings')
    await goTo(router, '/today')

    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '資料を確認する' })).toBeInTheDocument()
  })

  it('16. Settings経由の往復はInboxのdataを変えない', async () => {
    const { router } = renderApp('/today')

    await goTo(router, '/settings')
    await goTo(router, '/history')
    await goTo(router, '/inbox')

    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('本を返却する')).toBeInTheDocument()
  })
})
