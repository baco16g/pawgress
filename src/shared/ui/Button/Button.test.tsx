import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('ネイティブbutton要素として、ラベルをaccessible nameに公開する', () => {
    render(<Button>タスクを追加</Button>)

    expect(screen.getByRole('button', { name: 'タスクを追加' })).toBeInTheDocument()
  })

  it('ポインタ操作でonClickが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>保存</Button>)

    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('キーボード操作（Enter/Space）でonClickが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>保存</Button>)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled中はonClickが発火しない', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        保存
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('tertiary variantもネイティブbutton要素としてaccessible nameを公開する', () => {
    render(<Button variant="tertiary">今日を振り返る</Button>)

    expect(screen.getByRole('button', { name: '今日を振り返る' })).toBeInTheDocument()
  })

  it('type="button"がデフォルトなので、フォームを誤って送信しない', () => {
    render(<Button>保存</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('Tabキーでフォーカスが到達する（キーボード操作可能であることの確認）', async () => {
    const user = userEvent.setup()
    render(<Button>保存</Button>)

    await user.tab()

    expect(screen.getByRole('button', { name: '保存' })).toHaveFocus()
  })
})
