import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './SettingsChoiceList.module.css'

export interface SettingsChoiceOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

export interface SettingsChoiceListProps<T extends string> {
  label: string
  options: SettingsChoiceOption<T>[]
  selectedValue: T
  onSelect: (value: T) => void
  layout?: 'list' | 'grid'
}

export function SettingsChoiceList<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  layout = 'list',
}: SettingsChoiceListProps<T>) {
  // role="radiogroup"はul自体のlist roleと衝突するため（axe `listitem`ルール）、
  // ul/liではなく意味を持たないdivでmarkupする。
  return (
    <div
      className={layout === 'grid' ? styles.grid : styles.list}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((option) => {
        const selected = option.value === selectedValue
        const content = (
          <>
            {option.icon}
            <span className={styles.label}>{option.label}</span>
            {selected ? (
              <Check aria-hidden="true" className={styles.checkIcon} size={18} strokeWidth={2.5} />
            ) : null}
          </>
        )
        if (layout === 'grid') {
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={styles.gridCell}
              onClick={() => {
                onSelect(option.value)
              }}
            >
              {content}
            </button>
          )
        }
        return (
          <div key={option.value} className={styles.item}>
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              className={styles.row}
              onClick={() => {
                onSelect(option.value)
              }}
            >
              {content}
            </button>
          </div>
        )
      })}
    </div>
  )
}
