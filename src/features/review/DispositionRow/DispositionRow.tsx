import clsx from 'clsx'
import { useId } from 'react'
import type { Disposition } from '@/domain/review/dailyReview'
import styles from './DispositionRow.module.css'

export interface DispositionRowProps {
  title: string
  disposition: Disposition | undefined
  onChange: (disposition: Disposition) => void
}

export function DispositionRow({ title, disposition, onChange }: DispositionRowProps) {
  const groupName = useId()

  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.title}>{title}</span>
        <fieldset className={styles.choiceGroup}>
          <legend className={styles.visuallyHidden}>{title}の扱い</legend>
          <label
            className={clsx(
              styles.choiceSegment,
              disposition === 'carryOver' && styles.choiceSegmentSelected,
            )}
          >
            <input
              type="radio"
              name={groupName}
              className={styles.choiceInput}
              checked={disposition === 'carryOver'}
              onChange={() => {
                onChange('carryOver')
              }}
            />
            明日に持ち越す
          </label>
          <label
            className={clsx(
              styles.choiceSegment,
              disposition === 'inbox' && styles.choiceSegmentSelected,
            )}
          >
            <input
              type="radio"
              name={groupName}
              className={styles.choiceInput}
              checked={disposition === 'inbox'}
              onChange={() => {
                onChange('inbox')
              }}
            />
            Inboxへ戻す
          </label>
        </fieldset>
      </div>
    </li>
  )
}
