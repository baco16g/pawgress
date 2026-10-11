import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { useId, useRef, useState, type SubmitEvent, type KeyboardEvent } from 'react'
import styles from './InlineAddRow.module.css'

export interface InlineAddRowProps {
  onSave: (title: string) => void
  disabled?: boolean
  describedById?: string
}

export function InlineAddRow({ onSave, disabled = false, describedById }: InlineAddRowProps) {
  const [value, setValue] = useState('')
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const isComposing = useRef(false)
  const trimmed = value.trim()

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (disabled || trimmed === '') return
    onSave(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Safariの変換確定Enter（isComposing=false / keyCode=229）も除外する。
    const isImeConfirmation = (event.nativeEvent as { keyCode: number }).keyCode === 229
    if (isComposing.current || event.nativeEvent.isComposing || isImeConfirmation) {
      if (event.key === 'Enter') event.preventDefault()
      return
    }
    if (event.key === 'Escape') {
      event.currentTarget.blur()
    }
  }

  return (
    <form className={clsx(styles.row, disabled && styles.rowDisabled)} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className={styles.entry}>
        <Plus aria-hidden="true" size={18} strokeWidth={1.75} className={styles.icon} />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          aria-describedby={describedById}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposing.current = true
          }}
          onCompositionEnd={() => {
            isComposing.current = false
          }}
          enterKeyHint="enter"
          placeholder="タスクを追加"
          aria-label="タスクを追加"
          className={styles.input}
        />
      </label>
      {!disabled && trimmed !== '' && (
        <button
          type="submit"
          className={styles.submitAction}
          onPointerDown={(event) => {
            if (event.button === 0 && document.activeElement === inputRef.current) {
              event.preventDefault()
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.currentTarget.blur()
          }}
        >
          追加
        </button>
      )}
    </form>
  )
}
