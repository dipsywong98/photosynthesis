import { System } from 'ecsy'
import TreeComponent from '../components/TreeComponent'
import { getObject } from '../../3d/assets'
import { TREE_MODELS } from '../../3d/constants'

export default class TreeSystem extends System {
  execute (delta: number, time: number): void {
    if ((this.queries.trees.added?.length ?? 0) > 0) {
      console.log('Added tree at ' + time.toString());

      (this.queries.trees.added ?? []).forEach(entity => {
        const treeComp = entity.getMutableComponent(TreeComponent)
        if (treeComp !== undefined) {
          TreeSystem.setupTreeTop(treeComp).catch(console.error)
        }
      })
    }
    (this.queries.trees.results ?? []).forEach(entity => {
      const treeComp = entity.getMutableComponent(TreeComponent)
      if (treeComp !== undefined) {
        if (treeComp.previousTreeType !== treeComp.treeType) {
          console.log('Tree type has been changed')
          TreeSystem.setupTreeTop(treeComp).catch(console.error)
        }
      }
    })
  }

  private static async setupTreeTop (treeComp: TreeComponent): Promise<void> {
    const topObj = treeComp.topObj
    topObj.children.splice(0)
    topObj.add(await getObject(TREE_MODELS[treeComp.treeType]))
    topObj.position.y = 10
    treeComp.previousTreeType = treeComp.treeType
  }
}

TreeSystem.queries = {
  trees: {
    components: [
      TreeComponent
    ],
    listen: {
      added: true,
      changed: [TreeComponent]
    }
  }
}
