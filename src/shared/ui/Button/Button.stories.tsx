import type { Meta, StoryObj } from '@storybook/react-vite'
import { RootOverride } from '@/testing/RootOverride'
import { Button } from './Button'

const meta = {
  title: 'shared/ui/Button',
  component: Button,
  args: {
    children: '今日をはじめる',
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'tertiary', 'danger'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'キャンセル' },
}

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: '今日を振り返る' },
}

export const Danger: Story = {
  args: { variant: 'danger', children: '削除' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const LongLabel: Story = {
  args: {
    children: '今日の予定をすべて確認してから、明日の準備を始める',
  },
  globals: { viewport: { value: '320-568' } },
}

export const KeyboardFocused: Story = {
  name: 'キーボードフォーカス（Lifecycle Primary, ink背景）',
  play: async ({ canvas }) => {
    // ink背景のfillに対し、focus ringがoutline-offsetで外側へ表示されることを確認する。
    const button = await canvas.findByRole('button')
    button.focus()
  },
}

export const ExtraLargeText: Story = {
  decorators: [
    (Story) => (
      <RootOverride cssVars={{ '--font-scale': '1.25' }}>
        <Story />
      </RootOverride>
    ),
  ],
}
