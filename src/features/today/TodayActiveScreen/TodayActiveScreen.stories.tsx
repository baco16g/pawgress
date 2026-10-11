import type { Meta, StoryObj } from '@storybook/react-vite'
import { RootOverride } from '@/testing/RootOverride'
import { TodayActiveScreen } from './TodayActiveScreen'

const meta = {
  title: 'features/today/TodayActiveScreen',
  component: TodayActiveScreen,
  args: {
    todayLabel: '10/3',
    companionSpecies: 'dog',
    companionVariant: 'golden-retriever',
    onToggleTask: () => undefined,
    onAddTask: () => undefined,
    onOpenSettings: () => undefined,
    onOpenReview: () => undefined,
    onAbandonToday: () => undefined,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TodayActiveScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: '1. Empty',
  args: { tasks: [] },
}

export const OneTask: Story = {
  name: '2. 1件',
  args: {
    tasks: [{ id: '1', title: '牛乳を買う', completed: false }],
  },
}

export const ThreeTasks: Story = {
  name: '3. 3件（デフォルト上限）',
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '資料を確認する', completed: false },
      { id: '3', title: 'メールの下書きを送る', completed: false },
    ],
  },
}

export const MixedCompletion: Story = {
  name: '4. 完了・未完了が混在',
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: true },
      { id: '2', title: '資料を確認する', completed: false },
      { id: '3', title: 'メールの下書きを送る', completed: true },
    ],
  },
}

export const AllCompleted: Story = {
  name: '5. すべて完了（sage atmosphere modifier）',
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: true },
      { id: '2', title: '資料を確認する', completed: true },
    ],
  },
}

export const LongJapaneseTitle: Story = {
  name: '6. 長い日本語タイトル',
  args: {
    tasks: [
      {
        id: '1',
        title:
          '今日中に終わらせたい資料整理と、明日の朝いちばんに送るメールの下書きをまとめて確認する',
        completed: false,
      },
      { id: '2', title: '牛乳を買う', completed: false },
    ],
  },
  globals: { viewport: { value: '390-844' } },
}

export const PersistentInputFocused: Story = {
  name: '7. 常時入力欄にフォーカスした状態',
  args: {
    tasks: [{ id: '1', title: '牛乳を買う', completed: false }],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('textbox', { name: 'タスクを追加' }))
  },
}

export const ReducedMotion: Story = {
  name: '8. prefers-reduced-motion',
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '資料を確認する', completed: true },
    ],
  },
  decorators: [
    (Story) => (
      <RootOverride attributes={{ 'data-motion': 'reduced' }}>
        <Story />
      </RootOverride>
    ),
  ],
}

const BREAKPOINT_TASKS = [
  { id: '1', title: '牛乳を買う', completed: false },
  { id: '2', title: '資料を確認する', completed: true },
  { id: '3', title: 'メールの下書きを送る', completed: false },
]

export const Viewport320: Story = {
  name: '9. 320px',
  args: { tasks: BREAKPOINT_TASKS },
  globals: { viewport: { value: '320-568' } },
}

export const Viewport390: Story = {
  name: '10. 390px（mobile baseline）',
  args: { tasks: BREAKPOINT_TASKS },
  globals: { viewport: { value: '390-844' } },
}

export const Viewport768: Story = {
  name: '11. 768px',
  args: { tasks: BREAKPOINT_TASKS },
  globals: { viewport: { value: '768-1024' } },
}

export const Viewport1440: Story = {
  name: '12. 1440px',
  args: { tasks: BREAKPOINT_TASKS },
  globals: { viewport: { value: '1440-900' } },
}

// 実際のbrowser zoomは再現できないため、200%zoom相当の実効CSS幅（390px / 2）で
// reflowを検証する代替story（320px reflow要件と同じ考え方）。
export const Zoom200: Story = {
  name: '13. 200%zoom相当（実効幅195px）',
  args: {
    tasks: [
      { id: '1', title: '牛乳を買う', completed: false },
      { id: '2', title: '資料を確認する', completed: true },
    ],
  },
  globals: { viewport: { value: '195-844' } },
}

export const KeyboardFocus: Story = {
  name: '14. キーボードフォーカス（Review CTA）',
  args: {
    tasks: [{ id: '1', title: '牛乳を買う', completed: false }],
  },
  play: async ({ canvas }) => {
    const reviewCta = await canvas.findByRole('button', { name: /今日を振り返る/ })
    reviewCta.focus()
  },
}

// --- Companion atmosphere coverage ---
// silhouetteが背景へ溶けないことを目視確認するための4variant。

const ATMOSPHERE_COVERAGE_TASKS = [
  { id: '1', title: '牛乳を買う', completed: false },
  { id: '2', title: '資料を確認する', completed: true },
  { id: '3', title: 'メールの下書きを送る', completed: false },
]

export const CompanionDark: Story = {
  name: '15. Companion: dark（black cat, butter atmosphere）',
  args: {
    companionSpecies: 'cat',
    companionVariant: 'black',
    tasks: ATMOSPHERE_COVERAGE_TASKS,
  },
}

export const CompanionWarm: Story = {
  name: '16. Companion: warm/orange（orange-tabby, powder-blue atmosphere）',
  args: {
    companionSpecies: 'cat',
    companionVariant: 'orange-tabby',
    tasks: ATMOSPHERE_COVERAGE_TASKS,
  },
}

export const CompanionCool: Story = {
  name: '17. Companion: gray/cool（schnauzer, butter atmosphere）',
  args: {
    companionSpecies: 'dog',
    companionVariant: 'schnauzer',
    tasks: ATMOSPHERE_COVERAGE_TASKS,
  },
}

export const CompanionLight: Story = {
  name: '18. Companion: white/light（white-longhair, powder-blue atmosphere）',
  args: {
    companionSpecies: 'cat',
    companionVariant: 'white-longhair',
    tasks: ATMOSPHERE_COVERAGE_TASKS,
  },
}

// 「今日をやめる」はRestActionと同じ「button→inline確認→確定」patternをD-086で踏襲する。
export const AbandonTodayTriggerFocus: Story = {
  name: '19. AbandonTodayTriggerFocus（keyboard focus）',
  args: { tasks: ATMOSPHERE_COVERAGE_TASKS },
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: '今日をやめる' }).focus()
  },
}

export const AbandonTodayConfirmationExpanded: Story = {
  name: '20. AbandonTodayConfirmationExpanded',
  args: { tasks: ATMOSPHERE_COVERAGE_TASKS },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '今日をやめる' }))
  },
}
