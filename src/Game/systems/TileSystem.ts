import { System } from 'ecsy'
import TileComponent from '../components/TileComponent'
import TreeComponent from '../components/TreeComponent'
import AxialCoordsComponent from '../components/AxialCoordsComponent'

export default class TileSystem extends System {
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
