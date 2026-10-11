import { Check } from 'lucide-react'
import type { CompanionSpecies, CompanionState } from '@/features/companion/model/companion'
import { getCompanionAtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import type { CompanionVariant } from '@/features/companion/model/companionAssets'
import { getCompanionVisualScale } from '@/features/companion/model/companionPresentation'
import { Companion } from '@/features/companion/ui/Companion/Companion'
import { DispositionRow } from '@/features/review/DispositionRow/DispositionRow'
import { AtmosphereScreenShell } from '@/features/companion/ui/AtmosphereScreenShell/AtmosphereScreenShell'
import { isDailyReviewResolved, type Disposition } from '@/domain/review/dailyReview'
import type { Task } from '@/domain/task/task'
import { Button } from '@/shared/ui/Button/Button'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './ReviewScreen.module.css'

export interface ReviewScreenProps {
  todayLabel: string
  tasks: Task[]
  dispositions: Readonly<Record<string, Disposition>>
  companionSpecies: CompanionSpecies
  companionVariant: CompanionVariant
  onSetDisposition: (id: string, disposition: Disposition) => void
  onCompleteReview: () => void
}

function deriveReviewCompanionState(tasks: Task[]): CompanionState {
  if (tasks.length > 0 && tasks.every((task) => task.completed)) return 'completed'
  return 'review'
}

export function ReviewScreen({
  todayLabel,
  tasks,
  dispositions,
  companionSpecies,
  companionVariant,
  onSetDisposition,
  onCompleteReview,
}: ReviewScreenProps) {
  const completedTasks = tasks.filter((task) => task.completed)
  const unfinishedTasks = tasks.filter((task) => !task.completed)
  const atmospherePreset = getCompanionAtmospherePreset(companionVariant)
  const companionScale = getCompanionVisualScale(companionVariant)
  const allCompleted = tasks.length > 0 && unfinishedTasks.length === 0
  const canComplete = isDailyReviewResolved(tasks, dispositions)
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <AtmosphereScreenShell
      todayLabel={todayLabel}
      atmospherePreset={atmospherePreset}
      atmosphereModifier={allCompleted ? 'sage' : undefined}
      reserveNavSpace={false}
      heading="今日を振り返る"
      headingRef={headingRef}
      headingTabIndex={-1}
      afterHeading={<p className={styles.supportingText}>今日のタスクを確認しましょう。</p>}
      companion={
        <Companion
          species={companionSpecies}
          variant={companionVariant}
          state={deriveReviewCompanionState(tasks)}
          size={`calc(clamp(240px, 105vw, 420px) * ${String(companionScale)})`}
          framed={false}
        />
      }
      sheetContentClassName={styles.reviewSheetContent}
    >
      {completedTasks.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>完了</h2>
          <ul className={styles.readonlyList}>
            {completedTasks.map((task) => (
              <li key={task.id} className={styles.readonlyItem}>
                <span className={styles.readonlyMark} aria-hidden="true">
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <span className={styles.readonlyTitle}>{task.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {unfinishedTasks.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>未完了</h2>
          <ul className={styles.dispositionList}>
            {unfinishedTasks.map((task) => (
              <DispositionRow
                key={task.id}
                title={task.title}
                disposition={dispositions[task.id]}
                onChange={(disposition) => {
                  onSetDisposition(task.id, disposition)
                }}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.footer}>
        <Button
          variant="primary"
          className={styles.completeButton}
          onClick={onCompleteReview}
          disabled={!canComplete}
        >
          1日を終える
        </Button>
      </div>
    </AtmosphereScreenShell>
  )
}
