import { SelectionRow } from '@/features/today/TodaySetupScreen/components/SelectionRow'
import type { Task } from '@/domain/task/task'
import styles from './SelectionList.module.css'

export interface SelectionListProps {
  candidates: Task[]
  selectedIds: ReadonlySet<string>
  isMaxReached: boolean
  limitHintId: string
  onToggle: (id: string) => void
}

export function SelectionList({
  candidates,
  selectedIds,
  isMaxReached,
  limitHintId,
  onToggle,
}: SelectionListProps) {
  return (
    <ul className={styles.list}>
      {candidates.map((task) => {
        const selected = selectedIds.has(task.id)
        const disabled = !selected && isMaxReached
        return (
          <SelectionRow
            key={task.id}
            title={task.title}
            selected={selected}
            disabled={disabled}
            describedBy={disabled ? limitHintId : undefined}
            onToggle={() => {
              onToggle(task.id)
            }}
          />
        )
      })}
    </ul>
  )
}
