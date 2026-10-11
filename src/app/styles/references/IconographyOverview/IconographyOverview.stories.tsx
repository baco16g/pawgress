import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Check, Ellipsis, Inbox, Moon, PawPrint, Plus, Settings } from 'lucide-react'
import styles from './IconographyOverview.module.css'

// design reference用の一覧fixture。production UIの抽象化ではない。
// Pawgressで実際に使用しているsize/stroke-widthの組み合わせを一覧表示し、
// iconographyの統一感を確認する。
interface IconEntry {
  name: string
  Icon: typeof Settings
  size: number
  strokeWidth: number
  usage: string
}

const ICONS: readonly IconEntry[] = [
  {
    name: 'Settings',
    Icon: Settings,
    size: 20,
    strokeWidth: 1.75,
    usage: 'header / settings entry',
  },
  { name: 'PawPrint', Icon: PawPrint, size: 20, strokeWidth: 1.75, usage: 'bottom nav: 今日' },
  { name: 'Inbox', Icon: Inbox, size: 20, strokeWidth: 1.75, usage: 'bottom nav: Inbox' },
  { name: 'Plus', Icon: Plus, size: 18, strokeWidth: 1.75, usage: '常時タスク入力欄のPlus' },
  {
    name: 'ArrowRight',
    Icon: ArrowRight,
    size: 18,
    strokeWidth: 1.75,
    usage: 'Review CTA（Inline Addは文字の「追加」）',
  },
  { name: 'Check', Icon: Check, size: 14, strokeWidth: 2.5, usage: 'checkbox checked overlay' },
  {
    name: 'Moon',
    Icon: Moon,
    size: 28,
    strokeWidth: 1.75,
    usage: 'TodayRestScreen: REST status icon well',
  },
  {
    name: 'Ellipsis',
    Icon: Ellipsis,
    size: 18,
    strokeWidth: 1.75,
    usage: '(未使用、将来のtask overflow候補)',
  },
]

function IconographyOverviewPage() {
  return (
    <div className={styles.grid}>
      {ICONS.map(({ name, Icon, size, strokeWidth, usage }) => (
        <div key={name} className={styles.cell}>
          <div className={styles.iconBox}>
            <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />
          </div>
          <p className={styles.name}>{name}</p>
          <p className={styles.meta}>
            {size}px / stroke {strokeWidth}
          </p>
          <p className={styles.usage}>{usage}</p>
        </div>
      ))}
    </div>
  )
}

const meta = {
  title: 'app/styles/IconographyOverview',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const IconographyOverview: Story = {
  render: () => <IconographyOverviewPage />,
}
