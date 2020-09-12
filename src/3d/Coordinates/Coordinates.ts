export default interface Coordinates<T> {
  toArray: () => number[]
  toString: () => string
  add: (t: T) => T
  scale: (n: number) => T
}
