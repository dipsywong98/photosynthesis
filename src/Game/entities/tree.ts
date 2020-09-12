import GameWorld from '../GameWorld'
import { Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { Color, GrowthStage } from '../../3d/constants'

export interface TreeOptions {
  color: Color
  growthStage: GrowthStage
}

export const createTree = (gameWorld: GameWorld, { color, growthStage = 0 }: TreeOptions): void => {
  const tree = new Object3D()

  gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.sceneEntity)
    .addComponent(TreeComponent, {
      color,
      growthStage
    })
}
