import { describe, expect, it } from 'vitest'
import { createTask } from '@/domain/task/task'
import {
  buildActiveHistoryRecord,
  buildRestHistoryRecord,
  calculateHeatScore,
  getHistoryHeatInput,
  activeHeatScoreToLevel,
  type HeatInput,
} from './history'

describe('buildActiveHistoryRecord', () => {
  it('completed/carryOver/inboxの3種類のoutcomeを元のtask順で保持する', () => {
    const completed = { ...createTask('完了したタスク', 't1'), completed: true }
    const carryOver = createTask('持ち越したタスク', 't2')
    const toInbox = createTask('Inboxへ戻したタスク', 't3')

    const record = buildActiveHistoryRecord('2026-10-04', [completed, carryOver, toInbox], {
      t2: 'carryOver',
      t3: 'inbox',
    })

    expect(record).toEqual({
      dateKey: '2026-10-04',
      kind: 'active',
      items: [
        { taskId: 't1', title: '完了したタスク', outcome: 'completed' },
        { taskId: 't2', title: '持ち越したタスク', outcome: 'carryOver' },
        { taskId: 't3', title: 'Inboxへ戻したタスク', outcome: 'inbox' },
      ],
    })
  })

  it('snapshot independence: 生成後に元のtask配列を変更してもrecordのitemsは影響を受けない', () => {
    const task = createTask('タスク', 't1')
    const tasks = [task]
    const record = buildActiveHistoryRecord('2026-10-04', tasks, {})

    task.title = '後から変更されたタイトル'
    task.completed = true

    expect(record.kind === 'active' && record.items[0]).toEqual({
      taskId: 't1',
      title: 'タスク',
      outcome: 'inbox',
    })
  })
})

describe('buildRestHistoryRecord', () => {
  it('kind="rest"のrecordを作る（itemsを持たない）', () => {
    expect(buildRestHistoryRecord('2026-10-04')).toEqual({ dateKey: '2026-10-04', kind: 'rest' })
  })
})

describe('getHistoryHeatInput', () => {
  it('activeならtotalTasks/completedTasksを返す', () => {
    const record = buildActiveHistoryRecord(
      '2026-10-04',
      [{ ...createTask('a', 't1'), completed: true }, createTask('b', 't2')],
      { t2: 'inbox' },
    )
    expect(getHistoryHeatInput(record)).toEqual({ totalTasks: 2, completedTasks: 1 })
  })

  it('restならnullを返す（heat計算の対象外）', () => {
    expect(getHistoryHeatInput(buildRestHistoryRecord('2026-10-04'))).toBeNull()
  })
})

const HEAT_FIXTURES: HeatInput[] = [
  { totalTasks: 1, completedTasks: 0 },
  { totalTasks: 1, completedTasks: 1 },
  { totalTasks: 3, completedTasks: 0 },
  { totalTasks: 3, completedTasks: 1 },
  { totalTasks: 3, completedTasks: 2 },
  { totalTasks: 3, completedTasks: 3 },
  { totalTasks: 2, completedTasks: 1 },
  { totalTasks: 2, completedTasks: 2 },
  { totalTasks: 5, completedTasks: 3 },
  { totalTasks: 5, completedTasks: 5 },
]

describe('calculateHeatScore', () => {
  it('0件完了のscoreは0（Active最小fillとは別の値）', () => {
    expect(calculateHeatScore({ totalTasks: 3, completedTasks: 0 })).toBe(0)
    expect(calculateHeatScore({ totalTasks: 5, completedTasks: 0 })).toBe(0)
  })

  it('1/1と3/3を区別できる（3/3の方が高いheat）', () => {
    const small = calculateHeatScore({ totalTasks: 1, completedTasks: 1 })
    const large = calculateHeatScore({ totalTasks: 3, completedTasks: 3 })
    expect(small).toBeLessThan(large)
  })

  it('同じ100%完了でもTask量が多いほどheatが高くなる（1/1 < 2/2 < 3/3）', () => {
    const one = calculateHeatScore({ totalTasks: 1, completedTasks: 1 })
    const two = calculateHeatScore({ totalTasks: 2, completedTasks: 2 })
    const three = calculateHeatScore({ totalTasks: 3, completedTasks: 3 })
    expect(one).toBeLessThan(two)
    expect(two).toBeLessThan(three)
  })

  it('5/5が最大強度1になる', () => {
    expect(calculateHeatScore({ totalTasks: 5, completedTasks: 5 })).toBe(1)
  })

  it('normalization: 5件を超えてもheatは1を超えない（cap済み）', () => {
    const heat = calculateHeatScore({ totalTasks: 100, completedTasks: 100 })
    expect(heat).toBeLessThanOrEqual(1)
  })

  it('全fixtureが0〜1の範囲に収まる', () => {
    HEAT_FIXTURES.forEach((input) => {
      const heat = calculateHeatScore(input)
      expect(heat).toBeGreaterThanOrEqual(0)
      expect(heat).toBeLessThanOrEqual(1)
    })
  })

  it('totalTasks=0ならheat=0（0除算を起こさない）', () => {
    expect(calculateHeatScore({ totalTasks: 0, completedTasks: 0 })).toBe(0)
  })
})

describe('activeHeatScoreToLevel', () => {
  it('heat=0はlevel 1（Active自体の存在は塗りで示すが最も薄い）', () => {
    expect(activeHeatScoreToLevel(0)).toBe(1)
  })

  it('heat=1はlevel 4（既定levels=4の最大）', () => {
    expect(activeHeatScoreToLevel(1)).toBe(4)
  })

  it('中間のheatは中間levelへ写される', () => {
    expect(activeHeatScoreToLevel(0.5)).toBe(3)
  })

  it('levelsを3に変更すると最大levelが3になる', () => {
    expect(activeHeatScoreToLevel(1, 3)).toBe(3)
  })

  it('範囲外の値をclampする（負値→0、1超→1相当）', () => {
    expect(activeHeatScoreToLevel(-0.5)).toBe(1)
    expect(activeHeatScoreToLevel(1.5)).toBe(4)
  })
})
