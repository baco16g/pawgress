import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Settings } from 'lucide-react'
import { InlineAddRow } from '@/shared/ui/InlineAddRow/InlineAddRow'
import todayStyles from '@/features/today/TodayActiveScreen/TodayActiveScreen.module.css'
import { Button } from '@/shared/ui/Button/Button'
import styles from './ActionOverview.module.css'

// design reference用の一覧fixture。production componentを複製せず、
// 実際のButton / Persistent Inline InputとSettings用CSSを再利用して並べる。
function ActionOverviewPage() {
  return (
    <div className={styles.grid}>
      <div className={styles.cell}>
        <p className={styles.label}>Primary</p>
        <Button variant="primary">今日をはじめる</Button>
        <p className={styles.usage}>Today Setup / Reviewのlifecycle transition専用</p>
      </div>

      <div className={styles.cell}>
        <p className={styles.label}>Secondary</p>
        <Button variant="secondary">もう一度試す</Button>
        <p className={styles.usage}>Primaryほど強くないが明確なbutton</p>
      </div>

      <div className={styles.cell}>
        <p className={styles.label}>Tertiary</p>
        <Button variant="tertiary">
          今日を振り返る
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Button>
        <p className={styles.usage}>Today Activeの「今日を振り返る」</p>
      </div>

      <div className={styles.cell}>
        <p className={styles.label}>Icon Button</p>
        <button type="button" className={todayStyles.settingsEntry} aria-label="設定">
          <Settings aria-hidden="true" size={20} strokeWidth={1.75} />
        </button>
        <p className={styles.usage}>Settings icon-only entry</p>
      </div>

      <div className={styles.cell}>
        <p className={styles.label}>Persistent Inline Input</p>
        <InlineAddRow onSave={() => undefined} />
        <p className={styles.usage}>常時入力欄。入力時のみtrailing「追加」を表示</p>
      </div>
    </div>
  )
}

const meta = {
  title: 'app/styles/ActionOverview',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ActionOverview: Story = {
  render: () => <ActionOverviewPage />,
}
