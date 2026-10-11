import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useId } from 'react'
import styles from './TaskItem.module.css'

export interface TaskItemProps {
  title: string
  completed: boolean
  onToggle?: () => void
}

export function TaskItem({ title, completed, onToggle }: TaskItemProps) {
  const inputId = useId()

  return (
    <li className={styles.item}>
      <label className={styles.row} htmlFor={inputId}>
        <span className={styles.checkboxWrap}>
          <input
            id={inputId}
            type="checkbox"
            className={styles.checkbox}
            checked={completed}
            onChange={onToggle}
          />
          {/* checkmarkは純粋にdecorative。状態はnative checkboxのchecked属性が担う。 */}
          {completed ? (
            <Check className={styles.checkIcon} aria-hidden="true" size={14} strokeWidth={2.5} />
          ) : null}
        </span>
        <span className={clsx(styles.title, completed && styles.completedTitle)}>{title}</span>
      </label>
    </li>
  )
}
