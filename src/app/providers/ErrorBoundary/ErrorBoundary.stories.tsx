import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { Bomb } from '@/testing/Bomb'
import { ErrorBoundary } from './ErrorBoundary'

const meta = {
  title: 'app/providers/ErrorBoundary',
  component: ErrorBoundary,
  args: { children: null },
} satisfies Meta<typeof ErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <p>通常時は子要素がそのまま表示されます。</p>
    </ErrorBoundary>
  ),
}

export const CaughtError: Story = {
  render: () => (
    <ErrorBoundary>
      <Bomb />
    </ErrorBoundary>
  ),
}

function RetryDemo() {
  const [shouldThrow, setShouldThrow] = useState(true)

  return (
    <ErrorBoundary
      onReset={() => {
        setShouldThrow(false)
      }}
    >
      {shouldThrow ? <Bomb /> : <p>復旧しました。</p>}
    </ErrorBoundary>
  )
}

export const RetrySucceeds: Story = {
  name: 'もう一度試すで復旧する',
  render: () => <RetryDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'もう一度試す' }))
    await expect(canvas.getByText('復旧しました。')).toBeInTheDocument()
  },
}
