import { describe, expect, it } from 'vitest'
import { COMPANION_VARIANTS, getDailyCompanionVariant } from './companionAssets'

describe('getDailyCompanionVariant', () => {
  it('同じspecies・dateKeyなら常に同じvariantを返す（決定的）', () => {
    const first = getDailyCompanionVariant('dog', '2026-10-07')
    const second = getDailyCompanionVariant('dog', '2026-10-07')

    expect(first).toBe(second)
  })

  it('dateKeyが変わるとvariantが変わり得る（固定値のままではない）', () => {
    const dateKeys = Array.from(
      { length: 30 },
      (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`,
    )
    const variants = new Set(dateKeys.map((dateKey) => getDailyCompanionVariant('dog', dateKey)))

    // 30日分で少なくとも半数以上のvariant（6種中4種以上）が現れることを確認し、
    // 偏った周期パターン（D-079で発見した旧hashの6日周期バグ）の再発を防ぐ。
    expect(variants.size).toBeGreaterThanOrEqual(4)
  })

  it('speciesに対応するvariant一覧の範囲内の値のみを返す', () => {
    for (let day = 1; day <= 31; day++) {
      const dateKey = `2026-10-${String(day).padStart(2, '0')}`
      expect(COMPANION_VARIANTS.dog).toContain(getDailyCompanionVariant('dog', dateKey))
      expect(COMPANION_VARIANTS.cat).toContain(getDailyCompanionVariant('cat', dateKey))
    }
  })

  it('catのvariantも30日分で十分な種類が現れる（dogと同じ偏りチェック）', () => {
    const dateKeys = Array.from(
      { length: 30 },
      (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`,
    )
    const variants = new Set(dateKeys.map((dateKey) => getDailyCompanionVariant('cat', dateKey)))

    expect(variants.size).toBeGreaterThanOrEqual(4)
  })
})
