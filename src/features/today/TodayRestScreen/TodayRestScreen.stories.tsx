import type { Meta, StoryObj } from '@storybook/react-vite'
import { TodayRestScreen } from './TodayRestScreen'

// REST は第一級のToday state。不要なvisual permutationは作らない。

const meta = {
  title: 'features/today/TodayRestScreen',
  component: TodayRestScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    todayLabel: '10/4',
    companionSpecies: 'dog' as const,
    companionVariant: 'golden-retriever' as const,
    onCancelRest: () => undefined,
    onOpenSettings: () => undefined,
  },
} satisfies Meta<typeof TodayRestScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: '1. Default（REST確定直後の状態）',
}

export const CancelActionFocus: Story = {
  name: '2. CancelActionFocus（keyboard focus）',
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'お休みを取り消す' }).focus()
  },
}

export const ButterAtmosphere: Story = {
  name: '3. ButterAtmosphere（companion毛色違い、Setupと同じpreset選定）',
  args: { companionVariant: 'schnauzer' },
}

export const Viewport390: Story = {
  name: '4. Viewport390',
  globals: { viewport: { value: '390-844' } },
}

export const Viewport320: Story = {
  name: '5. Viewport320',
  globals: { viewport: { value: '320-568' } },
}
