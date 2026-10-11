import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppLayout } from '../AppLayout/AppLayout'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// route-level統合fixture。mockではなく実際のTodayRoute/ReviewRoute/InboxRoute
// （Setup→Active→Review→disposition→completion→Inboxのfull lifecycle）を
// AppLayoutの中でそのままmountする。
// DailyLifecycleContextが一本化されているため、3 routeとも同じtodayTasks/
// inboxCandidates/carryOverCandidatesを参照する。Bottom Navigationの表示可否も
// 含め、実際のrouting結果を確認する。
function RouteFrame({ initialPath = '/today' }: { initialPath?: string }) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/review', element: <ReviewRoute /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  return <RouterProvider router={router} />
}

const meta = {
  title: 'app/router/fixtures/TodayRoute',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: '390-844' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SetupStart: Story = {
  name: 'Today route: Setup state（初期表示）',
  render: () => <RouteFrame />,
}

export const SetupStart320: Story = {
  name: 'Today route: Setup state（320px）',
  render: () => <RouteFrame />,
  globals: { viewport: { value: '320-568' } },
}
