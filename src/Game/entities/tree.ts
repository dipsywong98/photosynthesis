import GameWorld from '../GameWorld'
import { Group, Object3D } from 'three'
import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { GrowthStage, MODELS, TREE_MODELS, TreeType } from '../../3d/constants'

export interface TreeOptions {
  treeType: TreeType
  growthStage: GrowthStage
}

export const createTree = async (gameWorld: GameWorld, { treeType, growthStage = 0 }: TreeOptions): Promise<void> => {
  const tree = new Group()
  const topObj = new Object3D()
  topObj.add(await getObject(TREE_MODELS[treeType]))
  const shade = new Object3D()
  shade.add(await getObject(MODELS.SHADE))
  const trunkObj = new Object3D()
  trunkObj.add((await getObject(MODELS.TRUNK)))
  tree.add(topObj, trunkObj, shade)

  gameWorld.world
    .createEntity()
    .addObject3DComponent(tree, gameWorld.sceneEntity)
    .addComponent(TreeComponent, {
      treeType,
      growthStage,
      topObj,
      trunkObj,
      shade
    })
}
