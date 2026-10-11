import { describe, expect, it } from 'vitest'
import { getCompanionVisualScale } from './companionPresentation'
import { COMPANION_VARIANTS } from './companionAssets'

describe('getCompanionVisualScale', () => {
  it('可視シルエットが小さいvariant（akita）はscale>1になる', () => {
    expect(getCompanionVisualScale('akita')).toBeGreaterThan(1)
  })

  it('可視シルエットが大きいvariant（saint-bernard）はscale<1になる', () => {
    expect(getCompanionVisualScale('saint-bernard')).toBeLessThan(1)
  })

  it('baseline比率(0.38)のvariantはscale=1になる', () => {
    expect(getCompanionVisualScale('orange-tabby')).toBe(1)
  })

  it('全variantでscaleが安全範囲(0.75〜2.2)に収まる', () => {
    const allVariants = [...COMPANION_VARIANTS.dog, ...COMPANION_VARIANTS.cat]
    for (const variant of allVariants) {
      const scale = getCompanionVisualScale(variant)
      expect(scale).toBeGreaterThanOrEqual(0.75)
      expect(scale).toBeLessThanOrEqual(2.2)
    }
  })

  it('akitaは最も可視シルエット比率が小さいため、最大級のscaleになる', () => {
    expect(getCompanionVisualScale('akita')).toBeCloseTo(2.0, 1)
  })
})
