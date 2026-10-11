import { Inbox as InboxIcon } from 'lucide-react'
import { useId } from 'react'
import type { AtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import { AtmosphereWave } from '@/features/companion/ui/AtmosphereWave/AtmosphereWave'
import { InboxTaskList } from '@/features/inbox/InboxTaskList/InboxTaskList'
import { InlineAddRow } from '@/shared/ui/InlineAddRow/InlineAddRow'
import { INBOX_CAPACITY_MESSAGE } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import type { Task } from '@/domain/task/task'
import styles from './InboxScreen.module.css'

export interface InboxScreenProps {
  tasks: Task[]
  onAddTask: (title: string) => void
  onDeleteTask: (id: string) => void
  canCapture: boolean
  atmospherePreset?: AtmospherePreset
}

export function InboxScreen({
  tasks,
  onAddTask,
  onDeleteTask,
  canCapture,
  atmospherePreset = 'powder-blue',
}: InboxScreenProps) {
  const capacityMessageId = useId()

  return (
    <main className={styles.page}>
      <header className={styles.header} data-atmosphere={atmospherePreset}>
        <h1 className={styles.pageTitle}>Inbox</h1>
        <p className={styles.supportingText}>あとでやるタスクを置いておけます。</p>
        <AtmosphereWave compact />
      </header>

      <div className={styles.sheet}>
        <div className={styles.sheetContent}>
          <InlineAddRow
            onSave={onAddTask}
            disabled={!canCapture}
            describedById={canCapture ? undefined : capacityMessageId}
          />
          {!canCapture ? (
            <p id={capacityMessageId} className={styles.capacityMessage} role="status">
              {INBOX_CAPACITY_MESSAGE}
            </p>
          ) : null}

          {tasks.length > 0 ? (
            <InboxTaskList tasks={tasks} onDeleteTask={onDeleteTask} />
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIconWell} aria-hidden="true">
                <InboxIcon size={28} strokeWidth={1.75} className={styles.emptyIcon} />
              </span>
              <p className={styles.emptyHeading}>Inboxは空です</p>
              <p className={styles.emptyText}>やることを思いついたら、上から追加できます。</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
