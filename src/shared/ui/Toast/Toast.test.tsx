import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('role="status"でmessageを公開する', () => {
    render(<Toast message="今日の記録を保存しました。" onDismiss={() => undefined} />)

    expect(screen.getByRole('status')).toHaveTextContent('今日の記録を保存しました。')
  })

  it('表示直後はonDismissを呼ばない', () => {
    const onDismiss = vi.fn()
    render(<Toast message="今日の記録を保存しました。" onDismiss={onDismiss} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('表示時間経過後、exit animation完了（animationend）でonDismissが呼ばれる', () => {
    const onDismiss = vi.fn()
    render(<Toast message="今日の記録を保存しました。" onDismiss={onDismiss} />)

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(onDismiss).not.toHaveBeenCalled()

    fireEvent.animationEnd(screen.getByRole('status'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('表示時間経過前のanimationend（enter animation終了）ではonDismissを呼ばない', () => {
    const onDismiss = vi.fn()
    render(<Toast message="今日の記録を保存しました。" onDismiss={onDismiss} />)

    fireEvent.animationEnd(screen.getByRole('status'))

    expect(onDismiss).not.toHaveBeenCalled()
  })
})
