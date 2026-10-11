import type { CompanionVariant } from './companionAssets'

// idle poseのalpha bounding box実測に基づく、frame幅に対する可視シルエット幅の比率。
// 全variantでbboxがframe中心（offset 2%未満）のため、frameをscaleしoverflow:hiddenで
// 透明paddingを切り取ってもシルエットは欠けない。
const VISIBLE_WIDTH_RATIO: Record<CompanionVariant, number> = {
  'golden-retriever': 0.33,
  akita: 0.19,
  'great-dane': 0.39,
  schnauzer: 0.27,
  'saint-bernard': 0.43,
  'siberian-husky': 0.33,
  'orange-tabby': 0.38,
  black: 0.38,
  'seal-point': 0.38,
  'charcoal-tan': 0.4,
  'white-longhair': 0.38,
  'gray-tabby': 0.38,
}

const BASELINE_RATIO = 0.38

const MIN_SCALE = 0.75
const MAX_SCALE = 2.2

export function getCompanionVisualScale(variant: CompanionVariant): number {
  const ratio = VISIBLE_WIDTH_RATIO[variant]
  const raw = BASELINE_RATIO / ratio
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw))
}
