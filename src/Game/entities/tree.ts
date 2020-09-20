import GameWorld from '../GameWorld'
import { Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { Color, GrowthStage } from '../../3d/constants'
import { Axial } from '../../3d/Coordinates/Axial'
import AxialCoordsComponent from '../components/AxialCoordsComponent'

export interface TreeOptions {
  color: Color
  growthStage: GrowthStage
  axial: Axial
}

export const createTree = (gameWorld: GameWorld, { color, growthStage, axial }: TreeOptions): void => {
  const tree = new Object3D()

  const tileEntity = gameWorld.tileEntities.get(axial.toString())

  if (tileEntity === undefined) {
    console.error('Tile not found: ' + axial.toString())
    return
  }

  gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.sceneEntity)
    .addComponent(TreeComponent, {
      color,
      growthStage
    })
    .addComponent(AxialCoordsComponent, {
      axial
    })
}
