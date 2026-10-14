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

// 呼び出したrouteが表示されている間だけBottom Navigationを隠す。useEffectだと
// 隠す前のnavが一度paintされてしまうため、paint前に走るuseLayoutEffectを使う。
export function useHideNavWhileMounted(): void {
  const { setHideNav } = useNavVisibility()

  useLayoutEffect(() => {
    setHideNav(true)
    return () => {
      setHideNav(false)
    }
  }, [setHideNav])
}
