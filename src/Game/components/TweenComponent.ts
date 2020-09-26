import { Component, Entity, Types } from 'ecsy'
import TweenProperties from '../types/TweenProperties'

// TODO deep clone when getObject
// TODO tween material
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class TweenComponent<T extends TweenProperties<any>> extends Component<TweenComponent<T>> {
  tweens: T[] = []

  reset (): void {
    super.reset()
    this.tweens = []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static queueTween<T extends TweenProperties<any>> (entity: Entity, tween: T): void {
    entity.getMutableComponent<TweenComponent<T>>(TweenComponent)?.tweens.push(tween)
    // console.log(entity.id, tween)
  }
}

TweenComponent.schema = {
  tweens: { type: Types.Array, default: [] }
}
