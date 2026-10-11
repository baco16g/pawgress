import { RouterProvider } from 'react-router/dom'
import { router } from './router/router'
import { ErrorBoundary } from './providers/ErrorBoundary/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
