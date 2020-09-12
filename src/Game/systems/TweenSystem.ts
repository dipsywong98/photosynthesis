import TweenBaseComponent from '../components/TweenBaseComponent'
import { ECSYThreeSystem, Object3DComponent } from 'ecsy-three'
import TweenObject3DComponent from '../components/TweenObject3DComponent'

export default class TweenSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    (this.queries.object3DTweens?.results ?? []).forEach(entity => {
      const objComp = entity.getComponent(Object3DComponent)
      const tweenComp = entity.getMutableComponent(TweenBaseComponent)
      const tweenObj3DComp = entity.getMutableComponent(TweenObject3DComponent)

      if (objComp === undefined || objComp.value === undefined || tweenComp === undefined || tweenObj3DComp === undefined) {
        return
      }

      const object3D = objComp.value

      const {
        loop,
        duration,
        value: oldValue
      } = tweenComp

      const {
        prop,
        from,
        to,
        func
      } = tweenObj3DComp

      const value = Math.min(1, delta / duration + oldValue)
      tweenComp.value = value

      const result = func(from, to, value)

      object3D[prop].fromArray(result.toArray())

      if (value === 1) {
        // Tweening is complete
        if (loop > 0) {
          // Next loop
          tweenComp.loop--
          tweenComp.value = 0
        }
        if (loop === 0) {
          // Remove component
          entity.removeComponent(TweenBaseComponent)
        }
      }
    })
  }
}

TweenSystem.queries = {
  object3DTweens: {
    components: [TweenBaseComponent, TweenObject3DComponent, Object3DComponent]
  }
}
