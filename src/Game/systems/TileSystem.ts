import TileComponent from '../components/TileComponent'
import { ECSYThreeSystem } from 'ecsy-three'
import { COLOR_VALUES, INACTIVE_COLOR } from '../../3d/constants'
import TreeComponent from '../components/TreeComponent'

export default class TileSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    this.queries.tiles.results.forEach(entity => {
      const tileComp = entity.getComponent<TileComponent>(TileComponent)

      if (tileComp === undefined || tileComp.material === undefined) {
        return
      }

      let newColor: number

      if (tileComp.treeEntity !== undefined) {
        const treeComp = tileComp.treeEntity.getComponent(TreeComponent)

        if (treeComp === undefined) {
          return
        }

        newColor = COLOR_VALUES[treeComp.color]
      } else {
        newColor = INACTIVE_COLOR
      }

      if (newColor !== tileComp.material.color.getHex()) {
        tileComp.material.color.setHex(newColor)
      }
    })
  }
}

TileSystem.queries = {
  tiles: {
    components: [TileComponent]
  }
}
