import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppLayout } from '../AppLayout/AppLayout'
import { INITIAL_LIFECYCLE_STATE } from '@/testing/dailyLifecycleFixtures'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// route-level統合fixture。/inboxへ直接到達した場合のBottom Navigation
// （Inbox active）を確認する。
function RouteFrame() {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout initialLifecycleState={INITIAL_LIFECYCLE_STATE} />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
        ],
      },
    ],
    { initialEntries: ['/inbox'] },
  )
  return <RouterProvider router={router} />
}

const meta = {
  title: 'app/router/fixtures/InboxRoute',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: '390-844' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const InboxRoute390: Story = {
  name: 'Inbox route: 390px（Bottom Navigation込み）',
  render: () => <RouteFrame />,
}

export const InboxRoute320: Story = {
  name: 'Inbox route: 320px（Bottom Navigation込み）',
  render: () => <RouteFrame />,
  globals: { viewport: { value: '320-568' } },
}
