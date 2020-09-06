import { ECSYThreeWorld, initialize } from 'ecsy-three'
import { Entity } from 'ecsy'
import { WebGLRenderer } from 'three'

export default class GameWorld {
  world: ECSYThreeWorld
  sceneEntity: Entity
  messages: Record<string, unknown[]> = {}

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

  /**
   * Send and receive messages between main game logic and ECS
   * @param target Recipient
   * @param message Message to recipient
   */
  public send (target: string, message: unknown): void {
    const queue = this.messages[target] ?? []

    if (this.messages[target] === undefined) {
      this.messages[target] = queue
    }

    queue.push(message)
  }
}
