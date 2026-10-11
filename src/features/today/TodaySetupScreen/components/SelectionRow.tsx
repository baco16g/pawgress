import clsx from 'clsx'
import { Check } from 'lucide-react'
import { useId } from 'react'
import styles from './SelectionRow.module.css'

export interface SelectionRowProps {
  title: string
  selected: boolean
  disabled?: boolean
  describedBy?: string
  onToggle: () => void
}

export function SelectionRow({
  title,
  selected,
  disabled = false,
  describedBy,
  onToggle,
}: SelectionRowProps) {
  const inputId = useId()

  return (
    <li className={styles.item}>
      <label className={clsx(styles.row, disabled && styles.rowDisabled)} htmlFor={inputId}>
        <span className={styles.checkboxWrap}>
          <input
            id={inputId}
            type="checkbox"
            className={styles.checkbox}
            checked={selected}
            disabled={disabled}
            aria-describedby={describedBy}
            onChange={onToggle}
          />
          {selected ? (
            <Check className={styles.checkIcon} aria-hidden="true" size={14} strokeWidth={2.5} />
          ) : null}
        </span>
        <span className={styles.title}>{title}</span>
      </label>
    </li>
  )
}
