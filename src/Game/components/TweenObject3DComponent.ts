import { Component, Types } from 'ecsy'
import { Object3D } from 'three'
import { TweenProperties } from './TweenBaseComponent'

export type TweenFunction<T> = (from: T, to: T, value: number) => T

type TweenableKeys = 'position' | 'rotation' | 'scale' | 'quaternion'

// TODO tween material
export default class TweenObject3DComponent<T extends TweenableKeys>
  extends Component<TweenObject3DComponent<T>>
  implements TweenProperties<Object3D[T]> {
  prop!: T
  from!: Object3D[T]
  to!: Object3D[T]
  func!: TweenFunction<Object3D[T]>
}

TweenObject3DComponent.schema = {
  prop: { type: Types.String },
  from: { type: Types.Ref },
  to: { type: Types.Ref },
  func: { type: Types.Ref }
}
