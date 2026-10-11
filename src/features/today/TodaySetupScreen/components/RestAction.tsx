import { InlineConfirmAction } from '@/shared/ui/InlineConfirmAction/InlineConfirmAction'
import styles from './RestAction.module.css'

export interface RestActionProps {
  onConfirm: () => void
}

export function RestAction({ onConfirm }: RestActionProps) {
  return (
    <InlineConfirmAction
      triggerLabel="今日は休む"
      triggerClassName={styles.trigger}
      confirmPrompt="今日をお休みにしますか？"
      confirmLabel="休む"
      cancelLabel="やめる"
      confirmGroupAriaLabel="今日をお休みにする確認"
      onConfirm={onConfirm}
    />
  )
}
