// 各配列はSettingsの選択画面の表示順を兼ね、保存値の検証にも使う。
export const COMPANION_SPECIES_OPTIONS = ['dog', 'cat'] as const
export type CompanionSpeciesPreference = (typeof COMPANION_SPECIES_OPTIONS)[number]

export const TEXT_SIZE_OPTIONS = ['standard', 'large', 'extraLarge'] as const
export type TextSizePreference = (typeof TEXT_SIZE_OPTIONS)[number]

export const THEME_OPTIONS = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof THEME_OPTIONS)[number]

export const MOTION_OPTIONS = ['system', 'reduced'] as const
export type MotionPreference = (typeof MOTION_OPTIONS)[number]

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
