import clsx from 'clsx'
import { CalendarDays, PawPrint, createLucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { DailyLifecycleProvider } from '@/app/providers/DailyLifecycleProvider'
import { SettingsProvider } from '@/app/providers/SettingsProvider'
import { NavVisibilityContext, useNavVisibility } from '@/app/state/navVisibilityContext'
import type { DailyLifecycleState } from '@/domain/daily-lifecycle/dailyLifecycleStore'
import styles from './AppLayout.module.css'

// lucideの標準Inboxはslot線→tray本体の順にpaintするため、active状態でfillすると
// slotが隠れる。同じpath dataを描画順だけ入れ替え、nav barでのみ使う
// （他画面のInbox iconには影響しない）。
const InboxNavIcon = createLucideIcon({
  name: 'inbox-nav',
  size: 24,
  node: [
    [
      'path',
      {
        d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
        key: 'tray',
      },
    ],
    ['polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12', key: 'slot' }],
  ],
})

const PRIMARY_NAV_ITEMS = [
  { to: '/today', label: '今日', Icon: PawPrint },
  { to: '/inbox', label: 'Inbox', Icon: InboxNavIcon },
  { to: '/history', label: '記録', Icon: CalendarDays },
] as const

function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [hideNav, setHideNav] = useState(false)
  return (
    <NavVisibilityContext.Provider value={{ hideNav, setHideNav }}>
      {children}
    </NavVisibilityContext.Provider>
  )
}

export interface AppLayoutProps {
  initialLifecycleState?: DailyLifecycleState
}

export function AppLayout({ initialLifecycleState }: AppLayoutProps = {}) {
  return (
    <SettingsProvider>
      <DailyLifecycleProvider initialState={initialLifecycleState}>
        <NavVisibilityProvider>
          <AppLayoutShell />
        </NavVisibilityProvider>
      </DailyLifecycleProvider>
    </SettingsProvider>
  )
}

function AppLayoutShell() {
  const { hideNav } = useNavVisibility()
  const layoutRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const layout = layoutRef.current
    const nav = navRef.current
    if (!layout) return

    if (!nav) {
      layout.style.setProperty('--nav-reserved-height', '0px')
      return
    }

    const updateReservedHeight = () => {
      const reserved = window.innerHeight - nav.getBoundingClientRect().top
      layout.style.setProperty('--nav-reserved-height', `${String(reserved)}px`)
    }

    updateReservedHeight()
    window.addEventListener('resize', updateReservedHeight)

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', updateReservedHeight)
      }
    }
    const resizeObserver = new ResizeObserver(updateReservedHeight)
    resizeObserver.observe(nav)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateReservedHeight)
    }
  }, [hideNav])

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div className={styles.content}>
        <Outlet />
      </div>
      {hideNav ? null : (
        <nav className={styles.navContainer} aria-label="主要な画面" ref={navRef}>
          <ul className={styles.navList}>
            {PRIMARY_NAV_ITEMS.map(({ to, label, Icon }) => (
              <li key={to} className={styles.navListItem}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    clsx(styles.navLink, isActive && styles.navLinkActive)
                  }
                >
                  <span className={styles.navIconWrap}>
                    <Icon
                      className={styles.navIcon}
                      aria-hidden="true"
                      size={20}
                      strokeWidth={1.75}
                    />
                  </span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
