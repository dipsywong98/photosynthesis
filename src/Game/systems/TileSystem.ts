import TileComponent from '../components/TileComponent'
import TreeComponent from '../components/TreeComponent'
import AxialCoordsComponent from '../components/AxialCoordsComponent'
import { ECSYThreeSystem } from 'ecsy-three'

export default class TileSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    //
  }
}

TileSystem.queries = {
  tiles: {
    components: [TileComponent]
  },
  trees: {
    components: [TreeComponent, AxialCoordsComponent]
  }
}
