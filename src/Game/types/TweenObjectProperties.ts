import TweenProperties from './TweenProperties'

export type TweenFunction<T> = (from: T, to: T, value: number) => T

export default interface TweenObjectProperties<T, K extends keyof T> extends TweenProperties<T[K]> {
  prop: K
}
