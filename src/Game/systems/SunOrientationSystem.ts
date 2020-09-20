import { Object3DComponent } from 'ecsy-three'
import SunOrientationTagComponent from '../components/SunOrientationTagComponent'
import GameWorldSystem from './GameWorldSystem'

export default class SunOrientationSystem extends GameWorldSystem {
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
    components: [SunOrientationTagComponent, Object3DComponent]
  }
}
