import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, MAX_TODAY_TASKS_OPTIONS, isValidMaxTodayTasks } from './settings'

describe('isValidMaxTodayTasks', () => {
  it.each(MAX_TODAY_TASKS_OPTIONS)('%iは有効な値', (value) => {
    expect(isValidMaxTodayTasks(value)).toBe(true)
  })

  it.each([0, 6, -1, 2.5])('%iは無効な値', (value) => {
    expect(isValidMaxTodayTasks(value)).toBe(false)
  })
})

describe('DEFAULT_SETTINGS', () => {
  it('maxTodayTasksはMAX_TODAY_TASKS_OPTIONSに含まれる値である', () => {
    expect(isValidMaxTodayTasks(DEFAULT_SETTINGS.maxTodayTasks)).toBe(true)
  })
})
