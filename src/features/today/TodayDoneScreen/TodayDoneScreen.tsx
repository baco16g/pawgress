import { Check } from 'lucide-react'
import type { CompanionSpecies } from '@/features/companion/model/companion'
import type { CompanionVariant } from '@/features/companion/model/companionAssets'
import { Button } from '@/shared/ui/Button/Button'
import { AtmosphereScreenShell } from '@/features/companion/ui/AtmosphereScreenShell/AtmosphereScreenShell'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './TodayDoneScreen.module.css'

export interface TodayDoneScreenProps {
  todayLabel: string
  companionSpecies: CompanionSpecies
  companionVariant: CompanionVariant
  onCancelReview: () => void
  onOpenSettings: () => void
}

export function TodayDoneScreen({
  todayLabel,
  companionSpecies,
  companionVariant,
  onCancelReview,
  onOpenSettings,
}: TodayDoneScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <AtmosphereScreenShell
      todayLabel={todayLabel}
      companion={{ species: companionSpecies, variant: companionVariant, state: 'completed' }}
      atmosphereModifier="sage"
      onOpenSettings={onOpenSettings}
      heading="今日はここまで"
      headingRef={headingRef}
      headingTabIndex={-1}
      afterHeading={<p className={styles.supportingText}>また明日、新しい今日をはじめましょう。</p>}
      sheetContentClassName={styles.doneSheetContent}
    >
      <div className={styles.doneStatus}>
        <span className={styles.doneStatusIconWell} aria-hidden="true">
          <Check className={styles.doneStatusIcon} size={28} strokeWidth={1.75} />
        </span>
        <p className={styles.doneStatusLabel}>今日の記録として保存済み</p>
      </div>
      <Button variant="tertiary" onClick={onCancelReview}>
        今日の完了を取り消す
      </Button>
    </AtmosphereScreenShell>
  )
}
