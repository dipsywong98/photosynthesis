import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { Color, MODELS, SEED_MODELS, SHADE_Y, TREE_GROWTH_PROPS, TREE_MODELS, TREE_TOP_Y } from '../../3d/constants'
import { ECSYThreeEntity, ECSYThreeSystem, Object3DComponent } from 'ecsy-three'
import { Object3D } from 'three'
import SunOrientationComponent from '../components/SunOrientationComponent'

export default class TreeSystem extends ECSYThreeSystem {
  execute (delta: number, time: number): void {
    this.queries.trees.added?.forEach((entity) => {
      // Added
      const treeComp = entity.getMutableComponent(TreeComponent)
      const obj3d = entity.getObject3D()
      if (treeComp === undefined || obj3d === undefined) {
        return
      }
      const { color } = treeComp
      obj3d.name = 'tree-' + entity.id.toString() + '-' + Color[color]

      // setup components
      const objectsToFetch = [
        getObject(TREE_MODELS[color]),
        getObject(MODELS.TRUNK),
        getObject(SEED_MODELS[color]),
        getObject(MODELS.SHADE)
      ]

      Promise.all(objectsToFetch).then((objs) => {
        const [
          topObj,
          trunkObj,
          seedObj
        ] = objs.map(o => o.clone())

        const shadeObj = new Object3D()
        shadeObj.name = 'shadeContainer'
        shadeObj.add(objs[3])
        shadeObj.position.y = SHADE_Y[treeComp.growthStage]
        const shadeEntity = this.world
          .createEntity()
          .addComponent(Object3DComponent, { value: shadeObj })
          .addComponent(SunOrientationComponent)
        treeComp.shadeObj = shadeObj
        treeComp.shadeEntity = shadeEntity

        const treeObj = new Object3D()
        treeComp.treeObj = treeObj
        treeObj.name = 'tree'
        topObj.position.y = TREE_TOP_Y
        treeComp.topObj = topObj
        treeComp.trunkObj = trunkObj
        treeObj.add(topObj, trunkObj)

        treeComp.seedObj = seedObj

        const plantContainerObj = new Object3D()
        plantContainerObj.name = 'plantContainer'
        plantContainerObj.rotation.y = Math.random() * Math.PI * 2
        plantContainerObj.add(treeObj, seedObj)

        obj3d.add(plantContainerObj, shadeObj)

        TreeSystem.updateGrowthStage(entity)
      }).catch(console.error)
    })

    this.queries.trees.changed?.forEach(TreeSystem.updateGrowthStage.bind(this))

    this.queries.trees.results.forEach((entity) => {
      // Always
      const treeComp = entity.getComponent(TreeComponent)
      if (treeComp === undefined) {
        return
      }
      // Set visibility
      const {
        treeObj,
        seedObj
      } = treeComp

      if (treeObj?.scale.lengthSq() === 0) {
        treeObj.visible = false
      }

      if (seedObj?.scale.lengthSq() === 0) {
        seedObj.visible = false
      }
    })

    this.queries.trees.removed?.forEach((entity) => {
      // Removed
      const treeComp = entity.getComponent(TreeComponent)
      if (treeComp === undefined) {
        return
      }
      treeComp.shadeEntity?.remove()
    })
  }

  private static updateGrowthStage (entity: ECSYThreeEntity): void {
    // Changed
    const treeComp = entity.getMutableComponent(TreeComponent)
    if (treeComp === undefined) {
      return
    }

    const {
      treeObj,
      seedObj,
      shadeObj
    } = treeComp

    // Flexibility for animations
    if (shadeObj !== undefined) {
      shadeObj.position.y = SHADE_Y[treeComp.growthStage]
    }
    if (treeObj !== undefined) {
      treeObj.scale.set(...TREE_GROWTH_PROPS[treeComp.growthStage].tree.scale)
    }
    if (seedObj !== undefined) {
      seedObj.scale.set(...TREE_GROWTH_PROPS[treeComp.growthStage].seed.scale)
    }
  }
}

/*
Growth stages:
0: seed model, scale = 1 easeInOutBack => tree model scale 0 grow out, seed shrink
1: tree model, scale = 0.33 easeInOutBack
2: tree model, scale = 0.66 easeInOutBack
3: tree model, scale = 1 easeInOutBack
 */

TreeSystem.queries = {
  trees: {
    components: [
      TreeComponent, Object3DComponent
    ],
    listen: {
      added: true,
      removed: true,
      changed: [TreeComponent]
    }
  }
}
