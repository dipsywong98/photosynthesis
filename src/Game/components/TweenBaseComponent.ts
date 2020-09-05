import { Component, Types } from 'ecsy'

export type TweenFunction<T> = (from: T, to: T, value: number) => T

export interface TweenProperties<T> {
  from: T
  to: T
  func: TweenFunction<T>
}

// TODO deep clone when getObject
// TODO tween material
export default class TweenBaseComponent<T> extends Component<TweenBaseComponent<T>> {
  loop!: number
  duration!: number
  value!: number
}

TweenBaseComponent.schema = {
  loop: { type: Types.Number, default: 1 },
  duration: { type: Types.Number },
  value: { type: Types.Number, default: 0 }
}
