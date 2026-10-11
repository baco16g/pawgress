import type { Meta, StoryObj } from '@storybook/react-vite'
import styles from './DesignTokens.module.css'

const COLOR_TOKEN_NAMES = [
  '--color-canvas',
  '--color-surface',
  '--color-surface-subtle',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-border',
  '--color-border-strong',
  '--color-accent',
  '--color-action-lifecycle-bg',
  '--color-action-lifecycle-fg',
  '--color-action-accent-bg',
  '--color-nav-active',
  '--color-focus',
  '--color-complete',
  '--color-danger',
] as const

const SPACE_TOKEN_NAMES = [
  '--space-4',
  '--space-8',
  '--space-12',
  '--space-16',
  '--space-24',
  '--space-32',
  '--space-48',
] as const

const RADIUS_TOKEN_NAMES = ['--radius-control', '--radius-surface', '--radius-floating'] as const

const TYPE_ROLE_NAMES = [
  'page-title',
  'section-heading',
  'task-title',
  'body',
  'meta',
  'nav',
  'control',
  'input',
] as const

const DURATION_TOKEN_NAMES = ['--duration-fast', '--duration-normal'] as const

const TOUCH_TARGET_TOKEN_NAMES = ['--touch-target-min', '--touch-target-preferred'] as const

function readRootTokenValues<Name extends string>(names: readonly Name[]): Record<Name, string> {
  const computed = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    names.map((name) => [name, computed.getPropertyValue(name).trim()]),
  ) as Record<Name, string>
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className={styles.colorSwatch}>
      <div className={styles.colorBox} style={{ backgroundColor: value || 'transparent' }} />
      <div>
        <p className={styles.swatchLabel}>{name}</p>
        <p className={styles.swatchValue}>{value || '(未取得)'}</p>
      </div>
    </div>
  )
}

function DesignTokensPage() {
  const colors = readRootTokenValues(COLOR_TOKEN_NAMES)
  const spaces = readRootTokenValues(SPACE_TOKEN_NAMES)
  const radii = readRootTokenValues(RADIUS_TOKEN_NAMES)
  const durations = readRootTokenValues(DURATION_TOKEN_NAMES)
  const touchTargets = readRootTokenValues(TOUCH_TARGET_TOKEN_NAMES)
  const typeTokenNames = TYPE_ROLE_NAMES.flatMap(
    (role) =>
      [`--type-${role}-size`, `--type-${role}-weight`, `--type-${role}-line-height`] as const,
  )
  const typeValues = readRootTokenValues(typeTokenNames)

  return (
    <div className={styles.page}>
      <section>
        <h2 className={styles.sectionTitle}>1. 色（semantic role）</h2>
        <div className={styles.swatchGrid}>
          {COLOR_TOKEN_NAMES.map((name) => (
            <ColorSwatch key={name} name={name} value={colors[name]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>2. タイポグラフィ role</h2>
        <div className={styles.typeScale}>
          {TYPE_ROLE_NAMES.map((role) => {
            const size = typeValues[`--type-${role}-size`]
            const weight = typeValues[`--type-${role}-weight`]
            const lineHeight = typeValues[`--type-${role}-line-height`]
            return (
              <div key={role} className={styles.typeRow}>
                <span className={styles.swatchLabel}>
                  {role} ({size} / {weight} / {lineHeight})
                </span>
                <span style={{ fontSize: size, fontWeight: weight, lineHeight }}>
                  今日のタスクを確認する
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>3. 余白スケール</h2>
        <div className={styles.spaceRows}>
          {SPACE_TOKEN_NAMES.map((name) => (
            <div key={name} className={styles.spaceRow}>
              <span className={styles.swatchLabel}>
                {name} ({spaces[name] || '—'})
              </span>
              <span className={styles.spaceBar} style={{ width: spaces[name] || 0 }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>4. 角丸（role-based）</h2>
        <div className={styles.swatchGrid}>
          {RADIUS_TOKEN_NAMES.map((name) => (
            <div key={name} className={styles.radiusSwatch}>
              <div className={styles.radiusBox} style={{ borderRadius: radii[name] || 0 }} />
              <p className={styles.swatchLabel}>
                {name} ({radii[name] || '—'})
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>5. モーション</h2>
        <p className={styles.note}>
          {DURATION_TOKEN_NAMES.map((name) => `${name}: ${durations[name] || '—'}`).join(' / ')}
          。ホバーで実際のduration/easingを確認できる。
        </p>
        <div
          className={styles.motionSwatch}
          style={{ transitionDuration: durations['--duration-normal'] || undefined }}
        />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>6. タッチターゲット</h2>
        <div className={styles.swatchGrid}>
          {TOUCH_TARGET_TOKEN_NAMES.map((name) => (
            <div key={name} className={styles.radiusSwatch}>
              <div
                className={styles.touchBox}
                style={{ width: touchTargets[name] || 0, height: touchTargets[name] || 0 }}
              />
              <p className={styles.swatchLabel}>
                {name} ({touchTargets[name] || '—'})
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'app/styles/DesignTokens',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Tokens: Story = {
  render: () => <DesignTokensPage />,
}
