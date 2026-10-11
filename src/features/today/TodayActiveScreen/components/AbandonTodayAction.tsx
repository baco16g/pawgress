import { InlineConfirmAction } from '@/shared/ui/InlineConfirmAction/InlineConfirmAction'
import styles from './AbandonTodayAction.module.css'

export interface AbandonTodayActionProps {
  onConfirm: () => void
}

export function AbandonTodayAction({ onConfirm }: AbandonTodayActionProps) {
  return (
    <InlineConfirmAction
      triggerLabel="今日をやめる"
      triggerClassName={styles.trigger}
      confirmPrompt="今日のタスクをやめてInboxへ戻しますか？"
      confirmLabel="やめる"
      cancelLabel="続ける"
      confirmGroupAriaLabel="今日をやめる確認"
      onConfirm={onConfirm}
    />
  )
}
