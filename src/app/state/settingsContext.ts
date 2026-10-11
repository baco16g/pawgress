import { createContext, useContext } from 'react'
import type { SettingsState } from '@/domain/settings/settings'

export interface SettingsContextValue {
  settings: SettingsState
  updateSettings: (patch: Partial<SettingsState>) => void
  resetSettings: () => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
