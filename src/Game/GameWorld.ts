import { ECSYThreeWorld, initialize } from 'ecsy-three'
import { Entity } from 'ecsy'
import { WebGLRenderer } from 'three'

export default class GameWorld {
  world: ECSYThreeWorld
  sceneEntity: Entity

  constructor (world: ECSYThreeWorld, sceneEntity: Entity) {
    this.world = world
    this.sceneEntity = sceneEntity
  }

  public reset (renderer: WebGLRenderer): void {
    this.world.stop()
    initialize(this.world, {
      renderer
    })
  }
}
