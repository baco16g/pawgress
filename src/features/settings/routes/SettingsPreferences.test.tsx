import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TodaySetupScreen } from '@/features/today/TodaySetupScreen/TodaySetupScreen'
import { createTask } from '@/domain/task/task'
import { AppLayout } from '@/app/router/AppLayout/AppLayout'
import { INITIAL_LIFECYCLE_STATE } from '@/testing/dailyLifecycleFixtures'
import { HistoryRoute } from '@/features/history/routes/HistoryRoute'
import { InboxRoute } from '@/features/inbox/routes/InboxRoute'
import { ReviewRoute } from '@/features/review/routes/ReviewRoute'
import { SettingsCompanionRoute } from './SettingsCompanionRoute'
import { SettingsMaxTasksRoute } from './SettingsMaxTasksRoute'
import { SettingsMotionRoute } from './SettingsMotionRoute'
import { SettingsRoute } from './SettingsRoute'
import { SettingsTextSizeRoute } from './SettingsTextSizeRoute'
import { SettingsThemeRoute } from './SettingsThemeRoute'
import { TodayRoute } from '@/features/today/routes/TodayRoute'

// 文字サイズ/テーマ/アニメーション/相棒/1日の最大タスク量が実際にwiringされ、
// localStorageへ永続化されることを検証する。daily lifecycle data（todayTasks等）とは
// 別のpersistence keyを使うため、beforeEach/afterEachでlocalStorageをクリアして
// テスト間の干渉を防ぐ。
function renderApp(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AppLayout initialLifecycleState={INITIAL_LIFECYCLE_STATE} />,
        children: [
          { path: '/today', element: <TodayRoute /> },
          { path: '/inbox', element: <InboxRoute /> },
          { path: '/review', element: <ReviewRoute /> },
          { path: '/history', element: <HistoryRoute /> },
          { path: '/settings', element: <SettingsRoute /> },
          { path: '/settings/text-size', element: <SettingsTextSizeRoute /> },
          { path: '/settings/theme', element: <SettingsThemeRoute /> },
          { path: '/settings/motion', element: <SettingsMotionRoute /> },
          { path: '/settings/companion', element: <SettingsCompanionRoute /> },
          { path: '/settings/max-tasks', element: <SettingsMaxTasksRoute /> },
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

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('Settings — 1日の最大タスク量', () => {
  it('13. デフォルトの最大値は3のまま（Setupの選択数表示に反映される）', () => {
    renderApp('/today')

    expect(screen.getByText('0 / 3 選択中')).toBeInTheDocument()
  })

  it('14. Settingsで設定した最大値がSetupの選択に反映される', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/settings/max-tasks')

    await user.click(screen.getByRole('radio', { name: '2件' }))
    await goTo(router, '/today')

    expect(screen.getByText('0 / 2 選択中')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '部屋を片付ける' }))

    expect(screen.getByText('2 / 2 選択中')).toBeInTheDocument()
    // 上限到達後、未選択のcandidateはdisabledになる。
    expect(screen.getByRole('checkbox', { name: '本を返却する' })).toBeDisabled()
  })

  it('15. 選択済みが上限を超えた状態で最大値を下げても、既存の選択は消えない（silent truncateしない）', async () => {
    // selectedIds（Setup画面のUI-local状態）はTodayRoute unmount/remount
    // （Settingsへの往復を含む）で保持されない。そのため「maxTodayTasksを下げても
    // 既存の選択をtruncateしない」という挙動自体は、同一mount内でmaxSelectionが
    // 変化する場面（TodaySetupScreenのprops変化）として検証する。実際の
    // SelectionList/SelectionRowのdisabledロジック（§8の核心）を直接確認する。
    const user = userEvent.setup()
    renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '部屋を片付ける' }))
    await user.click(screen.getByRole('checkbox', { name: '本を返却する' }))
    expect(screen.getByText('3 / 3 選択中')).toBeInTheDocument()

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: '部屋を片付ける' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: '本を返却する' })).toBeChecked()

    // 既存の選択解除（チェックを外す）は引き続きできる（truncateではなく
    // ユーザー自身の明示的な操作のみがselectionを変える）。
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).not.toBeChecked()
  })

  it('15b. maxSelection propが選択数より小さくなっても、SelectionListは既存の選択済みcheckboxをdisabledにしない（truncate防止の核心ロジック）', () => {
    const candidates = [createTask('A', 'a'), createTask('B', 'b'), createTask('C', 'c')]
    const selectedIds = new Set(['a', 'b', 'c'])

    render(
      <MemoryRouter>
        <TodaySetupScreen
          todayLabel="10/4"
          carryOverCandidates={[]}
          inboxCandidates={candidates}
          selectedIds={selectedIds}
          minSelection={1}
          maxSelection={2}
          companionSpecies="dog"
          companionVariant="golden-retriever"
          canCaptureInboxCandidate={true}
          justCancelledRest={false}
          onToggleSelect={() => undefined}
          onAddCandidate={() => undefined}
          onStartToday={() => undefined}
          onConfirmRest={() => undefined}
          onOpenSettings={() => undefined}
        />
      </MemoryRouter>,
    )

    // maxSelection(2) < 選択済み件数(3)でも、選択済みのcheckboxは3件ともchecked
    // かつ有効なまま（disabledにならない、selectedrowはisMaxReachedの対象外）。
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'B' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'C' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'C' })).toBeEnabled()
  })

  it('16. Active中に最大値を変更してもtodayTasksは変化しない（Active state非破壊）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('checkbox', { name: '部屋を片付ける' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()

    await goTo(router, '/settings/max-tasks')
    await user.click(screen.getByRole('radio', { name: '1件' }))
    await goTo(router, '/today')

    // Active中のtodayTasksは最大値の変更と無関係に維持される（上限はSetupの
    // 選択UIだけが参照する）。
    expect(screen.getByRole('heading', { name: '今日のやること' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '部屋を片付ける' })).toBeInTheDocument()
  })

  it('17. 最大値の変更はHistory recordに影響しない（Review完了後の記録内容が変わらない）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))
    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日を振り返る' }))
    await user.click(screen.getByRole('button', { name: '1日を終える' }))

    await goTo(router, '/settings/max-tasks')
    await user.click(screen.getByRole('radio', { name: '5件' }))

    await goTo(router, '/history')
    expect(screen.getByText('牛乳を買う')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
  })
})

