import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'
import { RootOverride } from '@/testing/RootOverride'
import { SettingsScreen } from './SettingsScreen'

// 実装済みの設定のみを持つproduction screen。不要なvisual permutationは作らない。

const meta = {
  title: 'features/settings/SettingsScreen',
  component: SettingsScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    textSizeValueLabel: '標準',
    themeValueLabel: '端末設定',
    motionValueLabel: '端末設定',
    companionValueLabel: '犬',
    maxTodayTasksValueLabel: '3件',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof SettingsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '1. Default',
}

export const RowFocus: Story = {
  name: '2. RowFocus（keyboard focus、文字サイズ行）',
  play: ({ canvas }) => {
    canvas.getByRole('link', { name: '文字サイズ 標準' }).focus()
  },
}

export const ExtraLargeText: Story = {
  name: '3. ExtraLargeText（--font-scale 1.3、文字サイズ「特大」相当）',
  args: { textSizeValueLabel: '特大' },
  decorators: [
    (Story) => (
      <RootOverride cssVars={{ '--font-scale': '1.3' }}>
        <Story />
      </RootOverride>
    ),
  ],
}
