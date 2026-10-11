import clsx from 'clsx'
import type { CSSProperties } from 'react'
import type { CompanionSpecies, CompanionState } from '../../model/companion'
import {
  getSpriteSheetUrl,
  getStateFrameConfig,
  type CompanionVariant,
} from '../../model/companionAssets'
import styles from './Companion.module.css'

type StageStyle = CSSProperties & { '--companion-size': string }

export interface CompanionProps {
  species: CompanionSpecies
  variant: CompanionVariant
  state: CompanionState
  size?: number | string
  framed?: boolean
  variantLabel?: string
}

const SPECIES_LABEL: Record<CompanionSpecies, string> = { dog: '犬', cat: '猫' }

const ANIMATION_CLASS_NAMES: Partial<Record<CompanionState, Record<CompanionSpecies, string>>> = {
  idle: { dog: 'looping', cat: 'looping' },
  pleased: { dog: 'settlePleasedDog', cat: 'settlePleasedCat' },
  completed: { dog: 'settleCompletedDog', cat: 'settleCompletedCat' },
  subdued: { dog: 'settleSubduedDog', cat: 'settleSubduedCat' },
}

const STATE_LABEL: Record<CompanionState, string> = {
  idle: 'くつろいでいます',
  pleased: 'うれしそうです',
  completed: 'タスクの達成をよろこんでいます',
  review: '落ち着いて振り返りに付き合っています',
  sleepy: '眠そうにしています',
  subdued: '静かに過ごしています',
}

export function Companion({
  species,
  variant,
  state,
  size = 112,
  framed = true,
  variantLabel,
}: CompanionProps) {
  const { file, frameCount, frameIndex } = getStateFrameConfig(state)
  const count = frameCount[species]
  const frame = frameIndex[species]
  const spriteUrl = getSpriteSheetUrl(species, variant, file)

  const label = variantLabel
    ? `相棒(${SPECIES_LABEL[species]}・${variantLabel})。${STATE_LABEL[state]}。`
    : `相棒(${SPECIES_LABEL[species]})。${STATE_LABEL[state]}。`
  const reactive = state === 'pleased' || state === 'completed'
  const animationClassName = count > 1 ? ANIMATION_CLASS_NAMES[state]?.[species] : undefined
  const sizeValue = typeof size === 'number' ? `${String(size)}px` : size

  return (
    <div
      className={clsx(styles.stage, !framed && styles.transparent)}
      style={{ '--companion-size': sizeValue } as StageStyle}
      role="img"
      aria-label={label}
    >
      <div
        key={`${species}-${variant}-${state}`}
        className={clsx(
          styles.sprite,
          animationClassName && styles[animationClassName],
          reactive && styles.reacts,
        )}
        aria-hidden="true"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: `calc(${String(count)} * var(--companion-size)) var(--companion-size)`,
          backgroundPositionX: `calc(${String(-frame)} * var(--companion-size))`,
          ...(animationClassName ? { '--sprite-frame-count': String(count) } : {}),
        }}
      />
    </div>
  )
}
