export type CompanionSpeciesPreference = 'dog' | 'cat'

export type TextSizePreference = 'standard' | 'large' | 'extraLarge'

export type ThemePreference = 'system' | 'light' | 'dark'

export type MotionPreference = 'system' | 'reduced'

export interface SettingsState {
  textSize: TextSizePreference
  theme: ThemePreference
  motion: MotionPreference
  companionSpecies: CompanionSpeciesPreference
  maxTodayTasks: number
}

export const DEFAULT_SETTINGS: SettingsState = {
  textSize: 'standard',
  theme: 'system',
  motion: 'system',
  companionSpecies: 'dog',
  maxTodayTasks: 3,
}

export const TEXT_SIZE_SCALE: Record<TextSizePreference, number> = {
  standard: 1,
  large: 1.15,
  extraLarge: 1.3,
}

export const TEXT_SIZE_LABEL: Record<TextSizePreference, string> = {
  standard: '標準',
  large: '大きめ',
  extraLarge: '特大',
}

export const THEME_LABEL: Record<ThemePreference, string> = {
  system: '端末設定',
  light: 'ライト',
  dark: 'ダーク',
}

export const MOTION_LABEL: Record<MotionPreference, string> = {
  system: '端末設定',
  reduced: '少なくする',
}

export const COMPANION_SPECIES_LABEL: Record<CompanionSpeciesPreference, string> = {
  dog: '犬',
  cat: '猫',
}

export const MAX_TODAY_TASKS_OPTIONS: readonly number[] = [1, 2, 3, 4, 5]

export function isValidMaxTodayTasks(value: number): boolean {
  return MAX_TODAY_TASKS_OPTIONS.includes(value)
}
