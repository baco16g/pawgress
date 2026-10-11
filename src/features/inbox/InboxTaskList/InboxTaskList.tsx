import clsx from 'clsx'
import { Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Task } from '@/domain/task/task'
import styles from './InboxTaskList.module.css'

export interface InboxTaskListProps {
  tasks: Task[]
  onDeleteTask: (id: string) => void
}

export function InboxTaskList({ tasks, onDeleteTask }: InboxTaskListProps) {
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(new Set())
  const itemRefs = useRef(new Map<string, HTMLLIElement>())

  const handleDeleteClick = (id: string) => {
    const element = itemRefs.current.get(id)
    if (element) {
      // 明示的なpx heightを先に確定させる（autoから直接0へtransitionできないため）。
      element.style.height = `${String(element.getBoundingClientRect().height)}px`
    }
    // 1回のrequestAnimationFrameだと直前のheightがまだpaintされておらず、
    // 変更が同一frameにまとめられてtransitionが発生しない場合がある。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLeavingIds((current) => new Set(current).add(id))
      })
    })
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => {
        const leaving = leavingIds.has(task.id)
        return (
          <li
            key={task.id}
            ref={(element) => {
              if (element) itemRefs.current.set(task.id, element)
              else itemRefs.current.delete(task.id)
            }}
            className={clsx(styles.item, leaving && styles.itemLeaving)}
            onTransitionEnd={(event) => {
              if (leaving && event.propertyName === 'height') {
                onDeleteTask(task.id)
              }
            }}
          >
            <div className={styles.row}>
              <span className={styles.title}>{task.title}</span>
              <button
                type="button"
                className={styles.deleteButton}
                aria-label={`${task.title}を削除`}
                disabled={leaving}
                onClick={() => {
                  handleDeleteClick(task.id)
                }}
              >
                <Trash2 aria-hidden="true" size={18} strokeWidth={1.75} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
