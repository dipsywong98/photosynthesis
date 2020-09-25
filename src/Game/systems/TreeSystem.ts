import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import {
  Color, GROUND_SHADE_DURATION,
  GROUND_SHADE_HIDDEN_ROTATION,
  GrowthStage,
  MODELS,
  SEED_MODELS,
  SHADE_Y, TREE_GROWTH_DURATION,
  TREE_GROWTH_PROPS,
  TREE_MODELS,
  TREE_TOP_Y
} from '../../3d/constants'
import { ECSYThreeEntity, Object3DComponent } from 'ecsy-three'
import { Euler, Object3D, Vector3 } from 'three'
import SunOrientationTagComponent from '../components/SunOrientationTagComponent'
import GameWorldSystem from './GameWorldSystem'
import AxialCoordsComponent from '../components/AxialCoordsComponent'
import TileComponent from '../components/TileComponent'
import { applyVector3, toEulerTween } from '../easing/applyEasing'
import jelly from '../easing/3d/jelly'
import TweenComponent from '../components/TweenComponent'
import TweenObjectProperties from '../types/TweenObjectProperties'
import linear from '../easing/3d/linear'
import SelectableTagComponent from '../components/SelectableTagComponent'

export default class TreeSystem extends GameWorldSystem {
  execute (delta: number, time: number): void {
    this.queries.trees.removed?.forEach(entity => {
      // Removed
      const treeComp = entity.getComponent(TreeComponent)
      const axialComp = entity.getComponent(AxialCoordsComponent)
      if (treeComp === undefined || axialComp === undefined) {
        return
      }

      const linkedTileComp = this.gameWorld.tileEntities.get(axialComp.axial.toString())?.getMutableComponent(TileComponent)
      if (linkedTileComp !== undefined) {
        linkedTileComp.treeEntity = undefined
      }
    })

    this.queries.trees.changed?.forEach(TreeSystem.updateGrowthStage.bind(this))

    this.queries.trees.added?.forEach((entity) => {
      // Added
      const treeComp = entity.getMutableComponent(TreeComponent)
      const axialComp = entity.getComponent(AxialCoordsComponent)
      const obj3d = entity.getObject3D()
      if (treeComp === undefined || obj3d === undefined || axialComp === undefined) {
        return
      }

      const linkedTileComp = this.gameWorld.tileEntities.get(axialComp.axial.toString())?.getMutableComponent(TileComponent)
      if (linkedTileComp !== undefined) {
        linkedTileComp.treeEntity = entity
      }

      const { color } = treeComp
      obj3d.name = 'tree-' + entity.id.toString() + '-' + Color[color]

      // setup components
      const objectsToFetch = [
        getObject(TREE_MODELS[color]),
        getObject(MODELS.TRUNK),
        getObject(SEED_MODELS[color]),
        getObject(MODELS.SHADE),
        getObject(MODELS.GROUND_SHADE)
      ]

      Promise.all(objectsToFetch).then((objs) => {
        const [
          topObj,
          trunkObj,
          seedObj,
          shadeObj,
          groundShadeObj
        ] = objs.map(o => o.clone())

        const shadeContainer = new Object3D()
        shadeContainer.name = 'shadeContainer'
        shadeContainer.add(shadeObj)
        shadeContainer.position.y = SHADE_Y[treeComp.growthStage]

        const groundShadeContainer = new Object3D()
        groundShadeContainer.name = 'groundShadeContainer'

        const treeObj = new Object3D()
        treeObj.name = 'tree'
        topObj.position.y = TREE_TOP_Y
        treeComp.topObj = topObj
        treeComp.trunkObj = trunkObj
        treeObj.add(topObj, trunkObj)

        const plantContainerObj = new Object3D()
        plantContainerObj.name = 'plantContainer'
        plantContainerObj.rotation.y = Math.random() * Math.PI * 2
        plantContainerObj.add(treeObj, seedObj)

        treeComp.plant = this.world
          .createEntity()
          .addObject3DComponent(plantContainerObj, entity)
          .addComponent(SelectableTagComponent)
        treeComp.tree = this.world
          .createEntity()
          .addObject3DComponent(treeObj, treeComp.plant)
          .addComponent(TweenComponent)
        treeComp.seed = this.world
          .createEntity()
          .addObject3DComponent(seedObj, treeComp.plant)
          .addComponent(TweenComponent)
        treeComp.shade = this.world
          .createEntity()
          .addObject3DComponent(shadeContainer, entity)
          .addComponent(SunOrientationTagComponent)
          .addComponent(TweenComponent)
        const groundShadeContainerEntity = this.world
          .createEntity()
          .addObject3DComponent(groundShadeContainer, entity)
          .addComponent(SunOrientationTagComponent)
        treeComp.groundShade = this.world
          .createEntity()
          .addObject3DComponent(groundShadeObj, groundShadeContainerEntity)
          .addComponent(TweenComponent)

        // Initialize scales and positions
        groundShadeObj.rotation.x = treeComp.growthStage === GrowthStage.SEED ? GROUND_SHADE_HIDDEN_ROTATION : 0
        shadeContainer.position.y = SHADE_Y[treeComp.growthStage]
        treeObj.scale.fromArray(TREE_GROWTH_PROPS[treeComp.growthStage].tree.scale.toArray())
        seedObj.scale.fromArray(TREE_GROWTH_PROPS[treeComp.growthStage].seed.scale.toArray())
      }).catch(console.error)
    })
  }

