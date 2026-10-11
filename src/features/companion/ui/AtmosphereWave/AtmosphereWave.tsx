import clsx from 'clsx'
import styles from './AtmosphereWave.module.css'

export interface AtmosphereWaveProps {
  compact?: boolean
}

export function AtmosphereWave({ compact = false }: AtmosphereWaveProps = {}) {
  return (
    <svg
      className={clsx(styles.wave, compact && styles.compact)}
      viewBox="0 0 400 110"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className={styles.waveBack} d="M0,55 C100,20 300,22 400,48 L400,110 L0,110 Z" />
      <path className={styles.waveFront} d="M0,70 C130,100 270,35 400,60 L400,110 L0,110 Z" />
    </svg>
  )
}
