import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { AtmosphereWave } from './AtmosphereWave'

function Frame({
  atmosphere,
  children,
}: {
  atmosphere: 'powder-blue' | 'butter'
  children: ReactNode
}) {
  return (
    <div
      data-atmosphere={atmosphere}
      style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'features/companion/AtmosphereWave',
  component: AtmosphereWave,
  render: (args) => (
    <Frame atmosphere="powder-blue">
      <AtmosphereWave {...args} />
    </Frame>
  ),
} satisfies Meta<typeof AtmosphereWave>

export default meta
type Story = StoryObj<typeof meta>

export const PowderBlue: Story = {}

export const Butter: Story = {
  render: (args) => (
    <Frame atmosphere="butter">
      <AtmosphereWave {...args} />
    </Frame>
  ),
}

export const Compact: Story = {
  args: { compact: true },
}
