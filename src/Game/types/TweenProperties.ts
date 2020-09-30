export type TweenFunction<T> = (from: T, to: T, value: number) => T

export default interface TweenProperties<T> {
  loop: number
  duration: number
  value: number
  from: T
  to: T
  func: TweenFunction<T>
  id?: string
}
