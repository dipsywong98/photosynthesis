import { Object3DComponent } from 'ecsy-three'
import SunOrientationComponent from '../components/SunOrientationComponent'
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
    components: [SunOrientationComponent, Object3DComponent]
  }
}
