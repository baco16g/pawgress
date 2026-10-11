import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import styles from './Toast.module.css'

const DISPLAY_DURATION_MS = 4000

export interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const elementRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, DISPLAY_DURATION_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  // ReactのonAnimationEndはjsdom上では発火しないため、addEventListenerで直接検知する。
  useEffect(() => {
    if (!isExiting) return
    const element = elementRef.current
    if (!element) return
    element.addEventListener('animationend', onDismiss)
    return () => {
      element.removeEventListener('animationend', onDismiss)
    }
  }, [isExiting, onDismiss])

  return (
    <p
      ref={elementRef}
      className={clsx(styles.toast, isExiting && styles.toastExiting)}
      role="status"
    >
      {message}
    </p>
  )
}
