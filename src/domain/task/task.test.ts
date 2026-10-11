import { describe, expect, it } from 'vitest'
import { createTask, toggleTaskCompletion, updateTaskTitle } from './task'

describe('createTask', () => {
  it('creates an incomplete task with the given title', () => {
    const task = createTask('牛乳を買う', 'id-1')
    expect(task).toEqual({ id: 'id-1', title: '牛乳を買う', completed: false })
  })

  it('generates an id when none is provided', () => {
    const a = createTask('タスクA')
    const b = createTask('タスクB')
    expect(a.id).not.toBe(b.id)
  })
})

describe('toggleTaskCompletion', () => {
  it('flips completed from false to true', () => {
    const task = createTask('掃除する', 'id-1')
    expect(toggleTaskCompletion(task).completed).toBe(true)
  })

  it('toggling twice returns to the original state', () => {
    const task = createTask('掃除する', 'id-1')
    const twice = toggleTaskCompletion(toggleTaskCompletion(task))
    expect(twice).toEqual(task)
  })

  it('does not mutate the original task', () => {
    const task = createTask('掃除する', 'id-1')
    toggleTaskCompletion(task)
    expect(task.completed).toBe(false)
  })
})

describe('updateTaskTitle', () => {
  it('updates only the title', () => {
    const task = { id: 'id-1', title: '旧タイトル', completed: true }
    const updated = updateTaskTitle(task, '新タイトル')
    expect(updated).toEqual({ id: 'id-1', title: '新タイトル', completed: true })
  })
})
