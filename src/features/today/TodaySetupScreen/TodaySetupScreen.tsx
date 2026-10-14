import { useEffect, useId, useRef, useState } from 'react'
import type { CompanionSpecies } from '@/features/companion/model/companion'
import { VARIANT_LABEL, type CompanionVariant } from '@/features/companion/model/companionAssets'
import { InlineAddRow } from '@/shared/ui/InlineAddRow/InlineAddRow'
import { RestAction } from '@/features/today/TodaySetupScreen/components/RestAction'
import { SelectionList } from '@/features/today/TodaySetupScreen/components/SelectionList'
import { AtmosphereScreenShell } from '@/features/companion/ui/AtmosphereScreenShell/AtmosphereScreenShell'
import type { Task } from '@/domain/task/task'
import { Button } from '@/shared/ui/Button/Button'
import { Toast } from '@/shared/ui/Toast/Toast'
import styles from './TodaySetupScreen.module.css'

export interface TodaySetupScreenProps {
  todayLabel: string
  carryOverCandidates: Task[]
  inboxCandidates: Task[]
  selectedIds: ReadonlySet<string>
  minSelection: number
  maxSelection: number
  companionSpecies: CompanionSpecies
  companionVariant: CompanionVariant
  canCaptureInboxCandidate: boolean
  justCancelledRest: boolean
  onToggleSelect: (id: string) => void
  onAddCandidate: (title: string) => void
  onStartToday: () => void
  onConfirmRest: () => void
  onOpenSettings: () => void
}

export function TodaySetupScreen({
  todayLabel,
  carryOverCandidates,
  inboxCandidates,
  selectedIds,
  minSelection,
  maxSelection,
  companionSpecies,
  companionVariant,
  canCaptureInboxCandidate,
  justCancelledRest,
  onToggleSelect,
  onAddCandidate,
  onStartToday,
  onConfirmRest,
  onOpenSettings,
}: TodaySetupScreenProps) {
  const limitHintId = useId()
  const capacityMessageId = useId()
  const selectedCount = selectedIds.size
  const isMaxReached = selectedCount >= maxSelection
  const isBelowMinimum = selectedCount < minSelection
  const hasCandidates = carryOverCandidates.length > 0 || inboxCandidates.length > 0
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [restToastDismissed, setRestToastDismissed] = useState(false)
  const showRestToast = justCancelledRest && !restToastDismissed

  useEffect(() => {
    if (justCancelledRest) {
      headingRef.current?.focus()
    }
  }, [justCancelledRest])

  return (
    <>
      <AtmosphereScreenShell
        todayLabel={todayLabel}
        companion={{
          species: companionSpecies,
          variant: companionVariant,
          state: 'idle',
          variantLabel: VARIANT_LABEL[companionVariant],
        }}
        atmosphereModifier="peach"
        onOpenSettings={onOpenSettings}
        heading="今日をはじめる"
        headingRef={headingRef}
        headingTabIndex={-1}
        afterHeading={<p className={styles.supportingText}>今日やることを選びましょう。</p>}
        afterCompanion={
          <p className={styles.companionVariantLabel}>{VARIANT_LABEL[companionVariant]}</p>
        }
        sheetContentClassName={styles.taskSheetContent}
      >
        {carryOverCandidates.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>前回からの続き</h2>
            <SelectionList
              candidates={carryOverCandidates}
              selectedIds={selectedIds}
              isMaxReached={isMaxReached}
              limitHintId={limitHintId}
              onToggle={onToggleSelect}
            />
          </section>
        ) : null}

        {hasCandidates ? (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Inbox</h2>
            {inboxCandidates.length > 0 ? (
              <SelectionList
                candidates={inboxCandidates}
                selectedIds={selectedIds}
                isMaxReached={isMaxReached}
                limitHintId={limitHintId}
                onToggle={onToggleSelect}
              />
            ) : (
              <p className={styles.inboxEmptyText}>Inboxに候補はありません。</p>
            )}
          </section>
        ) : (
          <p className={styles.emptyMessage}>
            候補はまだありません。下から今日のタスクを追加できます。
          </p>
        )}

        <InlineAddRow
          onSave={onAddCandidate}
          disabled={!canCaptureInboxCandidate}
          describedById={canCaptureInboxCandidate ? undefined : capacityMessageId}
        />
        {!canCaptureInboxCandidate ? (
          <p id={capacityMessageId} className={styles.capacityMessage} role="status">
            Inboxがいっぱいです。今日やるタスクを選んで「今日をはじめる」を押すと空きができます。
          </p>
        ) : null}

        <div className={styles.footer}>
          <p className={styles.selectionCount} aria-live="polite">
            {selectedCount} / {maxSelection} 選択中
          </p>
          {isMaxReached ? (
            <p id={limitHintId} className={styles.limitHint}>
              上限（{maxSelection}件）に達しました。解除すると他を選べます。
            </p>
          ) : null}
          <Button
            variant="primary"
            className={styles.startButton}
            onClick={onStartToday}
            disabled={isBelowMinimum}
          >
            今日をはじめる
          </Button>
          <RestAction onConfirm={onConfirmRest} />
        </div>
      </AtmosphereScreenShell>
      {showRestToast ? (
        <Toast
          message="お休みの設定を取り消しました。"
          onDismiss={() => {
            setRestToastDismissed(true)
          }}
        />
      ) : null}
    </>
  )
}
