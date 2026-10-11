import clsx from 'clsx'
import { Settings } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import type { AtmospherePreset } from '../../model/companionAtmosphere'
import { AtmosphereWave } from '../AtmosphereWave/AtmosphereWave'
import styles from './AtmosphereScreenShell.module.css'

export interface AtmosphereScreenShellProps {
  todayLabel: string
  atmospherePreset: AtmospherePreset
  atmosphereModifier?: 'peach' | 'sage'
  onOpenSettings?: () => void
  reserveNavSpace?: boolean
  heading: ReactNode
  headingRef?: Ref<HTMLHeadingElement>
  headingTabIndex?: number
  afterHeading?: ReactNode
  companion: ReactNode
  afterCompanion?: ReactNode
  sheetContentClassName?: string
  children: ReactNode
}

export function AtmosphereScreenShell({
  todayLabel,
  atmospherePreset,
  atmosphereModifier,
  onOpenSettings,
  reserveNavSpace = true,
  heading,
  headingRef,
  headingTabIndex,
  afterHeading,
  companion,
  afterCompanion,
  sheetContentClassName,
  children,
}: AtmosphereScreenShellProps) {
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

        <div className={styles.companionWrap}>{companion}</div>
        {afterCompanion}
      </div>

      <div className={clsx(styles.sheet, reserveNavSpace && styles.sheetReserveNav)}>
        <div className={clsx(styles.sheetContent, sheetContentClassName)}>{children}</div>
      </div>
    </main>
  )
}
