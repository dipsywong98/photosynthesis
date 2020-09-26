import { ECSYThreeSystem, Object3DComponent } from 'ecsy-three'
import TweenComponent from '../components/TweenComponent'
import { Object3D } from 'three'
import TweenObjectProperties from '../types/TweenObjectProperties'

export default class TweenSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    (this.queries.object3DTweens?.results ?? []).forEach(entity => {
      const obj3d = entity?.getObject3D()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tweenComp = entity.getMutableComponent<TweenComponent<TweenObjectProperties<Object3D, any>>>(TweenComponent)

      if (obj3d === undefined ||
        tweenComp === undefined) {
        return
      }

      const newTweens: typeof tweenComp.tweens = []

      tweenComp.tweens.forEach((tweenProp) => {
        if (tweenProp === undefined) {
          return
        }

        // only accepts 'scale' | 'rotation' | 'position'
        if (tweenProp.prop in ['scale', 'rotation', 'position']) {
          return
        }

        const tweenObj3dProp = tweenProp as unknown as TweenObjectProperties<Object3D, 'scale' | 'position' | 'rotation' | 'quaternion'>

        const {
          duration,
          value: oldValue,
          prop,
          from,
          to,
          func
        } = tweenObj3dProp

        const value = Math.min(1, delta / duration + oldValue)
        tweenObj3dProp.value = value

        const result = func(from, to, value)

        obj3d[prop].fromArray(result.toArray())

        if (value === 1) {
          // Tweening is complete
          if (tweenObj3dProp.loop > 0) {
            // Next loop
            tweenObj3dProp.loop--
            tweenObj3dProp.value = 0
          }
          if (tweenObj3dProp.loop === 0) {
            // Keep prop
            return
          }
        }

        newTweens.push(tweenProp)
      })

      tweenComp.tweens = newTweens
    })
  }
}

TweenSystem.queries = {
  object3DTweens: {
    components: [TweenComponent, Object3DComponent]
  }
}
