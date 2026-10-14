import { ArrowRight } from 'lucide-react'
import type { CompanionSpecies, CompanionState } from '@/features/companion/model/companion'
import type { CompanionVariant } from '@/features/companion/model/companionAssets'
import { InlineAddRow } from '@/shared/ui/InlineAddRow/InlineAddRow'
import { TaskList } from '@/features/today/TodayActiveScreen/components/TaskList'
import { AbandonTodayAction } from '@/features/today/TodayActiveScreen/components/AbandonTodayAction'
import { Button } from '@/shared/ui/Button/Button'
import type { Task } from '@/domain/task/task'
import { AtmosphereScreenShell } from '@/features/companion/ui/AtmosphereScreenShell/AtmosphereScreenShell'
import styles from './TodayActiveScreen.module.css'

export interface TodayActiveScreenProps {
  todayLabel: string
  tasks: Task[]
  companionSpecies: CompanionSpecies
  companionVariant: CompanionVariant
  onToggleTask: (id: string) => void
  onAddTask: (title: string) => void
  onOpenSettings: () => void
  onOpenReview: () => void
  onAbandonToday: () => void
}

function deriveCompanionState(tasks: Task[]): CompanionState {
  if (tasks.length === 0) return 'idle'
  if (tasks.every((task) => task.completed)) return 'completed'
  if (tasks.some((task) => task.completed)) return 'pleased'
  return 'idle'
}

export function TodayActiveScreen({
  todayLabel,
  tasks,
  companionSpecies,
  companionVariant,
  onToggleTask,
  onAddTask,
  onOpenSettings,
  onOpenReview,
  onAbandonToday,
}: TodayActiveScreenProps) {
  const completedCount = tasks.filter((task) => task.completed).length
  const allCompleted = tasks.length > 0 && completedCount === tasks.length

  return (
    <AtmosphereScreenShell
      todayLabel={todayLabel}
      companion={{
        species: companionSpecies,
        variant: companionVariant,
        state: deriveCompanionState(tasks),
      }}
      atmosphereModifier={allCompleted ? 'sage' : undefined}
      onOpenSettings={onOpenSettings}
      heading="今日のやること"
      afterHeading={
        tasks.length > 0 ? (
          <p className={styles.progress}>
            {completedCount}/{tasks.length} 完了
          </p>
        ) : undefined
      }
      sheetContentClassName={styles.taskSheetContent}
    >
      {tasks.length > 0 ? <TaskList tasks={tasks} onToggleTask={onToggleTask} /> : null}

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <p>今日のタスクはまだありません。</p>
          <p>追加すると、ここに表示されます。</p>
        </div>
      ) : null}

      <InlineAddRow onSave={onAddTask} />

      <div className={styles.reviewCtaRow}>
        <Button variant="secondary" className={styles.reviewButton} onClick={onOpenReview}>
          今日を振り返る
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Button>
      </div>

      <AbandonTodayAction onConfirm={onAbandonToday} />
    </AtmosphereScreenShell>
  )
}
