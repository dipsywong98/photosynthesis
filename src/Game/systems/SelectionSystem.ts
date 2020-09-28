import GameWorldSystem from './GameWorldSystem'
import SelectableComponent from '../components/SelectableComponent'
import { ECSYThreeObject3D, Object3DComponent } from 'ecsy-three'
import { Object3D, Raycaster } from 'three'

const isECSYObject3D = (o: Object3D): o is (Object3D & ECSYThreeObject3D) => 'entity' in o

export default class SelectionSystem extends GameWorldSystem {
  private static readonly CHECK_PERIOD = 0.05
  private secondsElapsed = 0
  private readonly raycaster = new Raycaster()

  execute (delta: number, time: number): void {
    if (!this.gameWorld.hasMouseMoved) {
      return
    }
    this.gameWorld.hasMouseMoved = false

    this.secondsElapsed += delta
    if (this.secondsElapsed >= SelectionSystem.CHECK_PERIOD) {
      this.secondsElapsed -= SelectionSystem.CHECK_PERIOD
    } else {
      return
    }

    const selectableEntities = this.queries.selectables.results
    const selectableObjs = selectableEntities
      .map(entity => entity.getObject3D<Object3D>())
      .filter((o?: Object3D & ECSYThreeObject3D): o is (Object3D & ECSYThreeObject3D) => o !== undefined)

    this.raycaster.setFromCamera(this.gameWorld.mouseScreenPosition, this.gameWorld.camera)
    const intersections = this.raycaster.intersectObjects(selectableObjs, true)

    if (intersections.length > 0) {
      const intersectedObject = intersections[0].object
      let parent: Object3D | null = intersectedObject
      let currentRef: Object3D | null = intersectedObject
      let willContinueSearch = true
      do {
        currentRef = parent
        parent = currentRef?.parent ?? null
        if (parent !== null) {
          if (isECSYObject3D(parent)) {
            willContinueSearch = parent.entity.getComponent(SelectableComponent) === undefined
          } else if (currentRef !== parent) {
            willContinueSearch = true
          }
        }
      } while (willContinueSearch)

      if (currentRef === parent) {
        console.error('currentRef cannot be parent')
      } else if (parent === null) {
        console.error('parent cannot be null')
      } else if (isECSYObject3D(parent)) {
        this.gameWorld.hoverObject = parent
      }
    } else {
      this.gameWorld.hoverObject = undefined
    }
  }
}

SelectionSystem.queries = {
  selectables: {
    components: [SelectableComponent, Object3DComponent]
  }
}
