import { Button } from '@/shared/ui/Button/Button'

export interface CancelRestActionProps {
  onConfirm: () => void
}

export function CancelRestAction({ onConfirm }: CancelRestActionProps) {
  return (
    <Button variant="tertiary" onClick={onConfirm}>
      お休みを取り消す
    </Button>
  )
}
