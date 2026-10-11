import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/ui/Button/Button'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Pawgress rendering error:', error, info.componentStack)
  }

  private handleRetry = (): void => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }

    return (
      <div className={styles.fallback} role="alert">
        <p className={styles.message}>表示中に問題が発生しました。</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={this.handleRetry}>
            もう一度試す
          </Button>
          <Button variant="primary" onClick={this.handleReload}>
            再読み込み
          </Button>
        </div>
      </div>
    )
  }
}
