import { ECSYThreeSystem, Object3DComponent } from 'ecsy-three'
import TweenComponent from '../components/TweenComponent'
import { Object3D } from 'three'
import TweenObjectProperties from '../types/TweenObjectProperties'
import TweenTargetComponent from '../components/TweenTargetComponent'

export default class TweenSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    this.queries.object3DTweens.results.forEach(entity => {
      const obj3d = entity?.getObject3D()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tweenComp = entity.getMutableComponent<TweenComponent<TweenObjectProperties<Object3D, any>>>(TweenComponent)

      if (obj3d === undefined || tweenComp === undefined) {
        return
      }

      this.tweenTarget<Object3D, 'scale' | 'position' | 'rotation' | 'quaternion'>(
        obj3d,
        tweenComp,
        delta,
        (v, t, k) => t[k].fromArray(v.toArray())
      )
    })

    this.queries.referencedTweens.results.forEach(entity => {
      const target = entity?.getComponent<TweenTargetComponent<unknown>>(TweenTargetComponent)?.ref
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tweenComp = entity.getMutableComponent<TweenComponent<TweenObjectProperties<any, any>>>(TweenComponent)

      if (target === undefined || tweenComp === undefined) {
        return
      }

      // eslint-disable-next-line
      this.tweenTarget<any, any>(target, tweenComp, delta, (v, t, k) => { t[k] = v })
    })
  }

  private tweenTarget<T, K extends keyof T> (
    target: T,
    tweenComp: TweenComponent<TweenObjectProperties<T, K>>,
    delta: number,
    valueSetter: (value: T[K], target: T, key: K) => void
  ): void {
    const newTweens: typeof tweenComp.tweens = []

    tweenComp.tweens.forEach((tweenProp) => {
      if (tweenProp === undefined) {
        return
      }

      const {
        duration,
        value: oldValue,
        prop,
        from,
        to,
        func
      } = tweenProp

      const value = Math.min(1, delta / duration + oldValue)
      tweenProp.value = value

      const result = func(from, to, value)
      valueSetter(result, target, prop)

      if (value === 1) {
        tweenProp.value = 0
        // Tweening is complete
        if (tweenProp.loop > 0) {
          // Next loop
          tweenProp.loop--
        }
        if (tweenProp.loop === 0) {
          // Keep prop
          return
        }
      }

      newTweens.push(tweenProp)
    })

    tweenComp.tweens = newTweens
  }
}

TweenSystem.queries = {
  object3DTweens: {
    components: [TweenComponent, Object3DComponent]
  },
  referencedTweens: {
    components: [TweenComponent, TweenTargetComponent]
  }
}
