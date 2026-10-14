import {
  COMPANION_SPECIES_OPTIONS,
  DEFAULT_SETTINGS,
  isValidMaxTodayTasks,
  MOTION_OPTIONS,
  TEXT_SIZE_OPTIONS,
  THEME_OPTIONS,
  type SettingsState,
} from '@/domain/settings/settings'

const STORAGE_KEY = 'pawgress.settings.v1'

function isValidShape(value: unknown): value is SettingsState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    TEXT_SIZE_OPTIONS.some((option) => option === v.textSize) &&
    THEME_OPTIONS.some((option) => option === v.theme) &&
    MOTION_OPTIONS.some((option) => option === v.motion) &&
    COMPANION_SPECIES_OPTIONS.some((option) => option === v.companionSpecies) &&
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
