import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/Button/Button'
import styles from './InlineConfirmAction.module.css'

export interface InlineConfirmActionProps {
  triggerLabel: string
  confirmPrompt: string
  confirmLabel: string
  cancelLabel: string
  confirmGroupAriaLabel: string
  onConfirm: () => void
  triggerClassName?: string
}

export function InlineConfirmAction({
  triggerLabel,
  confirmPrompt,
  confirmLabel,
  cancelLabel,
  confirmGroupAriaLabel,
  onConfirm,
  triggerClassName,
}: InlineConfirmActionProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const promptRef = useRef<HTMLParagraphElement>(null)
  const shouldRefocusTriggerRef = useRef(false)

  useEffect(() => {
    if (isConfirming) {
      promptRef.current?.focus()
    } else if (shouldRefocusTriggerRef.current) {
      shouldRefocusTriggerRef.current = false
      triggerRef.current?.focus()
    }
  }, [isConfirming])

  const handleCancel = () => {
    shouldRefocusTriggerRef.current = true
    setIsConfirming(false)
  }

  if (isConfirming) {
    return (
      <div className={styles.confirmRow} role="group" aria-label={confirmGroupAriaLabel}>
        <p ref={promptRef} className={styles.confirmText} tabIndex={-1}>
          {confirmPrompt}
        </p>
        <div className={styles.confirmActions}>
          <button type="button" className={styles.confirmSegment} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className={styles.confirmSegment} onClick={handleCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Button
      ref={triggerRef}
      variant="tertiary"
      className={clsx(styles.trigger, triggerClassName)}
      onClick={() => {
        setIsConfirming(true)
      }}
    >
      {triggerLabel}
    </Button>
  )
}
