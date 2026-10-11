import { describe, expect, it } from 'vitest'
import { getCompanionAtmospherePreset } from './companionAtmosphere'
import { COMPANION_VARIANTS } from './companionAssets'

describe('getCompanionAtmospherePreset', () => {
  it('寒色・極端に暗い毛色のvariantはbutterを返す', () => {
    expect(getCompanionAtmospherePreset('schnauzer')).toBe('butter')
    expect(getCompanionAtmospherePreset('siberian-husky')).toBe('butter')
    expect(getCompanionAtmospherePreset('black')).toBe('butter')
  })

  it('暖色・中立系の毛色のvariantはpowder-blueを返す', () => {
    expect(getCompanionAtmospherePreset('golden-retriever')).toBe('powder-blue')
    expect(getCompanionAtmospherePreset('orange-tabby')).toBe('powder-blue')
    expect(getCompanionAtmospherePreset('white-longhair')).toBe('powder-blue')
  })

  it('すべてのvariantに対しpresetを返す（未定義を残さない）', () => {
    const allVariants = [...COMPANION_VARIANTS.dog, ...COMPANION_VARIANTS.cat]
    for (const variant of allVariants) {
      expect(['powder-blue', 'butter']).toContain(getCompanionAtmospherePreset(variant))
    }
  })
})
