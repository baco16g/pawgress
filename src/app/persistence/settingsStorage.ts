import {
  DEFAULT_SETTINGS,
  isValidMaxTodayTasks,
  type SettingsState,
} from '@/domain/settings/settings'

const STORAGE_KEY = 'pawgress.settings.v1'

function isValidShape(value: unknown): value is SettingsState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    (v.textSize === 'standard' || v.textSize === 'large' || v.textSize === 'extraLarge') &&
    (v.theme === 'system' || v.theme === 'light' || v.theme === 'dark') &&
    (v.motion === 'system' || v.motion === 'reduced') &&
    (v.companionSpecies === 'dog' || v.companionSpecies === 'cat') &&
    typeof v.maxTodayTasks === 'number' &&
    isValidMaxTodayTasks(v.maxTodayTasks)
  )
}

export function loadSettings(): SettingsState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    return isValidShape(parsed) ? parsed : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: SettingsState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // 書き込みに失敗しても何もしない。
  }
}
