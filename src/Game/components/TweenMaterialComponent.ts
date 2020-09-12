import { Component, Types } from 'ecsy'
import { Material } from 'three'
import { TweenProperties } from './TweenBaseComponent'

export type TweenFunction<T> = (from: T, to: T, value: number) => T

// TODO tween material
export default class TweenMaterialComponent<T extends Material>
  extends Component<TweenMaterialComponent<T>>
  implements TweenProperties<number> {
  from!: number
  to!: number
  func!: TweenFunction<number>
}

TweenMaterialComponent.schema = {
  from: { type: Types.Ref },
  to: { type: Types.Ref },
  func: { type: Types.Ref }
}
