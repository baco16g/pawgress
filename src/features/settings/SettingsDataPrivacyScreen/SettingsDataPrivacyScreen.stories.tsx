import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { SettingsDataPrivacyScreen } from './SettingsDataPrivacyScreen'

const meta = {
  title: 'features/settings/SettingsDataPrivacyScreen',
  component: SettingsDataPrivacyScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    onResetSettings: fn(),
  },
} satisfies Meta<typeof SettingsDataPrivacyScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '1. Default',
}

export const ResetButtonFocus: Story = {
  name: '2. ResetButtonFocus（keyboard focus）',
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: '設定を初期値に戻す' }).focus()
  },
}

export const ResetButtonClicked: Story = {
  name: '3. ResetButtonClicked（onResetSettingsが呼ばれる）',
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '設定を初期値に戻す' }))
    await expect(args.onResetSettings).toHaveBeenCalledTimes(1)
  },
}
