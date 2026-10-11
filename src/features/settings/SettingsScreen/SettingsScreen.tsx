import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useFocusOnMount } from '@/shared/hooks/useFocusOnMount'
import styles from './SettingsScreen.module.css'

export interface SettingsScreenProps {
  textSizeValueLabel: string
  themeValueLabel: string
  motionValueLabel: string
  companionValueLabel: string
  maxTodayTasksValueLabel: string
}

function SettingsSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeading}>{heading}</h2>
      <ul className={styles.list}>{children}</ul>
    </section>
  )
}

function SettingsRow({ to, label, value }: { to: string; label: string; value?: string }) {
  return (
    <li className={styles.item}>
      <Link to={to} className={styles.row}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>
          {value ? <span>{value}</span> : null}
          <ChevronRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </span>
      </Link>
    </li>
  )
}

export function SettingsScreen({
  textSizeValueLabel,
  themeValueLabel,
  motionValueLabel,
  companionValueLabel,
  maxTodayTasksValueLabel,
}: SettingsScreenProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <main className={styles.page}>
      <h1 ref={headingRef} className={styles.title} tabIndex={-1}>
        設定
      </h1>

      <SettingsSection heading="表示とアクセシビリティ">
        <SettingsRow to="/settings/text-size" label="文字サイズ" value={textSizeValueLabel} />
        <SettingsRow to="/settings/theme" label="テーマ" value={themeValueLabel} />
        <SettingsRow to="/settings/motion" label="アニメーション" value={motionValueLabel} />
      </SettingsSection>

      <SettingsSection heading="相棒">
        <SettingsRow to="/settings/companion" label="相棒" value={companionValueLabel} />
      </SettingsSection>

      <SettingsSection heading="Today">
        <SettingsRow
          to="/settings/max-tasks"
          label="1日の最大タスク量"
          value={maxTodayTasksValueLabel}
        />
      </SettingsSection>

      <SettingsSection heading="その他">
        <SettingsRow to="/settings/data-privacy" label="データとプライバシー" />
        <SettingsRow to="/settings/licenses" label="ライセンス・クレジット" />
      </SettingsSection>
    </main>
  )
}
