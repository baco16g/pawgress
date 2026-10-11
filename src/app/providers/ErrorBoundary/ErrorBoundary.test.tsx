import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Bomb } from '@/testing/Bomb'
import { ErrorBoundary } from './ErrorBoundary'

describe('ErrorBoundary', () => {
  let consoleErrorSpy: MockInstance<typeof console.error>

  beforeEach(() => {
    // 意図的な描画エラーのログを抑制する。
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('何も失敗していない時はchildrenを描画する', () => {
    render(
      <ErrorBoundary>
        <p>通常表示</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('通常表示')).toBeInTheDocument()
  })

  it('子要素が例外を投げてもクラッシュせず復旧UIを表示する', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('表示中に問題が発生しました。')
    expect(screen.getByRole('button', { name: 'もう一度試す' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()
  })

  it('再試行前に呼び出し元がエラー状態を解除できる', async () => {
    const user = userEvent.setup()

    function RetryableTree() {
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

    render(<RetryableTree />)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'もう一度試す' }))

    expect(screen.getByText('復旧しました。')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('「再読み込み」ボタンでページを再読み込みする', async () => {
    const user = userEvent.setup()
    // jsdomのlocation.reloadは直接spyできないため、locationをスタブする。
    const reloadSpy = vi.fn()
    vi.stubGlobal('location', { reload: reloadSpy })

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    await user.click(screen.getByRole('button', { name: '再読み込み' }))

    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })
})
