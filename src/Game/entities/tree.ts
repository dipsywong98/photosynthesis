import GameWorld from '../GameWorld'
import { Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { Color, GrowthStage } from '../../3d/constants'
import { Axial } from '../../3d/Coordinates/Axial'
import AxialCoordsComponent from '../components/AxialCoordsComponent'
import { ECSYThreeEntity } from 'ecsy-three'

export interface TreeOptions {
  color: Color
  growthStage: GrowthStage
  axial: Axial
}

export const createTree = (gameWorld: GameWorld, { color, growthStage, axial }: TreeOptions): ECSYThreeEntity | undefined => {
  const tree = new Object3D()

  const tileEntity = gameWorld.tileEntities.get(axial.toString())

  if (tileEntity === undefined) {
    console.error('Tile not found: ' + axial.toString())
    return
  }

  return gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.gameEntity)
    .addComponent(TreeComponent, {
      color,
      growthStage
    })
    .addComponent(AxialCoordsComponent, {
      axial
    })
}
