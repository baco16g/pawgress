import { useEffect, type ReactNode } from 'react'

interface RootOverrideProps {
  attributes?: Record<string, string>
  cssVars?: Record<string, string>
  children: ReactNode
}

export function RootOverride({ attributes, cssVars, children }: RootOverrideProps) {
  useEffect(() => {
    const root = document.documentElement
    const previousAttributes = new Map<string, string | null>()
    const previousCssVars = new Map<string, string>()

    for (const [name, value] of Object.entries(attributes ?? {})) {
      previousAttributes.set(name, root.getAttribute(name))
      root.setAttribute(name, value)
    }

    for (const [name, value] of Object.entries(cssVars ?? {})) {
      previousCssVars.set(name, root.style.getPropertyValue(name))
      root.style.setProperty(name, value)
    }

    return () => {
      for (const [name, previous] of previousAttributes) {
        if (previous === null) {
          root.removeAttribute(name)
        } else {
          root.setAttribute(name, previous)
        }
      }
      for (const [name, previous] of previousCssVars) {
        root.style.setProperty(name, previous)
      }
    }
  }, [attributes, cssVars])

  return children
}
