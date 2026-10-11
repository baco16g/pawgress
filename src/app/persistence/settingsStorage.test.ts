import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, type SettingsState } from '@/domain/settings/settings'
import { loadSettings, saveSettings } from '@/app/persistence/settingsStorage'

describe('settingsStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('保存されたsettingsが無い場合はDEFAULT_SETTINGSを返す', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('saveSettings→loadSettingsで同じ値が復元される', () => {
    const custom: SettingsState = {
      textSize: 'large',
      theme: 'light',
      motion: 'reduced',
      companionSpecies: 'cat',
      maxTodayTasks: 5,
    }
    saveSettings(custom)

    expect(loadSettings()).toEqual(custom)
  })

  it('theme="dark"もsaveSettings→loadSettingsで保持される（D-087）', () => {
    const custom: SettingsState = {
      textSize: 'standard',
      theme: 'dark',
      motion: 'system',
      companionSpecies: 'dog',
      maxTodayTasks: 3,
    }
    saveSettings(custom)

    expect(loadSettings()).toEqual(custom)
  })

  it('壊れたJSONはDEFAULT_SETTINGSへ安全にfallbackする', () => {
    window.localStorage.setItem('pawgress.settings.v1', '{not valid json')

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('shapeが不正な値（未知のtextSize等）はDEFAULT_SETTINGSへfallbackする', () => {
    window.localStorage.setItem(
      'pawgress.settings.v1',
      JSON.stringify({ textSize: 'huge', theme: 'system', motion: 'system', maxTodayTasks: 3 }),
    )

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('maxTodayTasksが許可範囲外（6件等）の場合はDEFAULT_SETTINGSへfallbackする', () => {
    window.localStorage.setItem(
      'pawgress.settings.v1',
      JSON.stringify({ ...DEFAULT_SETTINGS, maxTodayTasks: 6 }),
    )

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
