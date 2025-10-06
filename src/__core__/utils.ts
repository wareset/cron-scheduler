// export function hasOwnProperty<O extends {}, K extends PropertyKey>(
//   obj: O,
//   key: K
// ): obj is O & Record<K, any> {
//   return Object.prototype.hasOwnProperty.call(obj, key)
// }

export function throwError(error: string): never {
  const e = new Error(error)
  e.name = 'CronError'
  throw e
}

// /*@__NO_SIDE_EFFECTS__*/
export function integerMinMax(value: number, min: number, max: number) {
  return (value * (max - min) + min) | 0
}

// https://github.com/zeh/prando/blob/main/src/Prando.ts
function xorShift(value: number): number {
  value ^= value << 13
  value ^= value >> 17
  value ^= value << 5
  return value
}
/*@__NO_SIDE_EFFECTS__*/
export function createSeededRandom(seed?: number) {
  ;(seed && isFinite(seed)) || (seed = 1)
  return function () {
    seed = xorShift(seed!)
    return (seed + 2147483648) / 4294967296
    // return (((seed + 2147483648) / 4294967296) * (max - min) + min) | 0
  }
}