describe('Settings — preference persistence', () => {
  it('18. 文字サイズの選択がlocalStorageへ永続化される', async () => {
    const user = userEvent.setup()
    renderApp('/settings/text-size')

    await user.click(screen.getByRole('radio', { name: '大きめ' }))

    const stored: unknown = JSON.parse(window.localStorage.getItem('pawgress.settings.v1') ?? '{}')
    expect(stored).toMatchObject({ textSize: 'large' })
  })

  it('18b. 文字サイズの選択が--font-scaleへ実際に反映される', async () => {
    const user = userEvent.setup()
    renderApp('/settings/text-size')

    await user.click(screen.getByRole('radio', { name: '特大' }))

    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.3')
  })

  it("18c. アニメーション「少なくする」はdata-motion='reduced'を付与する", async () => {
    const user = userEvent.setup()
    renderApp('/settings/motion')

    await user.click(screen.getByRole('radio', { name: '少なくする' }))

    expect(document.documentElement.dataset.motion).toBe('reduced')
  })

  it('19. route変更後もpreferenceの選択状態は変わらない（Settings再訪問で保持される）', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/settings/companion')

    await user.click(screen.getByRole('radio', { name: '猫' }))
    await goTo(router, '/today')
    await goTo(router, '/settings')

    expect(screen.getByRole('link', { name: '相棒 猫' })).toBeInTheDocument()
  })

  it('20. 相棒の変更はInbox/todayTasksのdataを変更しない', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/today')

    await user.click(screen.getByRole('checkbox', { name: '牛乳を買う' }))
    await user.click(screen.getByRole('button', { name: '今日をはじめる' }))

    await goTo(router, '/settings/companion')
    await user.click(screen.getByRole('radio', { name: '猫' }))
    await goTo(router, '/today')

    expect(screen.getByRole('checkbox', { name: '牛乳を買う' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /相棒\(猫\)/ })).toBeInTheDocument()

    await goTo(router, '/inbox')
    expect(screen.getByText('部屋を片付ける')).toBeInTheDocument()
    expect(screen.getByText('本を返却する')).toBeInTheDocument()
  })

  it('相棒変更後、Setup/REST/Active全画面で一貫して反映される', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/settings/companion')

    await user.click(screen.getByRole('radio', { name: '猫' }))
    await goTo(router, '/today')

    // Today Setupのみ品種名reveal（D-080）がaccessible labelへ追加されるため、
    // 末尾の閉じ括弧までは固定しない（日替わりvariantで文言が変わるため）。
    expect(screen.getByRole('img', { name: /相棒\(猫/ })).toBeInTheDocument()
  })
})
