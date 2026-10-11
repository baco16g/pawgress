import { useEffect, useRef } from 'react'

// SPAの画面遷移はpage reloadを伴わないため、見出しへfocusしscreen readerに
// 新しい画面への遷移を伝える。visible ringはglobal.cssの[data-focus-on-mount]
// セレクタで非表示にしている。
export function useFocusOnMount<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.dataset.focusOnMount = ''
    element.focus()
  }, [])

  return ref
}
