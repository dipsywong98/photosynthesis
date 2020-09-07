import { System } from 'ecsy'
import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { Color, MODELS, SEED_MODELS, SHADE_Y, TREE_GROWTH_PROPS, TREE_MODELS, TREE_TOP_Y } from '../../3d/constants'
import { Object3DComponent } from 'ecsy-three'
import { Object3D } from 'three'

export default class TreeSystem extends System {
  execute (delta: number, time: number): void {
    this.queries.trees.added?.forEach((entity) => {
      // Added
      const treeComp = entity.getMutableComponent(TreeComponent)
      const objComp = entity.getMutableComponent(Object3DComponent)
      if (treeComp === undefined || objComp === undefined) {
        return
      }
      const { color } = treeComp
      const obj3d = objComp.value ?? new Object3D()
      if (objComp.value === undefined) {
        objComp.value = obj3d
      }
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
        shadeObj.name = 'shade'
        shadeObj.add(objs[3])
        shadeObj.position.y = SHADE_Y[treeComp.growthStage]
        treeComp.shadeObj = shadeObj

        const treeObj = new Object3D()
        treeComp.treeObj = treeObj
        treeObj.name = 'tree-' + Color[color] + '-' + entity.id.toString()
        topObj.position.y = TREE_TOP_Y
        treeComp.topObj = topObj
        treeComp.trunkObj = trunkObj
        treeObj.add(topObj, trunkObj)

        treeComp.seedObj = seedObj

        obj3d.add(treeObj, seedObj, shadeObj)
      }).catch(console.error)
    })

    this.queries.trees.changed?.forEach((entity) => {
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
      if (shadeObj !== null) {
        shadeObj.position.y = SHADE_Y[treeComp.growthStage]
      }
      if (treeObj !== null) {
        treeObj.scale.set(...TREE_GROWTH_PROPS[treeComp.growthStage].tree.scale)
      }
      if (seedObj !== null) {
        seedObj.scale.set(...TREE_GROWTH_PROPS[treeComp.growthStage].seed.scale)
      }
    })

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
      changed: [TreeComponent]
    }
  }
}
