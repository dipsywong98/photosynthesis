import GameWorld from '../GameWorld'
import { Group, Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { GrowthStage, MODELS, TREE_MODELS, Color } from '../../3d/constants'

export interface TreeOptions {
  color: Color
  growthStage: GrowthStage
}

export const createTree = async (gameWorld: GameWorld, { color, growthStage = 0 }: TreeOptions): Promise<void> => {
  const tree = new Group()
  const topObj = new Object3D()
  topObj.add((await getObject(TREE_MODELS[color])).clone())
  const shade = new Object3D()
  shade.add(await getObject(MODELS.SHADE))
  const trunkObj = new Object3D()
  trunkObj.add((await getObject(MODELS.TRUNK)).clone())
  tree.add(topObj, trunkObj, shade)

  gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.sceneEntity)
    .addComponent(TreeComponent, {
      color,
      growthStage,
      topObj,
      trunkObj,
      shadeObj: shade
    })
}
