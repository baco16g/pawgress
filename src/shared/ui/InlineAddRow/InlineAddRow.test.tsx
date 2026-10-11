import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InlineAddRow } from './InlineAddRow'

describe('InlineAddRow', () => {
  it('常時text inputとして表示され、clickでfocusできる', async () => {
    const user = userEvent.setup()
    render(<InlineAddRow onSave={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.click(input)

    expect(input).toHaveFocus()
  })

  it('空欄のときは「追加」buttonを表示しない', () => {
    render(<InlineAddRow onSave={vi.fn()} />)

    expect(screen.queryByRole('button', { name: '追加' })).not.toBeInTheDocument()
  })

  it('入力するとtrailing「追加」buttonが表示される', async () => {
    const user = userEvent.setup()
    render(<InlineAddRow onSave={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), '牛乳を買う')

    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('Enterで保存され、入力欄がclearされる', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '牛乳を買う{Enter}')

    expect(onSave).toHaveBeenCalledWith('牛乳を買う')
    expect(input).toHaveValue('')
  })

  it('IME変換確定中のEnterでは保存しない', () => {
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    fireEvent.change(input, { target: { value: '日本語の下書き' } })
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
    )

    expect(onSave).not.toHaveBeenCalled()
    expect(input).toHaveValue('日本語の下書き')
  })

  it('「追加」buttonのclickで保存され、入力欄がclearされる', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '  牛乳を買う  ')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(onSave).toHaveBeenCalledWith('牛乳を買う')
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('IME変換未確定中でも「追加」buttonのclickは保存される（Enterとは異なりboundaryな意図のため）', () => {
    // buttonのpointerdownはfocusを入力欄に留める実装（モバイルキーボードを閉じない
    // ため）のため、composition中でもblur/compositionendが起きない。Enter限定の
    // isComposing判定をbutton submitにも適用すると、変換未確定のままtapした
    // buttonが反応しなくなる回帰を防ぐ。
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    fireEvent.compositionStart(input)
    fireEvent.change(input, { target: { value: '日本語の下書き' } })

    fireEvent.click(screen.getByRole('button', { name: '追加' }))

    expect(onSave).toHaveBeenCalledWith('日本語の下書き')
    expect(input).toHaveValue('')
  })

  it('保存後もfocusが維持される', async () => {
    const user = userEvent.setup()
    render(<InlineAddRow onSave={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '牛乳を買う{Enter}')

    expect(input).toHaveFocus()
  })

  it('空欄・空白のみではEnterで保存されない', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)

    await user.type(screen.getByRole('textbox', { name: 'タスクを追加' }), '   {Enter}')

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: '追加' })).not.toBeInTheDocument()
  })

  it('入力中にblurしても入力内容（draft）は消えない', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <InlineAddRow onSave={vi.fn()} />
        <button type="button">他の要素</button>
      </div>,
    )

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '牛乳を買う')
    await user.click(screen.getByRole('button', { name: '他の要素' }))

    expect(input).toHaveValue('牛乳を買う')
    await user.click(input)
    await user.type(input, ' 明日')
    expect(input).toHaveValue('牛乳を買う 明日')
  })

  it('Escapeはfocusを外すだけで、draftは消さない', async () => {
    const user = userEvent.setup()
    render(<InlineAddRow onSave={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '牛乳を買う')
    await user.keyboard('{Escape}')

    expect(input).toHaveValue('牛乳を買う')
    expect(input).not.toHaveFocus()
  })

  it('Tabで追加へ移動してEnterでも保存でき、同じinputへ戻る', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)
    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.type(input, '資料を確認する')
    await user.tab()
    expect(screen.getByRole('button', { name: '追加' })).toHaveFocus()
    expect(input).toHaveValue('資料を確認する')
    await user.keyboard('{Enter}')
    expect(onSave).toHaveBeenCalledExactlyOnceWith('資料を確認する')
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  it('disabled時はinputが操作不能になり、保存されない', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} disabled />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    expect(input).toBeDisabled()

    await user.click(input)
    await user.keyboard('牛乳を買う{Enter}')

    expect(onSave).not.toHaveBeenCalled()
    expect(input).toHaveValue('')
    expect(screen.queryByRole('button', { name: '追加' })).not.toBeInTheDocument()
  })

  it('disabled時、describedByIdで渡したidがinputのaria-describedbyに反映される', () => {
    render(<InlineAddRow onSave={vi.fn()} disabled describedById="capacity-message" />)

    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    expect(input).toHaveAttribute('aria-describedby', 'capacity-message')
  })

  it('composition中のEscapeは変換操作を妨げず、確定Enterも保存しない', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<InlineAddRow onSave={onSave} />)
    const input = screen.getByRole('textbox', { name: 'タスクを追加' })
    await user.click(input)
    fireEvent.compositionStart(input)
    fireEvent.change(input, { target: { value: '資料' } })
    await user.keyboard('{Escape}{Enter}')
    expect(input).toHaveFocus()
    expect(onSave).not.toHaveBeenCalled()
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    expect(onSave).not.toHaveBeenCalled()
    expect(input).toHaveValue('資料')
    await user.keyboard('{Enter}')
    expect(onSave).toHaveBeenCalledExactlyOnceWith('資料')
  })
})
