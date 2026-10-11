import type { Meta, StoryObj } from '@storybook/react-vite'
import { SettingsLicensesScreen } from './SettingsLicensesScreen'

const meta = {
  title: 'features/settings/SettingsLicensesScreen',
  component: SettingsLicensesScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SettingsLicensesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
