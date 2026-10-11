import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppLayout } from '../AppLayout/AppLayout'
import { HistoryRoute } from '@/features/history/routes/HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// route-level統合fixture。mockではなく実際のAppLayout + 各routeをmountし、
// 3項目（今日/Inbox/記録）のselected状態を並べて確認する。Today側はActiveまで
// 進めないとBottom Navigationのlabelがすべて揃わないため、初期candidateから
// 1件選び「今日をはじめる」までplay functionで進める。
function RouteFrame({ initialPath = '/today' }: { initialPath?: string }) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/history', element: <HistoryRoute /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  )
  return <RouterProvider router={router} />
}

const meta = {
  title: 'app/router/fixtures/BottomNavigation',
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: '390-844' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TodaySelected: Story = {
  name: '1. 今日 selected（Setup state、nav常時表示）',
  render: () => <RouteFrame />,
}

export const InboxSelected: Story = {
  name: '2. Inbox selected',
  render: () => <RouteFrame initialPath="/inbox" />,
}

export const HistorySelected: Story = {
  name: '3. 記録 selected（Historyがprimary destinationへ昇格）',
  render: () => <RouteFrame initialPath="/history" />,
}
