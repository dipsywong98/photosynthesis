export type TweenValueMapper<T> = (from: T, to: T, value: T) => T

export type EasingFunction<T> = (i: number) => T
