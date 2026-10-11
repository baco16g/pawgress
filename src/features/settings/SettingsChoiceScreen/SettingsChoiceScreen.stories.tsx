import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SettingsChoiceScreen } from './SettingsChoiceScreen'

// 文字サイズ/テーマ/アニメーション/相棒/1日の最大タスク量、共通のdrill-down
// 選択screen。代表例として「テーマ」を使う（1つの代表例で十分なため）。

function ThemeChoiceDemo() {
  const [selected, setSelected] = useState('system')
  return (
    <SettingsChoiceScreen
      title="テーマ"
      selectedValue={selected}
      options={[
        { value: 'system', label: '端末設定' },
        { value: 'light', label: 'ライト' },
      ]}
      onSelect={setSelected}
    />
  )
}

const meta = {
  title: 'features/settings/SettingsChoiceScreen',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ThemeChoice: Story = {
  name: '1. Default（テーマ選択の例）',
  render: () => <ThemeChoiceDemo />,
}
