import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { canAddInboxTask } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import { createTask, type Task } from '@/domain/task/task'
import { TodaySetupScreen } from './TodaySetupScreen'

const CARRY_OVER: Task[] = [
  { id: 'carry-1', title: '資料を確認する', completed: false },
  { id: 'carry-2', title: 'メールの下書きを送る', completed: false },
]
const INBOX: Task[] = [
  { id: 'inbox-1', title: '牛乳を買う', completed: false },
  { id: 'inbox-2', title: '部屋を片付ける', completed: false },
  { id: 'inbox-3', title: '本を返却する', completed: false },
]
const TEN_INBOX: Task[] = Array.from({ length: 10 }, (_, index) =>
  createTask(`Inbox候補 ${String(index + 1)}`, `inbox-cap-${String(index)}`),
)

// 実際にclickでselection状態が変わることを確認できるよう、storyごとにlocal stateを
// 持たせる（static propsのみの表示ではなく、操作可能なdemoにする）。capacity判定は
// productionと同じpure helper（destination-based policy）を使う。
function TodaySetupScreenDemo({
  carryOverCandidates = CARRY_OVER,
  inboxCandidates = INBOX,
  initialSelectedIds = [],
  companionVariant = 'golden-retriever' as const,
  initialJustCancelledRest = false,
}: {
  carryOverCandidates?: Task[]
  inboxCandidates?: Task[]
  initialSelectedIds?: string[]
  companionVariant?: 'golden-retriever' | 'schnauzer'
  initialJustCancelledRest?: boolean
}) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set(initialSelectedIds))
  const [candidates, setCandidates] = useState<Task[]>(inboxCandidates)
  const [justCancelledRest] = useState(initialJustCancelledRest)
  const minSelection = 1
  const maxSelection = 3

  return (
    <TodaySetupScreen
      todayLabel="10/3"
      carryOverCandidates={carryOverCandidates}
      inboxCandidates={candidates}
      selectedIds={selectedIds}
      minSelection={minSelection}
      maxSelection={maxSelection}
      companionSpecies="dog"
      companionVariant={companionVariant}
      canCaptureInboxCandidate={canAddInboxTask(candidates)}
      justCancelledRest={justCancelledRest}
      onToggleSelect={(id) => {
        setSelectedIds((current) => {
          const next = new Set(current)
          if (next.has(id)) {
            next.delete(id)
          } else if (next.size < maxSelection) {
            next.add(id)
          }
          return next
        })
      }}
      onAddCandidate={(title) => {
        setCandidates((current) => [...current, createTask(title)])
      }}
      onStartToday={() => undefined}
      onConfirmRest={() => undefined}
      onOpenSettings={() => undefined}
    />
  )
}

const meta = {
  title: 'features/today/TodaySetupScreen',
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodaySetupScreenDemo>

export default meta
type Story = StoryObj<typeof meta>

export const ZeroSelectedDisabled: Story = {
  name: '1. ZeroSelectedDisabled',
  render: () => <TodaySetupScreenDemo />,
}

export const OneSelected: Story = {
  name: '2. OneSelected',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['inbox-1']} />,
}

export const MaxSelected: Story = {
  name: '3. MaxSelected',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['carry-1', 'carry-2', 'inbox-1']} />,
}

export const MaxSelectedWithDisabledCandidates: Story = {
  name: '4. MaxSelectedWithDisabledCandidates',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['carry-1', 'carry-2', 'inbox-1']} />,
}

export const CarryOverOnly: Story = {
  name: '5. CarryOverOnly',
  render: () => <TodaySetupScreenDemo inboxCandidates={[]} />,
}

export const InboxOnly: Story = {
  name: '6. InboxOnly',
  render: () => <TodaySetupScreenDemo carryOverCandidates={[]} />,
}

export const NoCandidates: Story = {
  name: '7. NoCandidates',
  render: () => <TodaySetupScreenDemo carryOverCandidates={[]} inboxCandidates={[]} />,
}

// carry-overを1件だけ選択した状態の確認用。Today Start後、選択しなかったcarry-overが
// Inboxへ戻ることは
// TodayRouteFixtureのinteraction storyで確認する（このstoryは選択状態の表示確認用）。
export const CarryOverDisposition: Story = {
  name: '8. CarryOverDisposition',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['carry-1']} />,
}

export const Viewport390: Story = {
  name: '9. Viewport390',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['inbox-1']} />,
  globals: { viewport: { value: '390-844' } },
}

export const Viewport320: Story = {
  name: '10. Viewport320',
  render: () => <TodaySetupScreenDemo initialSelectedIds={['inbox-1']} />,
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocus: Story = {
  name: '11. KeyboardFocus',
  render: () => <TodaySetupScreenDemo />,
  play: ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: '牛乳を買う' })
    checkbox.focus()
  },
}

export const ButterAtmosphere: Story = {
  name: '12. ButterAtmosphere',
  render: () => <TodaySetupScreenDemo companionVariant="schnauzer" />,
}

export const PowderBlueAtmosphere: Story = {
  name: '13. PowderBlueAtmosphere',
  render: () => <TodaySetupScreenDemo companionVariant="golden-retriever" />,
}

// destinationがInboxの新規captureはStandalone Inboxと同じpolicyを通るため、
// Setup画面でもcapacity到達時はInputがdisabledになる。
export const InboxAtCapacity: Story = {
  name: '14. InboxAtCapacity（10件、new captureはdisabled）',
  render: () => <TodaySetupScreenDemo inboxCandidates={TEN_INBOX} />,
}

// REST entry pointはPrimary CTA「今日をはじめる」の下に控えめに表示する。
export const RestActionVisible: Story = {
  name: '15. RestActionVisible',
  render: () => <TodaySetupScreenDemo />,
}

export const RestActionFocus: Story = {
  name: '16. RestActionFocus',
  render: () => <TodaySetupScreenDemo />,
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: '今日は休む' }).focus()
  },
}

// 「今日は休む」をclickすると、同じSheet内で軽量な確認
// （「今日をお休みにしますか？」+ 休む/やめる）が展開する。
export const RestConfirmationExpanded: Story = {
  name: '17. RestConfirmationExpanded',
  render: () => <TodaySetupScreenDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '今日は休む' }))
  },
}

// REST確定後はSetup自体をrenderしない（TodayRestScreenへ切り替わる）。
// 「確定済み」のacknowledgmentはTodayRestScreen側のStoryを参照。ここではcancellation
// 直後にSetupへ戻った場合のacknowledgmentのみを確認する。
export const JustCancelledRest: Story = {
  name: '18. JustCancelledRest（お休みをやめた直後のacknowledgment）',
  render: () => <TodaySetupScreenDemo initialJustCancelledRest />,
}
