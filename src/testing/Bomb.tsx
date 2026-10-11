export function Bomb(): never {
  throw new Error('Bomb: intentional render failure for tests/stories')
}
