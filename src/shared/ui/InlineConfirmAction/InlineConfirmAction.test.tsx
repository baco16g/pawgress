import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InlineConfirmAction } from './InlineConfirmAction'

function renderAction(onConfirm = vi.fn()) {
  render(
    <InlineConfirmAction
      triggerLabel="今日をやめる"
      confirmPrompt="今日のタスクをやめてInboxへ戻しますか？"
      confirmLabel="やめる"
      cancelLabel="続ける"
      confirmGroupAriaLabel="今日をやめる確認"
      onConfirm={onConfirm}
    />,
  )
  return onConfirm
}

describe('InlineConfirmAction', () => {
  it('初期状態ではtrigger buttonのみ表示される', () => {
    renderAction()

    expect(screen.getByRole('button', { name: '今日をやめる' })).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('triggerをclickするとconfirm UIが表示され、確認文言へfocusが移る', async () => {
    const user = userEvent.setup()
    renderAction()

    await user.click(screen.getByRole('button', { name: '今日をやめる' }))

    expect(screen.getByRole('group', { name: '今日をやめる確認' })).toBeInTheDocument()
    expect(screen.getByText('今日のタスクをやめてInboxへ戻しますか？')).toHaveFocus()
  })

  it('confirmをclickするとonConfirmが呼ばれる', async () => {
    const user = userEvent.setup()
    const onConfirm = renderAction()

    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancelをclickするとtrigger表示に戻り、trigger buttonへfocusが戻る', async () => {
    const user = userEvent.setup()
    const onConfirm = renderAction()

    await user.click(screen.getByRole('button', { name: '今日をやめる' }))
    await user.click(screen.getByRole('button', { name: '続ける' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '今日をやめる' })).toHaveFocus()
  })
})
