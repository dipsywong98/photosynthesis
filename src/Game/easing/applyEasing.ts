import { TweenFunction } from '../types/TweenObjectProperties'
import { EasingFunction, TweenValueMapper } from '../types/Easing'
import { Euler, Vector2, Vector3 } from 'three'

const applyEasing = <T> (mapper: TweenValueMapper<T>) =>
  (func: EasingFunction<T>): TweenFunction<T> =>
    (from: T, to: T, value: number) =>
      mapper(from, to, func(value))

export const applyNumber = applyEasing<number>(
  (from, to, value) => to * value + from * (1 - value)
)

export const applyVector3 = applyEasing<Vector3>(
  (from, to, value) =>
    to.clone().multiply(value).sub(from.clone().multiply(value.clone().subScalar(1)))
)

export const applyVector2 = applyEasing<Vector2>(
  (from, to, value) =>
    to.clone().multiply(value).sub(from.clone().multiply(value.clone().subScalar(1)))
)

export const toEulerTween = (func: TweenFunction<Vector3>): TweenFunction<Euler> =>
  (from, to, value) => new Euler().setFromVector3(func(from.toVector3(), to.toVector3(), value))
