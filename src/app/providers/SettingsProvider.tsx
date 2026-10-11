import { useEffect, useState, type ReactNode } from 'react'
import { SettingsContext } from '@/app/state/settingsContext'
import { DEFAULT_SETTINGS, TEXT_SIZE_SCALE, type SettingsState } from '@/domain/settings/settings'
import { loadSettings, saveSettings } from '@/app/persistence/settingsStorage'

function applySettingsToDocument(settings: SettingsState): void {
  const root = document.documentElement
  root.style.setProperty('--font-scale', String(TEXT_SIZE_SCALE[settings.textSize]))

  if (settings.motion === 'reduced') {
    root.dataset.motion = 'reduced'
  } else {
    delete root.dataset.motion
  }

  if (settings.theme === 'light' || settings.theme === 'dark') {
    root.dataset.theme = settings.theme
  } else {
    delete root.dataset.theme
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings())

  useEffect(() => {
    applySettingsToDocument(settings)
    saveSettings(settings)
  }, [settings])

  const updateSettings = (patch: Partial<SettingsState>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
