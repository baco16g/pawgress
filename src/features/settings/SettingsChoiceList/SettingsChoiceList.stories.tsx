import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SettingsChoiceList, type SettingsChoiceOption } from './SettingsChoiceList'

function Demo({
  options,
  initialValue,
}: {
  options: SettingsChoiceOption<string>[]
  initialValue: string
}) {
  const [selected, setSelected] = useState(initialValue)
  return (
    <SettingsChoiceList
      label="選択肢"
      options={options}
      selectedValue={selected}
      onSelect={setSelected}
    />
  )
}

const THEME_OPTIONS: SettingsChoiceOption<string>[] = [
  { value: 'system', label: '端末設定' },
  { value: 'light', label: 'ライト' },
]

const MAX_TASKS_OPTIONS: SettingsChoiceOption<string>[] = [
  { value: '1', label: '1件' },
  { value: '2', label: '2件' },
  { value: '3', label: '3件' },
  { value: '4', label: '4件' },
  { value: '5', label: '5件' },
]

function PlaceholderIcon({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  )
}

const GRID_OPTIONS: SettingsChoiceOption<string>[] = [
  { value: 'dog', label: '犬', icon: <PlaceholderIcon color="#c98a4b" /> },
  { value: 'cat', label: '猫', icon: <PlaceholderIcon color="#b8973f" /> },
]

function GridDemo({
  options,
  initialValue,
}: {
  options: SettingsChoiceOption<string>[]
  initialValue: string
}) {
  const [selected, setSelected] = useState(initialValue)
  return (
    <SettingsChoiceList
      label="選択肢"
      layout="grid"
      options={options}
      selectedValue={selected}
      onSelect={setSelected}
    />
  )
}

const meta = {
  title: 'features/settings/SettingsChoiceList',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FewOptions: Story = {
  name: '1. FewOptions（2択、テーマの例）',
  render: () => <Demo options={THEME_OPTIONS} initialValue="system" />,
}

export const ManyOptions: Story = {
  name: '2. ManyOptions（5択、最大タスク量の例）',
  render: () => <Demo options={MAX_TASKS_OPTIONS} initialValue="3" />,
}

export const KeyboardFocus: Story = {
  name: '3. KeyboardFocus',
  render: () => <Demo options={THEME_OPTIONS} initialValue="system" />,
  play: ({ canvas }) => {
    canvas.getByRole('radio', { name: 'ライト' }).focus()
  },
}

export const GridLayout: Story = {
  name: '4. GridLayout（iconを主役にした2択picker、相棒の種別選択の例）',
  render: () => <GridDemo options={GRID_OPTIONS} initialValue="dog" />,
}
