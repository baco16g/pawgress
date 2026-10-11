import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { SettingsScreen } from './SettingsScreen'

const baseProps = {
  textSizeValueLabel: '標準',
  themeValueLabel: '端末設定',
  motionValueLabel: '端末設定',
  companionValueLabel: '犬',
  maxTodayTasksValueLabel: '3件',
}

function renderSettingsScreen() {
  return render(
    <MemoryRouter>
      <SettingsScreen {...baseProps} />
    </MemoryRouter>,
  )
}

describe('SettingsScreen', () => {
  it('見出し「設定」を表示する', () => {
    renderSettingsScreen()

    expect(screen.getByRole('heading', { name: '設定', level: 1 })).toBeInTheDocument()
  })

  it('mount時にページ見出しへfocusが移る（route遷移後のorientation）', () => {
    renderSettingsScreen()

    expect(screen.getByRole('heading', { name: '設定' })).toHaveFocus()
  })

  it('実装済みのsection見出しをすべて表示する', () => {
    renderSettingsScreen()

    expect(screen.getByRole('heading', { name: '表示とアクセシビリティ' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '相棒' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'その他' })).toBeInTheDocument()
  })

  it('各設定行が現在値とともに表示され、対応するdetail screenへlinkする', () => {
    renderSettingsScreen()

    expect(screen.getByRole('link', { name: '文字サイズ 標準' })).toHaveAttribute(
      'href',
      '/settings/text-size',
    )
    expect(screen.getByRole('link', { name: 'テーマ 端末設定' })).toHaveAttribute(
      'href',
      '/settings/theme',
    )
    expect(screen.getByRole('link', { name: 'アニメーション 端末設定' })).toHaveAttribute(
      'href',
      '/settings/motion',
    )
    expect(screen.getByRole('link', { name: '相棒 犬' })).toHaveAttribute(
      'href',
      '/settings/companion',
    )
    expect(screen.getByRole('link', { name: '1日の最大タスク量 3件' })).toHaveAttribute(
      'href',
      '/settings/max-tasks',
    )
    expect(screen.getByRole('link', { name: 'データとプライバシー' })).toHaveAttribute(
      'href',
      '/settings/data-privacy',
    )
    expect(screen.getByRole('link', { name: 'ライセンス・クレジット' })).toHaveAttribute(
      'href',
      '/settings/licenses',
    )
  })

  it('「記録」行を表示しない（HistoryはBottom Navigationのprimary destination）', () => {
    renderSettingsScreen()

    expect(screen.queryByRole('link', { name: /記録/ })).not.toBeInTheDocument()
  })

  it('placeholder設定（switch等）を表示しない', () => {
    renderSettingsScreen()

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
})
