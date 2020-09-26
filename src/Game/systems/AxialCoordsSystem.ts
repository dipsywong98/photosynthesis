import AxialCoordsComponent from '../components/AxialCoordsComponent'
import { ECSYThreeSystem, Object3DComponent } from 'ecsy-three'
import { TILE_SIZE } from '../../3d/constants'

export default class AxialCoordsSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    this.queries.axialPositions.results.forEach(entity => {
      const axial = entity.getComponent(AxialCoordsComponent)?.axial
      const obj3d = entity.getObject3D()

      if (axial === undefined || obj3d === undefined) {
        return
      }

      const prevQ = (obj3d.userData.q) as number | undefined
      const prevR = (obj3d.userData.r) as number | undefined

      if (prevQ !== axial.q && prevR !== axial.r) {
        const [x, z] = axial.toCartesian(TILE_SIZE).toArray()
        obj3d.userData.q = axial.q
        obj3d.userData.r = axial.r
        obj3d.position.set(x, 0, z)
      }
    })
  }
}

AxialCoordsSystem.queries = {
  axialPositions: {
    components: [AxialCoordsComponent, Object3DComponent]
  }
}
