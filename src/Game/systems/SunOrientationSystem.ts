import { ECSYThreeSystem, ECSYThreeWorld, Object3DComponent } from 'ecsy-three'
import SunOrientationComponent from '../components/SunOrientationComponent'
import { GameWorldAttributes } from '../types/GameWorldAttributes'
import GameWorld from '../GameWorld'

export default class SunOrientationSystem extends ECSYThreeSystem {
  private readonly gameWorld: GameWorld

  constructor (world: ECSYThreeWorld, attributes?: GameWorldAttributes) {
    super(world, attributes)
    if (attributes?.gameWorld === undefined) {
      throw new Error('Game world must be provided')
    }
    this.gameWorld = attributes?.gameWorld
  }

  execute (delta: number, time: number): void {
    this.queries.sunFacingObjs.results.forEach(entity => {
      const obj3d = entity.getObject3D()
      if (obj3d === undefined) {
        return
      }
      obj3d.rotation.y = this.gameWorld.sunOrientationRad
    })
  }
}

SunOrientationSystem.queries = {
  sunFacingObjs: {
    components: [SunOrientationComponent, Object3DComponent]
  }
}
