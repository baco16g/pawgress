import { createContext, useContext, useLayoutEffect } from 'react'

export interface NavVisibilityContextValue {
  hideNav: boolean
  setHideNav: (hide: boolean) => void
}

export const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(null)

export function useNavVisibility(): NavVisibilityContextValue {
  const context = useContext(NavVisibilityContext)
  if (!context) {
    throw new Error('useNavVisibility must be used within NavVisibilityProvider')
  }
  return context
}

export function useShowNavOnMount(): void {
  const { setHideNav } = useNavVisibility()

  useLayoutEffect(() => {
    setHideNav(false)
  }, [setHideNav])
}
