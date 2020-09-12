import { System } from 'ecsy'
import AxialCoordsComponent from '../components/AxialCoordsComponent'
import { Object3DComponent } from 'ecsy-three'
import { TILE_SIZE } from '../../3d/constants'

export default class AxialCoordsSystem extends System {
  execute (delta: number, time: number): void {
    this.queries.axialPositions.results.forEach(entity => {
      const axialCoordsComp = entity.getComponent(AxialCoordsComponent)
      const obj3dComp = entity.getComponent(Object3DComponent)
      const obj3d = obj3dComp?.value

      if (axialCoordsComp === undefined || obj3d === undefined) {
        return
      }

      const [x, z] = axialCoordsComp.position.toCartesian(TILE_SIZE).toArray()

      obj3d.position.set(x, 0, z)
    })
  }
}

AxialCoordsSystem.queries = {
  axialPositions: {
    components: [AxialCoordsComponent, Object3DComponent]
  }
}
