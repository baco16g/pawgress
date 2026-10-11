import { Moon } from 'lucide-react'
import type { CompanionSpecies } from '@/features/companion/model/companion'
import { getCompanionAtmospherePreset } from '@/features/companion/model/companionAtmosphere'
import type { CompanionVariant } from '@/features/companion/model/companionAssets'
import { getCompanionVisualScale } from '@/features/companion/model/companionPresentation'
import { Companion } from '@/features/companion/ui/Companion/Companion'
import { CancelRestAction } from '@/features/today/TodayRestScreen/components/CancelRestAction'
import { AtmosphereScreenShell } from '@/features/companion/ui/AtmosphereScreenShell/AtmosphereScreenShell'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './TodayRestScreen.module.css'

export interface TodayRestScreenProps {
  todayLabel: string
  companionSpecies: CompanionSpecies
  companionVariant: CompanionVariant
  onCancelRest: () => void
  onOpenSettings: () => void
}

export function TodayRestScreen({
  todayLabel,
  companionSpecies,
  companionVariant,
  onCancelRest,
  onOpenSettings,
}: TodayRestScreenProps) {
  const atmospherePreset = getCompanionAtmospherePreset(companionVariant)
  const companionScale = getCompanionVisualScale(companionVariant)
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <AtmosphereScreenShell
      todayLabel={todayLabel}
      atmospherePreset={atmospherePreset}
      atmosphereModifier="peach"
      onOpenSettings={onOpenSettings}
      heading="今日はお休み"
      headingRef={headingRef}
      headingTabIndex={-1}
      afterHeading={
        <p className={styles.supportingText}>今日は、やることを決めなくて大丈夫です。</p>
      }
      companion={
        <Companion
          species={companionSpecies}
          variant={companionVariant}
          state="subdued"
          size={`calc(clamp(240px, 105vw, 420px) * ${String(companionScale)})`}
          framed={false}
        />
      }
      sheetContentClassName={styles.restSheetContent}
    >
      {/* iconはlabelと同じ情報を繰り返すだけのためaria-hidden。well/tokenは
          HistoryScreenのemptyIconWellと同じrecipeを再利用し、新しいtokenは
          追加しない。 */}
      <div className={styles.restStatus}>
        <span className={styles.restStatusIconWell} aria-hidden="true">
          <Moon className={styles.restStatusIcon} size={28} strokeWidth={1.75} />
        </span>
        <p className={styles.restStatusLabel}>お休みとして記録中</p>
      </div>
      <CancelRestAction onConfirm={onCancelRest} />
    </AtmosphereScreenShell>
  )
}
