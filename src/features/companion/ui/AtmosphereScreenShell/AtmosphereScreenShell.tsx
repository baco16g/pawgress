import clsx from 'clsx'
import { Settings } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { getCompanionAtmospherePreset } from '../../model/companionAtmosphere'
import { getCompanionVisualScale } from '../../model/companionPresentation'
import { AtmosphereWave } from '../AtmosphereWave/AtmosphereWave'
import { Companion, type CompanionProps } from '../Companion/Companion'
import styles from './AtmosphereScreenShell.module.css'

type AtmosphereCompanion = Pick<CompanionProps, 'species' | 'variant' | 'state' | 'variantLabel'>

export interface AtmosphereScreenShellProps {
  todayLabel: string
  companion: AtmosphereCompanion
  atmosphereModifier?: 'peach' | 'sage'
  onOpenSettings?: () => void
  reserveNavSpace?: boolean
  heading: ReactNode
  headingRef?: Ref<HTMLHeadingElement>
  headingTabIndex?: number
  afterHeading?: ReactNode
  afterCompanion?: ReactNode
  sheetContentClassName?: string
  children: ReactNode
}

export function AtmosphereScreenShell({
  todayLabel,
  companion,
  atmosphereModifier,
  onOpenSettings,
  reserveNavSpace = true,
  heading,
  headingRef,
  headingTabIndex,
  afterHeading,
  afterCompanion,
  sheetContentClassName,
  children,
}: AtmosphereScreenShellProps) {
  const atmospherePreset = getCompanionAtmospherePreset(companion.variant)
  const companionScale = getCompanionVisualScale(companion.variant)

  return (
    <main className={styles.page}>
      <div
        className={styles.atmosphereZone}
        data-atmosphere={atmospherePreset}
        data-atmosphere-modifier={atmosphereModifier}
      >
        <AtmosphereWave />

        <header className={styles.header}>
          <span className={styles.dateLabel}>{todayLabel}</span>
          {onOpenSettings ? (
            <button
              type="button"
              className={styles.settingsEntry}
              onClick={onOpenSettings}
              aria-label="設定"
            >
              <Settings aria-hidden="true" size={20} strokeWidth={1.75} />
            </button>
          ) : null}
        </header>

        <h1 ref={headingRef} className={styles.pageTitle} tabIndex={headingTabIndex}>
          {heading}
        </h1>
        {afterHeading}

        <div className={styles.companionWrap}>
          <Companion
            species={companion.species}
            variant={companion.variant}
            state={companion.state}
            size={`calc(clamp(240px, 105vw, 420px) * ${String(companionScale)})`}
            framed={false}
            variantLabel={companion.variantLabel}
          />
        </div>
        {afterCompanion}
      </div>

      <div className={clsx(styles.sheet, reserveNavSpace && styles.sheetReserveNav)}>
        <div className={clsx(styles.sheetContent, sheetContentClassName)}>{children}</div>
      </div>
    </main>
  )
}
