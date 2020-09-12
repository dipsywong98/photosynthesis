export default interface Coordinates<T> {
  readonly asArray: number[]
  readonly asString: string

  add: (t: T) => T
  scale: (n: number) => T
}
