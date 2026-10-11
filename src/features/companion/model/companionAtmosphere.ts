import type { CompanionVariant } from './companionAssets'

export type AtmospherePreset = 'powder-blue' | 'butter'

// 毛色の実測（luminance/hue/saturation）に基づき、companionとの視覚的分離を最優先で選定。
// 寒色・低彩度・極端に暗い毛色はPowder Blueとhueが衝突/輝度差不足のためButterを割り当てる。
const BUTTER_PRESET_VARIANTS: ReadonlySet<CompanionVariant> = new Set([
  'schnauzer',
  'siberian-husky',
  'black',
])

export function getCompanionAtmospherePreset(variant: CompanionVariant): AtmospherePreset {
  return BUTTER_PRESET_VARIANTS.has(variant) ? 'butter' : 'powder-blue'
}