  private static updateGrowthStage (entity: ECSYThreeEntity): void {
    // Changed
    const treeComp = entity.getComponent(TreeComponent)
    if (treeComp === undefined) {
      return
    }

    const {
      tree,
      seed,
      shade,
      groundShade
    } = treeComp

    const treeObj = tree?.getObject3D()
    const seedObj = seed?.getObject3D()
    const shadeObj = shade?.getObject3D()
    const groundShadeObj = groundShade?.getObject3D()

    // Flexibility for animations
    if (shade !== undefined && shadeObj !== undefined) {
      TweenComponent.queueTween<TweenObjectProperties<Object3D, 'position'>>(shade, {
        duration: TREE_GROWTH_DURATION,
        loop: 1,
        value: 0,
        prop: 'position',
        from: shadeObj.position,
        to: new Vector3(0, SHADE_Y[treeComp.growthStage], 0),
        func: applyVector3(jelly)
      })
    }
    if (groundShade !== undefined && groundShadeObj !== undefined) {
      TweenComponent.queueTween<TweenObjectProperties<Object3D, 'rotation'>>(groundShade, {
        duration: GROUND_SHADE_DURATION,
        loop: 1,
        value: 0,
        prop: 'rotation',
        from: groundShadeObj.rotation,
        to: new Euler(treeComp.growthStage === GrowthStage.SEED ? GROUND_SHADE_HIDDEN_ROTATION : 0, 0, 0),
        func: toEulerTween(applyVector3(linear))
      })
    }
    if (tree !== undefined && treeObj !== undefined) {
      TweenComponent.queueTween<TweenObjectProperties<Object3D, 'scale'>>(tree, {
        duration: TREE_GROWTH_DURATION,
        loop: 1,
        value: 0,
        prop: 'scale',
        from: treeObj.scale.clone(),
        to: TREE_GROWTH_PROPS[treeComp.growthStage].tree.scale.clone(),
        func: applyVector3(jelly)
      })
    }
    if (seed !== undefined && seedObj !== undefined) {
      TweenComponent.queueTween<TweenObjectProperties<Object3D, 'scale'>>(seed, {
        duration: TREE_GROWTH_DURATION,
        loop: 1,
        value: 0,
        prop: 'scale',
        from: seedObj.scale.clone(),
        to: TREE_GROWTH_PROPS[treeComp.growthStage].seed.scale.clone(),
        func: applyVector3(jelly)
      })
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
      changed: [TreeComponent, AxialCoordsComponent]
    }
  }
}
