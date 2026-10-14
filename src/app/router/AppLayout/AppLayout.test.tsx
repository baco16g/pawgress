import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from './AppLayout'
import { INITIAL_LIFECYCLE_STATE } from '@/testing/dailyLifecycleFixtures'
import { HistoryRoute } from '@/features/history/routes/HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { SettingsRoute } from '@/features/settings/routes/SettingsRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// Bottom Navigationは今日/Inbox/記録の3項目。Settingsはsecondary utility
// destinationのままBottom Navigationには追加しない。
function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout initialLifecycleState={INITIAL_LIFECYCLE_STATE} />,
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

function startTodayActive(user: ReturnType<typeof userEvent.setup>) {
  return async () => {
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
  }
}

describe('Bottom Navigation — 構成', () => {
  it('1. Bottom Navigationは今日/Inbox/記録の3項目のみ', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getAllByRole('link')).toHaveLength(3)
  })

  it('2. labelは「今日」「Inbox」「記録」', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: '今日' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Inbox' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: '記録' })).toBeInTheDocument()
  })

  it('3. Historyへのlinkを持つ', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: '記録' })).toHaveAttribute('href', '/history')
  })

  it('4. Settingsへのlinkは持たない', () => {
    renderApp('/settings')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).queryByRole('link', { name: '設定' })).not.toBeInTheDocument()
    expect(within(nav).getAllByRole('link')).toHaveLength(3)
  })

  it('9. 3項目それぞれの<li>がflexの実item（.navListItem）として幅を分け合う構造になっている（Bottom Nav width correction、D-062。実pixel幅の検証はPlaywrightで行う）', () => {
    renderApp('/settings')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    const items = within(nav).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.className).toMatch(/navListItem/)
    }
  })
})

describe('Bottom Navigation — 選択状態', () => {
  it('5. 「記録」tapでHistoryへnavigateする', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(screen.getByRole('heading', { name: '記録' })).toBeInTheDocument()
  })

  it('6. History上では「記録」がselectedになり、今日/Inboxはselectedにならない', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    await user.click(within(nav).getByRole('link', { name: '記録' }))

    expect(within(nav).getByRole('link', { name: '記録' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: '今日' })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('aria-current')
  })

  it('7. Today上では「今日」がselectedになる（既存挙動、回帰無し）', async () => {
    const user = userEvent.setup()
    renderApp('/today')
    await startTodayActive(user)()

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: '今日' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: '記録' })).not.toHaveAttribute('aria-current')
  })

  it('8. Inbox上では「Inbox」がselectedになる（既存挙動、回帰無し）', () => {
    renderApp('/inbox')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: '記録' })).not.toHaveAttribute('aria-current')
  })

  it('9. Settings上ではBottom Navigationのどの項目もselectedにならない', () => {
    renderApp('/settings')

    const nav = screen.getByRole('navigation', { name: '主要な画面' })
    expect(within(nav).getByRole('link', { name: '今日' })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('aria-current')
    expect(within(nav).getByRole('link', { name: '記録' })).not.toHaveAttribute('aria-current')
  })
})
