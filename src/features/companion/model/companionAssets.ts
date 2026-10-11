import type { CompanionSpecies, CompanionState } from './companion'

const dogVariants = [
  'golden-retriever',
  'akita',
  'great-dane',
  'schnauzer',
  'saint-bernard',
  'siberian-husky',
] as const

const catVariants = [
  'orange-tabby',
  'black',
  'seal-point',
  'charcoal-tan',
  'white-longhair',
  'gray-tabby',
] as const

export type DogVariant = (typeof dogVariants)[number]
export type CatVariant = (typeof catVariants)[number]
export type CompanionVariant = DogVariant | CatVariant

export const COMPANION_VARIANTS: Record<CompanionSpecies, readonly CompanionVariant[]> = {
  dog: dogVariants,
  cat: catVariants,
}

export const REPRESENTATIVE_VARIANT: Record<CompanionSpecies, CompanionVariant> = {
  dog: 'golden-retriever',
  cat: 'orange-tabby',
}

export const VARIANT_LABEL: Record<CompanionVariant, string> = {
  'golden-retriever': 'ゴールデン・レトリバー',
  akita: '秋田犬',
  'great-dane': 'グレート・デーン',
  schnauzer: 'シュナウザー',
  'saint-bernard': 'セント・バーナード',
  'siberian-husky': 'シベリアン・ハスキー',
  'orange-tabby': '茶トラ',
  black: '黒猫',
  'seal-point': 'シールポイント',
  'charcoal-tan': 'チャコールタン',
  'white-longhair': '白長毛',
  'gray-tabby': 'サバトラ',
}

// FNV-1a。日付文字列は末尾1〜2文字しか変わらないため、単純な多項式hash（*31等）だと
// 近接する日付同士の結果が周期的なパターンになりやすい（実測で6日周期の偏りを確認）。
// FNV-1aはXOR+乗算のavalanche特性により、似た入力でも分布が崩れない。
const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

function hashToIndex(seed: string, length: number): number {
  let hash = FNV_OFFSET_BASIS
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }
  return hash % length
}

export function getDailyCompanionVariant(
  species: CompanionSpecies,
  dateKey: string,
): CompanionVariant {
  const variants = COMPANION_VARIANTS[species]
  const index = hashToIndex(`${species}:${dateKey}`, variants.length)
  // variantsは常に非空のconst配列、indexは`% length`で必ず範囲内のため、
  // このfallbackは実行時には到達しない（noUncheckedIndexedAccessを満たすためだけの保険）。
  return variants[index] ?? REPRESENTATIVE_VARIANT[species]
}

type PoseFile =
  'idle' | 'pleased' | 'pleased-2' | 'pleased-3' | 'completed' | 'review' | 'sleepy' | 'subdued'

interface StateFrameConfig {
  file: PoseFile
  frameCount: Record<CompanionSpecies, number>
  frameIndex: Record<CompanionSpecies, number>
}

const STATE_FRAMES: Record<CompanionState, StateFrameConfig> = {
  idle: { file: 'idle', frameCount: { dog: 10, cat: 10 }, frameIndex: { dog: 0, cat: 0 } },
  pleased: { file: 'pleased', frameCount: { dog: 3, cat: 4 }, frameIndex: { dog: 1, cat: 0 } },
  completed: {
    file: 'completed',
    frameCount: { dog: 10, cat: 13 },
    frameIndex: { dog: 3, cat: 4 },
  },
  review: { file: 'review', frameCount: { dog: 1, cat: 1 }, frameIndex: { dog: 0, cat: 0 } },
  sleepy: { file: 'sleepy', frameCount: { dog: 1, cat: 1 }, frameIndex: { dog: 0, cat: 0 } },
  subdued: { file: 'subdued', frameCount: { dog: 7, cat: 8 }, frameIndex: { dog: 6, cat: 7 } },
}

export function getStateFrameConfig(state: CompanionState): StateFrameConfig {
  return STATE_FRAMES[state]
}

const spriteModules = import.meta.glob<string>('../assets/{dogs,cats}/*/*.png', {
  eager: true,
  import: 'default',
})

function speciesDir(species: CompanionSpecies): 'dogs' | 'cats' {
  return species === 'dog' ? 'dogs' : 'cats'
}

export function getSpriteSheetUrl(
  species: CompanionSpecies,
  variant: CompanionVariant,
  file: PoseFile,
): string {
  const key = `../assets/${speciesDir(species)}/${variant}/${file}.png`
  const url = spriteModules[key]
  if (url === undefined) {
    throw new Error(`Companion sprite not found: ${key}`)
  }
  return url
}
