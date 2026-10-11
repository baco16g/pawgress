import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMPANION_STATES } from '../../model/companion'
import { COMPANION_VARIANTS, type CatVariant, type DogVariant } from '../../model/companionAssets'
import { Companion, type CompanionProps } from './Companion'

// dogVariant/catVariantに分け、argTypes.ifでspeciesに応じて片方だけ表示する。
type CompanionStoryArgs = Omit<CompanionProps, 'variant'> & {
  dogVariant: DogVariant
  catVariant: CatVariant
}

const meta = {
  title: 'features/companion/Companion',
  args: {
    species: 'dog',
    dogVariant: 'golden-retriever',
    catVariant: 'orange-tabby',
    state: 'idle',
  },
  argTypes: {
    species: {
      control: 'select',
      options: ['dog', 'cat'],
    },
    dogVariant: {
      name: 'variant（犬）',
      control: 'select',
      options: COMPANION_VARIANTS.dog,
      if: { arg: 'species', eq: 'dog' },
    },
    catVariant: {
      name: 'variant（猫）',
      control: 'select',
      options: COMPANION_VARIANTS.cat,
      if: { arg: 'species', eq: 'cat' },
    },
    state: {
      control: 'select',
      options: COMPANION_STATES,
    },
  },
  parameters: {
    layout: 'centered',
  },
  render: ({ species, dogVariant, catVariant, state, size }) => (
    <Companion
      species={species}
      variant={species === 'dog' ? dogVariant : catVariant}
      state={state}
      size={size}
    />
  ),
} satisfies Meta<CompanionStoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PositiveReaction: Story = {
  name: 'ポジティブな反応（pleased）',
  args: { state: 'pleased' },
}

export const TaskCompleted: Story = {
  name: 'タスク完了時（completed）',
  args: { state: 'completed' },
}

export const ReviewCompanion: Story = {
  name: '振り返り時（review）',
  args: { state: 'review' },
}

export const Sleepy: Story = {
  name: '眠そうな状態（sleepy）',
  args: { state: 'sleepy' },
}

export const Subdued: Story = {
  name: '控えめな状態（subdued）',
  args: { state: 'subdued' },
}

export const AllVariants: Story = {
  name: '全バリアント比較',
  parameters: { layout: 'padded' },
  render: ({ state }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {COMPANION_VARIANTS.dog.map((variant) => (
        <Companion key={variant} species="dog" variant={variant} state={state} size={80} />
      ))}
      {COMPANION_VARIANTS.cat.map((variant) => (
        <Companion key={variant} species="cat" variant={variant} state={state} size={80} />
      ))}
    </div>
  ),
}
