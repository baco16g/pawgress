import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './AppLayout/AppLayout'
import { HistoryRoute } from '@/features/history/routes/HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { SettingsCompanionRoute } from '@/features/settings/routes/SettingsCompanionRoute'
import { SettingsDataPrivacyRoute } from '@/features/settings/routes/SettingsDataPrivacyRoute'
import { SettingsLicensesRoute } from '@/features/settings/routes/SettingsLicensesRoute'
import { SettingsMaxTasksRoute } from '@/features/settings/routes/SettingsMaxTasksRoute'
import { SettingsMotionRoute } from '@/features/settings/routes/SettingsMotionRoute'
import { SettingsRoute } from '@/features/settings/routes/SettingsRoute'
import { SettingsTextSizeRoute } from '@/features/settings/routes/SettingsTextSizeRoute'
import { SettingsThemeRoute } from '@/features/settings/routes/SettingsThemeRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

export const router = createBrowserRouter(
  [
    {
      element: <AppLayout persist />,
      children: [
        { index: true, element: <Navigate to="/today" replace /> },
        { path: '/today', element: <TodayRoute /> },
        { path: '/inbox', element: <InboxRoute /> },
        { path: '/review', element: <ReviewRoute /> },
        { path: '/history', element: <HistoryRoute /> },
        {
          path: '/settings',
          children: [
            { index: true, element: <SettingsRoute /> },
            { path: 'text-size', element: <SettingsTextSizeRoute /> },
            { path: 'theme', element: <SettingsThemeRoute /> },
            { path: 'motion', element: <SettingsMotionRoute /> },
            { path: 'companion', element: <SettingsCompanionRoute /> },
            { path: 'max-tasks', element: <SettingsMaxTasksRoute /> },
            { path: 'data-privacy', element: <SettingsDataPrivacyRoute /> },
            { path: 'licenses', element: <SettingsLicensesRoute /> },
          ],
        },
      ],
    },
  ],
  // GitHub Pagesではサブパス（/pawgress/）から配信するため、
  // Viteが解決したbaseをそのままbasenameに使う（vite.config.tsと二重管理しない）。
  { basename: import.meta.env.BASE_URL },
)
